export const socialConfig = {
  enabled: process.env.NEXT_PUBLIC_SOCIAL_ENABLED !== "false",
  draftEnabled: process.env.NEXT_PUBLIC_SOCIAL_DRAFT_ENABLED === "true"
} as const;
