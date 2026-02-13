import type { UserResponse } from "@/common/api/responses/user.response";
import type { AppUser } from "@/common/entities/app-user";

export const mapUserResponseToUser = (response: UserResponse): AppUser => ({
  ...response
});
