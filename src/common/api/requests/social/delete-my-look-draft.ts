import { request } from "@/common/api/request";

export const deleteMyLookDraft = async (): Promise<void> => {
  await request.delete("/api/v1/social/look-drafts/me");
};
