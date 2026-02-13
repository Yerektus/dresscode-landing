import type { SocialUser } from "@/common/entities/social/social-user";

export type SocialLookVisibility = "public" | "followers" | "private";

export interface SocialLook {
  id: string;
  author: SocialUser;
  imageUrl: string;
  title: string;
  description: string;
  tags: string[];
  style: string;
  visibility: SocialLookVisibility;
  likesCount: number;
  commentsCount: number;
  isLikedByMe: boolean;
  createdAt: string;
}

export interface CreateSocialLookPayload {
  image: Blob;
  title: string;
  description: string;
  tags: string[];
  style: string;
  visibility: SocialLookVisibility;
}
