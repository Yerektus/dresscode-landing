import { mapUserResponseToUser } from "@/common/api/mappers/user.mapper";
import type { UserResponse } from "@/common/api/responses/user.response";
import type { AppUser } from "@/common/entities/app-user";
import { request } from "@/common/api/request";

export const fetchMe = async (): Promise<AppUser> => {
  const response = await request.get<UserResponse>("/api/v1/me");
  return mapUserResponseToUser(response.data);
};
