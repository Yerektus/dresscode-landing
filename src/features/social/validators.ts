import { SOCIAL_LIMITS } from "@/features/social/constants";

export const isValidLookTitle = (value: string): boolean => {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= SOCIAL_LIMITS.lookTitleMax;
};

export const isValidLookDescription = (value: string): boolean => {
  return value.length <= SOCIAL_LIMITS.lookDescriptionMax;
};

export const isValidCommentBody = (value: string): boolean => {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= SOCIAL_LIMITS.commentBodyMax;
};
