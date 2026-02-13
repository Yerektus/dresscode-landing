import { mapSocialLookDraftResponse } from "@/common/api/mappers/social.mapper";
import type { SocialLookDraftResponse } from "@/common/api/responses/social.response";
import { request } from "@/common/api/request";
import type { SocialLookDraft, UpsertMyLookDraftPayload } from "@/common/entities/social/social-look-draft";

export const upsertMyLookDraft = async (
  payload: UpsertMyLookDraftPayload
): Promise<SocialLookDraft | null> => {
  const formData = new FormData();

  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("style", payload.style);
  formData.append("visibility", payload.visibility);

  payload.tags.forEach((tag) => {
    formData.append("tags[]", tag);
  });

  if (payload.image) {
    formData.append("image", payload.image, "draft-look.jpg");
  }

  if (payload.clearImage) {
    formData.append("clearImage", "true");
  }

  const response = await request.put<SocialLookDraftResponse | null>(
    "/api/v1/social/look-drafts/me",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  if (!response.data) {
    return null;
  }

  return mapSocialLookDraftResponse(response.data);
};
