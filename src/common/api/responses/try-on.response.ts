// `front`/`left_45` are kept for backward compatibility with older local history records.
export type TryOnOutputId = "inpaint" | "front" | "left_45";

export interface TryOnOutputResponse {
  id: TryOnOutputId;
  imageBase64: string;
  mimeType: string;
}

export interface TryOnAnalyzeResponse {
  jobId: string;
  resultImageBase64: string;
  resultMimeType: string;
  creditsSpent: number;
  remainingCredits: number;
  outputs?: TryOnOutputResponse[];
}

export interface TryOnStyleHintResponse {
  style: string;
  reason: string;
}

export interface TryOnStyleHintsResponse {
  hints: TryOnStyleHintResponse[];
}
