import { describe, expect, it } from "vitest";
import { mapTryOnResponseToResult } from "@/common/api/mappers/try-on.mapper";

describe("try-on mapper", () => {
  it("maps API response to domain entity", () => {
    const mapped = mapTryOnResponseToResult({
      jobId: "job-1",
      resultImageBase64: "YWJj",
      resultMimeType: "image/png",
      creditsSpent: 1,
      remainingCredits: 9,
      outputs: [
        {
          id: "inpaint",
          imageBase64: "aW5wYWludA==",
          mimeType: "image/png"
        }
      ]
    });

    expect(mapped).toEqual({
      jobId: "job-1",
      imageDataUri: "data:image/png;base64,aW5wYWludA==",
      mimeType: "image/png",
      creditsSpent: 1,
      remainingCredits: 9,
      outputs: [
        {
          id: "inpaint",
          imageDataUri: "data:image/png;base64,aW5wYWludA==",
          mimeType: "image/png"
        }
      ]
    });
  });

  it("falls back to legacy payload as inpaint output", () => {
    const mapped = mapTryOnResponseToResult({
      jobId: "job-2",
      resultImageBase64: "YWJj",
      resultMimeType: "image/png",
      creditsSpent: 1,
      remainingCredits: 8
    });

    expect(mapped.outputs).toEqual([
      {
        id: "inpaint",
        imageDataUri: "data:image/png;base64,YWJj",
        mimeType: "image/png"
      }
    ]);
  });
});
