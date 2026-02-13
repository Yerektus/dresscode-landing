import { mapSocialLookResponse } from "@/common/api/mappers/social.mapper";
import type { SocialLookResponse } from "@/common/api/responses/social.response";
import { request } from "@/common/api/request";
import type { CreateSocialLookPayload, SocialLook } from "@/common/entities/social/social-look";

export const createLook = async (payload: CreateSocialLookPayload): Promise<SocialLook> => {
  const formData = new FormData();

  formData.append("image", payload.image, "look.jpg");
  formData.append("title", payload.title.trim());
  formData.append("description", payload.description.trim());
  formData.append("style", payload.style);
  formData.append("visibility", payload.visibility);

  payload.tags.forEach((tag) => {
    formData.append("tags[]", tag);
  });

  const response = await request.post<SocialLookResponse>("/api/v1/social/looks", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return mapSocialLookResponse(response.data);
};
