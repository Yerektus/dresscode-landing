import type { AppUser } from "@/common/entities/app-user";

export interface AuthResponse {
  user: AppUser;
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
}
