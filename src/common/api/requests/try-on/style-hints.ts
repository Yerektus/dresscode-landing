import { request } from "@/common/api/request";
import type { TryOnStyleHintResponse, TryOnStyleHintsResponse } from "@/common/api/responses/try-on.response";
import type { TryOnStyleHint } from "@/common/entities/try-on-result";

interface TryOnStyleHintsPayload {
  clothingImage: Blob;
  clothingName?: string;
}

export const fetchTryOnStyleHints = async (
  payload: TryOnStyleHintsPayload
): Promise<TryOnStyleHint[]> => {
  const formData = new FormData();
  formData.append("clothingImage", payload.clothingImage, "clothing.jpg");

  if (payload.clothingName?.trim()) {
    formData.append("clothingName", payload.clothingName.trim());
  }

  const response = await request.post<TryOnStyleHintsResponse>(
    "/api/v1/try-on/style-hints",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return normalizeHints(response.data.hints);
};

const normalizeHints = (hints: TryOnStyleHintResponse[] | undefined): TryOnStyleHint[] => {
  if (!hints || !Array.isArray(hints)) {
    return [];
  }

  return hints
    .map((hint) => ({
      style: hint.style?.trim() ?? "",
      reason: hint.reason?.trim() ?? ""
    }))
    .filter((hint) => hint.style.length > 0 && hint.reason.length > 0)
    .slice(0, 3);
};
