import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { apiConfig } from "@/common/config/api.config";
import type { AuthResponse } from "@/common/api/responses/auth.response";
import { authSessionBridge } from "@/common/api/auth-session-bridge";
import { SingleFlight } from "@/common/utils/single-flight";

interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const ACCESS_REFRESH_SKEW_SECONDS = 30;

const withApiPrefix = (url?: string): string => {
  if (!url) {
    return "/";
  }

  const trimmed = url.startsWith("/") ? url : `/${url}`;
  return trimmed;
};

export const request = axios.create({
  baseURL: apiConfig.apiUrl,
  headers: {
    "Content-Type": "application/json"
  }
});

const refreshClient = axios.create({
  baseURL: apiConfig.apiUrl,
  headers: {
    "Content-Type": "application/json"
  }
});

let refreshInFlight: Promise<string | null> | null = null;
const refreshSingleFlight = new SingleFlight<string | null>();

const isRefreshRequest = (url?: string): boolean =>
  withApiPrefix(url).includes("/api/v1/auth/refresh");

const isNonRetryAuthRequest = (url?: string): boolean => {
  const normalized = withApiPrefix(url);
  return (
    normalized.includes("/api/v1/auth/login") ||
    normalized.includes("/api/v1/auth/register") ||
    normalized.includes("/api/v1/auth/google") ||
    normalized.includes("/api/v1/auth/logout")
  );
};

const decodeBase64Url = (value: string): string | null => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddingLength = normalized.length % 4;
  const padded =
    paddingLength === 0 ? normalized : `${normalized}${"=".repeat(4 - paddingLength)}`;

  try {
    if (typeof globalThis.atob === "function") {
      return globalThis.atob(padded);
    }
    if (typeof Buffer !== "undefined") {
      return Buffer.from(padded, "base64").toString("utf-8");
    }
  } catch {
    return null;
  }

  return null;
};

const getJwtExpSeconds = (token: string): number | null => {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  const payloadRaw = decodeBase64Url(parts[1]);
  if (!payloadRaw) {
    return null;
  }

  try {
    const payload = JSON.parse(payloadRaw) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
};

const isAccessTokenExpiringSoon = (token: string): boolean => {
  const exp = getJwtExpSeconds(token);
  if (!exp) {
    return false;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  return exp - nowSeconds <= ACCESS_REFRESH_SKEW_SECONDS;
};

const runRefreshFlow = async (): Promise<string | null> => {
  const refreshToken = authSessionBridge.getRefreshToken();

  if (!refreshToken) {
    authSessionBridge.clearAuthSession();
    return null;
  }

  try {
    const response = await refreshClient.post<AuthResponse>(
      "/api/v1/auth/refresh",
      { refreshToken }
    );

    authSessionBridge.setAuthSession(response.data);
    return response.data.accessToken;
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    if (status === 400 || status === 401) {
      authSessionBridge.clearAuthSession();
    }
    return null;
  }
};

request.interceptors.request.use(async (config) => {
  const skipProactiveRefresh = isRefreshRequest(config.url) || isNonRetryAuthRequest(config.url);
  let token = authSessionBridge.getAccessToken();

  if (!skipProactiveRefresh && token && isAccessTokenExpiringSoon(token)) {
    if (!refreshInFlight) {
      refreshInFlight = refreshSingleFlight.run(runRefreshFlow);
    }

    const nextAccessToken = await refreshInFlight.finally(() => {
      refreshInFlight = null;
    });

    if (nextAccessToken) {
      token = nextAccessToken;
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

request.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status as number | undefined;
    const originalConfig = error?.config as RetryAxiosRequestConfig | undefined;

    if (!originalConfig || status !== 401 || originalConfig._retry) {
      return Promise.reject(error);
    }

    if (isRefreshRequest(originalConfig.url) || isNonRetryAuthRequest(originalConfig.url)) {
      return Promise.reject(error);
    }

    originalConfig._retry = true;

    if (!refreshInFlight) {
      refreshInFlight = refreshSingleFlight.run(runRefreshFlow);
    }

    const nextAccessToken = await refreshInFlight.finally(() => {
      refreshInFlight = null;
    });

    if (!nextAccessToken) {
      return Promise.reject(error);
    }

    originalConfig.headers.Authorization = `Bearer ${nextAccessToken}`;

    return request(originalConfig);
  }
);
