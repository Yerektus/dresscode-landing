export const socialQueryKeys = {
  all: ["social"] as const,
  profile: (userId: string) => ["social", "profile", userId] as const,
  looks: (userId: string) => ["social", "looks", userId] as const,
  publishedLooks: () => ["social", "looks", "published"] as const,
  followers: (userId: string) => ["social", "followers", userId] as const,
  following: (userId: string) => ["social", "following", userId] as const,
  look: (lookId: string) => ["social", "look", lookId] as const,
  publishDraft: (userId: string) => ["social", "publish-draft", userId] as const,
  comments: (lookId: string, parentId: string | null) =>
    ["social", "comments", lookId, parentId ?? "root"] as const
};
