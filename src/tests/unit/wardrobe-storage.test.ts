import { describe, expect, it } from "vitest";
import { deserializeWardrobe, serializeWardrobe } from "@/common/utils/wardrobe-storage";

const sampleItem = {
  id: "id-1",
  name: "Пальто",
  imageDataUri: "data:image/jpeg;base64,Zm9v",
  size: "l" as const,
  createdAt: "2026-02-11T10:00:00.000Z"
};

describe("wardrobe storage", () => {
  it("serializes and deserializes wardrobe items", () => {
    const raw = serializeWardrobe([sampleItem]);
    const parsed = deserializeWardrobe(raw);

    expect(parsed).toEqual([sampleItem]);
  });

  it("returns empty array on invalid payload", () => {
    const parsed = deserializeWardrobe("{broken-json");
    expect(parsed).toEqual([]);
  });
});
