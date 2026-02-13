import { mapAuthResponseToSession } from "@/common/api/mappers/auth.mapper";
import type { AuthSession } from "@/common/entities/auth-session";
import { request } from "@/common/api/request";
import type { AuthResponse } from "@/common/api/responses/auth.response";

export const loginUser = async (payload: {
  email: string;
  password: string;
}): Promise<AuthSession> => {
  const response = await request.post<AuthResponse>("/api/v1/auth/login", payload);
  return mapAuthResponseToSession(response.data);
};
