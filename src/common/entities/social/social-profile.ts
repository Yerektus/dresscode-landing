import type { SocialUser } from "@/common/entities/social/social-user";

export interface SocialProfile extends SocialUser {
  bio: string;
  followersCount: number;
  followingCount: number;
  looksCount: number;
  isFollowing: boolean;
  isMe: boolean;
}
