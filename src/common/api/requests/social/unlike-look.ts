import { mapSocialLookResponse } from "@/common/api/mappers/social.mapper";
import type { SocialLookResponse } from "@/common/api/responses/social.response";
import { request } from "@/common/api/request";
import type { SocialLook } from "@/common/entities/social/social-look";

export const unlikeLook = async (lookId: string): Promise<SocialLook> => {
  const response = await request.delete<SocialLookResponse>(`/api/v1/social/looks/${lookId}/likes`);
  return mapSocialLookResponse(response.data);
};
