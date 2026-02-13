import { describe, expect, it } from "vitest";
import { emptyProfile, isProfileComplete, isProfileValid } from "@/common/entities/profile";

describe("profile validation", () => {
  it("returns false for incomplete profile", () => {
    expect(isProfileComplete(emptyProfile)).toBe(false);
    expect(isProfileValid(emptyProfile)).toBe(false);
  });

  it("returns true for valid profile", () => {
    const profile = {
      heightCm: 180,
      weightKg: 75,
      gender: "male" as const,
      ageYears: 28
    };

    expect(isProfileComplete(profile)).toBe(true);
    expect(isProfileValid(profile)).toBe(true);
  });

  it("returns false for out of range profile", () => {
    const profile = {
      heightCm: 250,
      weightKg: 20,
      gender: "female" as const,
      ageYears: 8
    };

    expect(isProfileComplete(profile)).toBe(true);
    expect(isProfileValid(profile)).toBe(false);
  });
});
