import type { SocialLookVisibility } from "@/common/entities/social/social-look";

export interface SocialLookDraft {
  title: string;
  description: string;
  tags: string[];
  style: string;
  visibility: SocialLookVisibility;
  imageUrl: string | null;
  imageDataUri: string | null;
  updatedAt: string;
}

export interface UpsertMyLookDraftPayload {
  title: string;
  description: string;
  tags: string[];
  style: string;
  visibility: SocialLookVisibility;
  image?: Blob;
  clearImage?: boolean;
}
