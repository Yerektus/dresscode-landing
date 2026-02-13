export const SOCIAL_DEFAULT_PAGE_SIZE = 20;

export const SOCIAL_LIMITS = {
  lookTitleMax: 70,
  lookDescriptionMax: 280,
  commentBodyMax: 400,
  maxTags: 5,
  maxImageSizeBytes: 5 * 1024 * 1024
} as const;

export const SOCIAL_TABS = ["looks", "followers", "following"] as const;

export type SocialTab = (typeof SOCIAL_TABS)[number];

export const isSocialTab = (value: string | null): value is SocialTab => {
  return value === "looks" || value === "followers" || value === "following";
};
