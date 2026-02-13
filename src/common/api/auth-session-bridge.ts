import type { AuthResponse } from "@/common/api/responses/auth.response";

interface AuthSessionBridge {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setAuthSession: (session: AuthResponse) => void;
  clearAuthSession: () => void;
}

const noop = () => null;
const noopVoid = () => undefined;

let bridge: AuthSessionBridge = {
  getAccessToken: noop,
  getRefreshToken: noop,
  setAuthSession: noopVoid,
  clearAuthSession: noopVoid
};

export const configureAuthSessionBridge = (incoming: AuthSessionBridge): void => {
  bridge = incoming;
};

export const authSessionBridge = {
  getAccessToken: () => bridge.getAccessToken(),
  getRefreshToken: () => bridge.getRefreshToken(),
  setAuthSession: (session: AuthResponse) => bridge.setAuthSession(session),
  clearAuthSession: () => bridge.clearAuthSession()
};
