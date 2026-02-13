import { mapTryOnResponseToResult } from "@/common/api/mappers/try-on.mapper";
import type { TryOnAnalyzeResponse } from "@/common/api/responses/try-on.response";
import type { TryOnAnalyzeResult } from "@/common/entities/try-on-result";
import { request } from "@/common/api/request";
import type { UserGender } from "@/common/entities/profile";

interface AnalyzeTryOnPayload {
  personImage: Blob;
  clothingImage: Blob;
  clothingName: string;
  clothingSize: string;
  heightCm: number;
  weightKg: number;
  gender: UserGender;
  ageYears: number;
}

export const analyzeTryOn = async (
  payload: AnalyzeTryOnPayload
): Promise<TryOnAnalyzeResult> => {
  const formData = new FormData();

  formData.append("personImage", payload.personImage, "person.jpg");
  formData.append("clothingImage", payload.clothingImage, "clothing.jpg");
  formData.append("clothingName", payload.clothingName);
  formData.append("clothingSize", payload.clothingSize);
  formData.append("heightCm", String(payload.heightCm));
  formData.append("weightKg", String(payload.weightKg));
  formData.append("gender", payload.gender);
  formData.append("ageYears", String(payload.ageYears));

  const response = await request.post<TryOnAnalyzeResponse>(
    "/api/v1/try-on/analyze",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return mapTryOnResponseToResult(response.data);
};
