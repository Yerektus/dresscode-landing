import { mapAuthResponseToSession } from "@/common/api/mappers/auth.mapper";
import type { AuthSession } from "@/common/entities/auth-session";
import { request } from "@/common/api/request";
import type { AuthResponse } from "@/common/api/responses/auth.response";

export const loginWithGoogle = async (idToken: string): Promise<AuthSession> => {
  const response = await request.post<AuthResponse>("/api/v1/auth/google", {
    idToken
  });

  return mapAuthResponseToSession(response.data);
};
