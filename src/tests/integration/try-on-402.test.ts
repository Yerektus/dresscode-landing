import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/common/api/requests/try-on/analyze", () => ({
  analyzeTryOn: vi.fn(async () => {
    throw {
      response: {
        status: 402,
        data: {
          code: "payment_required",
          message: "Not enough credits"
        }
      }
    };
  })
}));

import { useAuthStore } from "@/features/auth/stores/auth-store";
import { useTryOnStore } from "@/features/try-on/stores/try-on-store";

describe("try-on store integration: 402", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: {
        id: "u1",
        email: "u1@example.com",
        displayName: "U1",
        creditsBalance: 0
      },
      isAuthenticated: true,
      accessToken: "token",
      refreshToken: "refresh"
    });

    useTryOnStore.setState({
      state: "photoLoaded",
      userPhotoDataUri: "data:image/jpeg;base64,Zm9v",
      resultImageDataUri: null,
      profile: {
        heightCm: 180,
        weightKg: 75,
        gender: "male",
        ageYears: 28
      },
      wardrobeItems: [
        {
          id: "item-1",
          name: "Куртка",
          imageDataUri: "data:image/jpeg;base64,Zm9v",
          size: "m",
          createdAt: "2026-02-11T00:00:00.000Z"
        }
      ],
      selectedWardrobeItemIds: ["item-1"],
      needsCredits: false
    });
  });

  it("marks needsCredits and returns paywall error", async () => {
    const error = await useTryOnStore.getState().startTryOn();

    expect(error).toBe("Недостаточно кредитов. Пополните баланс.");
    expect(useTryOnStore.getState().needsCredits).toBe(true);
    expect(useTryOnStore.getState().state).toBe("photoLoaded");
  });
});
