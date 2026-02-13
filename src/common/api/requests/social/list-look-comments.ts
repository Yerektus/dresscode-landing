import { mapCursorPageResponse, mapSocialCommentResponse } from "@/common/api/mappers/social.mapper";
import type { CursorPageResponse, SocialCommentResponse } from "@/common/api/responses/social.response";
import { request } from "@/common/api/request";
import type { CursorPage } from "@/common/entities/social/cursor-page";
import type { SocialComment } from "@/common/entities/social/social-comment";
import type { ListCommentsPayload } from "@/common/api/requests/social/social.request-types";

export const listLookComments = async (
  lookId: string,
  payload?: ListCommentsPayload
): Promise<CursorPage<SocialComment>> => {
  const params = new URLSearchParams();

  if (payload?.cursor) {
    params.set("cursor", payload.cursor);
  }

  if (typeof payload?.limit === "number") {
    params.set("limit", String(payload.limit));
  }

  if (typeof payload?.parentId === "string") {
    params.set("parentId", payload.parentId);
  }

  const query = params.toString();
  const response = await request.get<CursorPageResponse<SocialCommentResponse>>(
    `/api/v1/social/looks/${lookId}/comments${query ? `?${query}` : ""}`
  );

  return mapCursorPageResponse(response.data, mapSocialCommentResponse);
};
