import type { AppUser } from "@/common/entities/app-user";

export interface AuthSession {
  user: AppUser;
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
}
