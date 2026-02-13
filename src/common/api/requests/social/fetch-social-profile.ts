import { mapSocialProfileResponse } from "@/common/api/mappers/social.mapper";
import type { SocialProfileResponse } from "@/common/api/responses/social.response";
import type { SocialProfile } from "@/common/entities/social/social-profile";
import { request } from "@/common/api/request";

export const fetchSocialProfile = async (userId: string): Promise<SocialProfile> => {
  const response = await request.get<SocialProfileResponse>(`/api/v1/social/profiles/${userId}`);
  return mapSocialProfileResponse(response.data);
};
