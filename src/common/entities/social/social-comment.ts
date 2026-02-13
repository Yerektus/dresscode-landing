import type { SocialUser } from "@/common/entities/social/social-user";

export interface SocialComment {
  id: string;
  lookId: string;
  author: SocialUser;
  body: string;
  parentId: string | null;
  createdAt: string;
  repliesCount: number;
  isLikedByMe: boolean;
  likesCount: number;
  canDelete: boolean;
}

export interface CreateSocialCommentPayload {
  lookId: string;
  body: string;
  parentId?: string | null;
}
