import type { AuthResponse } from "@/common/api/responses/auth.response";
import type { AuthSession } from "@/common/entities/auth-session";

export const mapAuthResponseToSession = (response: AuthResponse): AuthSession => {
  return {
    user: response.user,
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    accessExpiresIn: response.accessExpiresIn
  };
};
