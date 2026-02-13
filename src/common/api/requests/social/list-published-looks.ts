import { mapCursorPageResponse, mapSocialLookResponse } from "@/common/api/mappers/social.mapper";
import type { CursorPageResponse, SocialLookResponse } from "@/common/api/responses/social.response";
import { request } from "@/common/api/request";
import type { CursorPage } from "@/common/entities/social/cursor-page";
import type { SocialLook } from "@/common/entities/social/social-look";
import type { CursorPaginationPayload } from "@/common/api/requests/social/social.request-types";
import { withCursorQuery } from "@/common/api/requests/social/social.request-types";

export const listPublishedLooks = async (
  payload?: CursorPaginationPayload
): Promise<CursorPage<SocialLook>> => {
  const query = withCursorQuery(payload);
  const response = await request.get<CursorPageResponse<SocialLookResponse>>(`/api/v1/social/looks${query}`);

  return mapCursorPageResponse(response.data, mapSocialLookResponse);
};
