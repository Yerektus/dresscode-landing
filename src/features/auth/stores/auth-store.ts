"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storageKeys } from "@/common/constants/storage-keys";
import type { AppUser } from "@/common/entities/app-user";
import { registerUser } from "@/common/api/requests/auth/register-user";
import { loginUser } from "@/common/api/requests/auth/login-user";
import { loginWithGoogle } from "@/common/api/requests/auth/login-google";
import { fetchMe } from "@/common/api/requests/auth/fetch-me";
import { logoutUser } from "@/common/api/requests/auth/logout-user";
import { getBalance } from "@/common/api/requests/billing/get-balance";
import type { AuthSession } from "@/common/entities/auth-session";
import { getErrorMessage, toApiError } from "@/common/utils/http-error";
import { configureAuthSessionBridge } from "@/common/api/auth-session-bridge";
import type { AuthResponse } from "@/common/api/responses/auth.response";

interface AuthState {
  user: AppUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isBusy: boolean;

  initialize: () => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    displayName: string;
  }) => Promise<string | null>;
  login: (payload: { email: string; password: string }) => Promise<string | null>;
  loginWithGoogleToken: (idToken: string) => Promise<string | null>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  updateCredits: (remainingCredits: number) => void;

  setSessionFromResponse: (session: AuthResponse) => void;
  clearAuthSession: () => void;
}

const toSession = (response: AuthResponse): AuthSession => ({
  user: response.user,
  accessToken: response.accessToken,
  refreshToken: response.refreshToken,
  accessExpiresIn: response.accessExpiresIn
});

const baseClearState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false
} as const;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isInitializing: true,
      isBusy: false,

      setSessionFromResponse: (sessionResponse) => {
        const session = toSession(sessionResponse);
        set({
          user: session.user,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          isAuthenticated: true
        });
      },

      clearAuthSession: () => {
        set({
          ...baseClearState
        });
      },

      initialize: async () => {
        set({ isInitializing: true });

        if (!get().accessToken || !get().refreshToken) {
          set({ isInitializing: false, ...baseClearState });
          return;
        }

        try {
          const user = await fetchMe();
          set({ user, isAuthenticated: true });
        } catch {
          set({ ...baseClearState });
        } finally {
          set({ isInitializing: false });
        }
      },

      register: async ({ email, password, displayName }) => {
        set({ isBusy: true });
        try {
          const session = await registerUser({ email, password, displayName });
          set({
            user: session.user,
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            isAuthenticated: true
          });
          return null;
        } catch (error) {
          return getErrorMessage(error);
        } finally {
          set({ isBusy: false });
        }
      },

      login: async ({ email, password }) => {
        set({ isBusy: true });
        try {
          const session = await loginUser({ email, password });
          set({
            user: session.user,
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            isAuthenticated: true
          });
          return null;
        } catch (error) {
          return getErrorMessage(error);
        } finally {
          set({ isBusy: false });
        }
      },

      loginWithGoogleToken: async (idToken) => {
        set({ isBusy: true });
        try {
          const session = await loginWithGoogle(idToken);
          set({
            user: session.user,
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            isAuthenticated: true
          });
          return null;
        } catch (error) {
          return getErrorMessage(error);
        } finally {
          set({ isBusy: false });
        }
      },

      logout: async () => {
        set({ isBusy: true });

        try {
          const refreshToken = get().refreshToken;
          if (refreshToken) {
            await logoutUser(refreshToken);
          }
        } catch {
          // Ignore server logout failures. Local session still must be cleared.
        } finally {
          set({
            ...baseClearState,
            isBusy: false
          });
        }
      },

      refreshProfile: async () => {
        if (!get().refreshToken || !get().accessToken) {
          set({ ...baseClearState });
          return;
        }

        try {
          const user = await fetchMe();
          set({ user, isAuthenticated: true });
        } catch (error) {
          const parsed = toApiError(error);
          if (parsed.status === 401) {
            set({ ...baseClearState });
          }
        }
      },

      refreshBalance: async () => {
        if (!get().user) {
          return;
        }

        try {
          const balance = await getBalance();
          const user = get().user;
          if (!user) {
            return;
          }

          set({
            user: {
              ...user,
              creditsBalance: balance
            }
          });
        } catch {
          // Ignore balance refresh failures.
        }
      },

      updateCredits: (remainingCredits) => {
        const user = get().user;
        if (!user) {
          return;
        }

        set({
          user: {
            ...user,
            creditsBalance: remainingCredits
          }
        });
      }
    }),
    {
      name: storageKeys.authSession,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

configureAuthSessionBridge({
  getAccessToken: () => useAuthStore.getState().accessToken,
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  setAuthSession: (session) => useAuthStore.getState().setSessionFromResponse(session),
  clearAuthSession: () => useAuthStore.getState().clearAuthSession()
});
