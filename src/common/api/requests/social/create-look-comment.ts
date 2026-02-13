import { mapSocialCommentResponse } from "@/common/api/mappers/social.mapper";
import type { SocialCommentResponse } from "@/common/api/responses/social.response";
import { request } from "@/common/api/request";
import type { CreateSocialCommentPayload, SocialComment } from "@/common/entities/social/social-comment";

export const createLookComment = async (
  payload: CreateSocialCommentPayload
): Promise<SocialComment> => {
  const response = await request.post<SocialCommentResponse>(
    `/api/v1/social/looks/${payload.lookId}/comments`,
    {
      body: payload.body,
      parentId: payload.parentId ?? null
    }
  );

  return mapSocialCommentResponse(response.data);
};
