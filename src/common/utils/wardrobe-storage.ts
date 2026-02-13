import { clothingSizes, type WardrobeItem } from "@/common/entities/wardrobe-item";

const sizesSet = new Set<string>(clothingSizes);

export const serializeWardrobe = (items: WardrobeItem[]): string => {
  return JSON.stringify(items);
};

export const deserializeWardrobe = (raw: string): WardrobeItem[] => {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is WardrobeItem => {
        return (
          typeof item?.id === "string" &&
          typeof item?.name === "string" &&
          typeof item?.imageDataUri === "string" &&
          typeof item?.createdAt === "string" &&
          typeof item?.size === "string" &&
          sizesSet.has(item.size)
        );
      })
      .map((item) => ({
        id: item.id,
        name: item.name,
        imageDataUri: item.imageDataUri,
        size: item.size,
        createdAt: item.createdAt
      }));
  } catch {
    return [];
  }
};
