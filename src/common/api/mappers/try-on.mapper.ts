import type { TryOnAnalyzeResponse } from "@/common/api/responses/try-on.response";
import type { TryOnAnalyzeResult } from "@/common/entities/try-on-result";

export const mapTryOnResponseToResult = (
  response: TryOnAnalyzeResponse
): TryOnAnalyzeResult => {
  const mimeType = response.resultMimeType || "image/png";
  const mappedOutputs =
    response.outputs?.map((output) => {
      const outputMime = output.mimeType || "image/png";
      return {
        id: output.id,
        imageDataUri: `data:${outputMime};base64,${output.imageBase64}`,
        mimeType: outputMime
      };
    }) ?? [];

  const outputs =
    mappedOutputs.length > 0
      ? mappedOutputs
      : [
          {
            id: "inpaint" as const,
            imageDataUri: `data:${mimeType};base64,${response.resultImageBase64}`,
            mimeType
          }
        ];

  const primaryOutput = outputs.find((output) => output.id === "inpaint") ?? outputs[0];
  return {
    jobId: response.jobId,
    imageDataUri: primaryOutput?.imageDataUri ?? `data:${mimeType};base64,${response.resultImageBase64}`,
    mimeType: primaryOutput?.mimeType ?? mimeType,
    creditsSpent: response.creditsSpent,
    remainingCredits: response.remainingCredits,
    outputs
  };
};
