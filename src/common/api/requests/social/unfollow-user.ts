import { mapFollowRelationResponse } from "@/common/api/mappers/social.mapper";
import type { FollowRelationResponse } from "@/common/api/responses/social.response";
import type { FollowRelation } from "@/common/entities/social/follow-relation";
import { request } from "@/common/api/request";

export const unfollowUser = async (userId: string): Promise<FollowRelation> => {
  const response = await request.delete<FollowRelationResponse>(`/api/v1/social/follows/${userId}`);
  return mapFollowRelationResponse(response.data);
};
