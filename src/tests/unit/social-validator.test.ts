import { describe, expect, it } from "vitest";
import {
  isValidCommentBody,
  isValidLookDescription,
  isValidLookTitle
} from "@/features/social/validators";

describe("social validators", () => {
  it("validates look title", () => {
    expect(isValidLookTitle("  ")).toBe(false);
    expect(isValidLookTitle("Night outfit")).toBe(true);
    expect(isValidLookTitle("x".repeat(71))).toBe(false);
  });

  it("validates look description length", () => {
    expect(isValidLookDescription("x".repeat(280))).toBe(true);
    expect(isValidLookDescription("x".repeat(281))).toBe(false);
  });

  it("validates comment body", () => {
    expect(isValidCommentBody("   ")).toBe(false);
    expect(isValidCommentBody("Отличный лук")).toBe(true);
    expect(isValidCommentBody("x".repeat(401))).toBe(false);
  });
});
