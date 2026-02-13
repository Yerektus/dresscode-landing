import type { ClothingSize } from "@/common/entities/wardrobe-item";
import type { TryOnOutput } from "@/common/entities/try-on-result";

export interface TryOnHistoryItem {
  id: string;
  createdAt: string;
  clothingName: string;
  clothingSize: ClothingSize;
  resultImageDataUri: string;
  resultMimeType?: string;
  outputs?: TryOnOutput[];
  creditsSpent: number;
  remainingCredits: number;
}
