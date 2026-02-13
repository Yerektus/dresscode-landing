import { mapSocialLookResponse } from "@/common/api/mappers/social.mapper";
import type { SocialLookResponse } from "@/common/api/responses/social.response";
import { request } from "@/common/api/request";
import type { SocialLook } from "@/common/entities/social/social-look";

export const fetchLook = async (lookId: string): Promise<SocialLook> => {
  const response = await request.get<SocialLookResponse>(`/api/v1/social/looks/${lookId}`);
  return mapSocialLookResponse(response.data);
};
