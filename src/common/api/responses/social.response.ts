export interface CursorPageResponse<T> {
  items: T[];
  nextCursor?: string | null;
  hasMore?: boolean;
}

export interface SocialUserResponse {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
}

export interface SocialProfileResponse extends SocialUserResponse {
  bio?: string | null;
  followersCount: number;
  followingCount: number;
  looksCount: number;
  isFollowing: boolean;
  isMe: boolean;
}

export type SocialLookVisibilityResponse = "public" | "followers" | "private";

export interface SocialLookResponse {
  id: string;
  author: SocialUserResponse;
  imageUrl: string;
  title: string;
  description?: string | null;
  tags?: string[];
  style?: string | null;
  visibility: SocialLookVisibilityResponse;
  likesCount: number;
  commentsCount: number;
  isLikedByMe: boolean;
  createdAt: string;
}

export interface SocialLookDraftResponse {
  title?: string | null;
  description?: string | null;
  tags?: string[] | null;
  style?: string | null;
  visibility?: SocialLookVisibilityResponse | null;
  imageUrl?: string | null;
  imageDataUri?: string | null;
  updatedAt: string;
}

export interface SocialCommentResponse {
  id: string;
  lookId: string;
  author: SocialUserResponse;
  body: string;
  parentId?: string | null;
  createdAt: string;
  repliesCount: number;
  isLikedByMe: boolean;
  likesCount: number;
  canDelete: boolean;
}

export interface FollowRelationResponse {
  userId: string;
  isFollowing: boolean;
  followersCount: number;
}
