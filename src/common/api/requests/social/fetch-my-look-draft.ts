import axios from "axios";
import { mapSocialLookDraftResponse } from "@/common/api/mappers/social.mapper";
import type { SocialLookDraftResponse } from "@/common/api/responses/social.response";
import { request } from "@/common/api/request";
import type { SocialLookDraft } from "@/common/entities/social/social-look-draft";

export const fetchMyLookDraft = async (): Promise<SocialLookDraft | null> => {
  try {
    const response = await request.get<SocialLookDraftResponse | null>("/api/v1/social/look-drafts/me");
    if (!response.data) {
      return null;
    }

    return mapSocialLookDraftResponse(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }

    throw error;
  }
};
