import { request } from "@/common/api/request";

export const logoutUser = async (refreshToken: string): Promise<void> => {
  await request.post("/api/v1/auth/logout", { refreshToken });
};
