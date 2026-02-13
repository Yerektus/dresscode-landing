import type {
  CursorPageResponse,
  FollowRelationResponse,
  SocialCommentResponse,
  SocialLookDraftResponse,
  SocialLookResponse,
  SocialProfileResponse,
  SocialUserResponse
} from "@/common/api/responses/social.response";
import type { CursorPage } from "@/common/entities/social/cursor-page";
import type { FollowRelation } from "@/common/entities/social/follow-relation";
import type { SocialComment } from "@/common/entities/social/social-comment";
import type { SocialLookDraft } from "@/common/entities/social/social-look-draft";
import type { SocialLook, SocialLookVisibility } from "@/common/entities/social/social-look";
import type { SocialProfile } from "@/common/entities/social/social-profile";
import type { SocialUser } from "@/common/entities/social/social-user";

const toVisibility = (visibility: string): SocialLookVisibility => {
  if (visibility === "followers" || visibility === "private") {
    return visibility;
  }

  return "public";
};

export const mapSocialUserResponse = (response: SocialUserResponse): SocialUser => ({
  id: response.id,
  username: response.username,
  displayName: response.displayName,
  avatarUrl: response.avatarUrl ?? null
});

export const mapSocialProfileResponse = (
  response: SocialProfileResponse
): SocialProfile => ({
  ...mapSocialUserResponse(response),
  bio: response.bio ?? "",
  followersCount: response.followersCount,
  followingCount: response.followingCount,
  looksCount: response.looksCount,
  isFollowing: response.isFollowing,
  isMe: response.isMe
});

export const mapSocialLookResponse = (response: SocialLookResponse): SocialLook => ({
  id: response.id,
  author: mapSocialUserResponse(response.author),
  imageUrl: response.imageUrl,
  title: response.title,
  description: response.description ?? "",
  tags: response.tags ?? [],
  style: response.style ?? "Casual",
  visibility: toVisibility(response.visibility),
  likesCount: response.likesCount,
  commentsCount: response.commentsCount,
  isLikedByMe: response.isLikedByMe,
  createdAt: response.createdAt
});

export const mapSocialLookDraftResponse = (
  response: SocialLookDraftResponse
): SocialLookDraft => ({
  title: response.title ?? "",
  description: response.description ?? "",
  tags: response.tags ?? [],
  style: response.style ?? "Casual",
  visibility: toVisibility(response.visibility ?? "public"),
  imageUrl: response.imageUrl ?? null,
  imageDataUri: response.imageDataUri ?? null,
  updatedAt: response.updatedAt
});

export const mapSocialCommentResponse = (
  response: SocialCommentResponse
): SocialComment => ({
  id: response.id,
  lookId: response.lookId,
  author: mapSocialUserResponse(response.author),
  body: response.body,
  parentId: response.parentId ?? null,
  createdAt: response.createdAt,
  repliesCount: response.repliesCount,
  isLikedByMe: response.isLikedByMe,
  likesCount: response.likesCount,
  canDelete: response.canDelete
});

export const mapFollowRelationResponse = (
  response: FollowRelationResponse
): FollowRelation => ({
  userId: response.userId,
  isFollowing: response.isFollowing,
  followersCount: response.followersCount
});

export const mapCursorPageResponse = <TResponse, TModel>(
  response: CursorPageResponse<TResponse>,
  mapper: (item: TResponse) => TModel
): CursorPage<TModel> => {
  const items = response.items.map((item) => mapper(item));
  const nextCursor = response.nextCursor ?? null;

  return {
    items,
    nextCursor,
    hasMore: response.hasMore ?? nextCursor !== null
  };
};
