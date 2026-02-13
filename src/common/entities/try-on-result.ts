import type { TryOnOutputId } from "@/common/api/responses/try-on.response";

export interface TryOnOutput {
  id: TryOnOutputId;
  imageDataUri: string;
  mimeType: string;
}

export interface TryOnStyleHint {
  style: string;
  reason: string;
}

export interface TryOnAnalyzeResult {
  jobId: string;
  imageDataUri: string;
  mimeType: string;
  creditsSpent: number;
  remainingCredits: number;
  outputs: TryOnOutput[];
}
