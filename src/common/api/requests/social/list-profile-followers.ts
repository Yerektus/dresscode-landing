import { mapCursorPageResponse, mapSocialProfileResponse } from "@/common/api/mappers/social.mapper";
import type { CursorPageResponse, SocialProfileResponse } from "@/common/api/responses/social.response";
import { request } from "@/common/api/request";
import type { CursorPage } from "@/common/entities/social/cursor-page";
import type { SocialProfile } from "@/common/entities/social/social-profile";
import type { CursorPaginationPayload } from "@/common/api/requests/social/social.request-types";
import { withCursorQuery } from "@/common/api/requests/social/social.request-types";

export const listProfileFollowers = async (
  userId: string,
  payload?: CursorPaginationPayload
): Promise<CursorPage<SocialProfile>> => {
  const query = withCursorQuery(payload);
  const response = await request.get<CursorPageResponse<SocialProfileResponse>>(
    `/api/v1/social/profiles/${userId}/followers${query}`
  );

  return mapCursorPageResponse(response.data, mapSocialProfileResponse);
};
