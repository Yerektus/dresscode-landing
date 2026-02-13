import { mapSocialProfileResponse } from "@/common/api/mappers/social.mapper";
import type { SocialProfileResponse } from "@/common/api/responses/social.response";
import type { SocialProfile } from "@/common/entities/social/social-profile";
import { request } from "@/common/api/request";

export interface UpdateMySocialProfilePayload {
  displayName?: string;
  bio?: string;
  avatarUrl?: string | null;
}

export const updateMySocialProfile = async (
  payload: UpdateMySocialProfilePayload
): Promise<SocialProfile> => {
  const response = await request.patch<SocialProfileResponse>(
    "/api/v1/social/profiles/me",
    payload
  );

  return mapSocialProfileResponse(response.data);
};
