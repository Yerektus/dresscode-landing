import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PublishLookView } from "@/features/publish/view/publish-look-view";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import type { CreateSocialLookPayload, SocialLook, SocialLookDraft } from "@/common/entities/social";

const {
  pushMock,
  createLookMock,
  deleteDraftMock,
  fetchDraftMock,
  upsertDraftMock,
  toastErrorMock,
  toastSuccessMock
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  createLookMock: vi.fn(),
  deleteDraftMock: vi.fn(),
  fetchDraftMock: vi.fn(),
  upsertDraftMock: vi.fn(),
  toastErrorMock: vi.fn(),
  toastSuccessMock: vi.fn()
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock
  })
}));

vi.mock("@/common/config/social.config", () => ({
  socialConfig: {
    enabled: true,
    draftEnabled: true
  }
}));

vi.mock("sonner", () => ({
  toast: {
    error: toastErrorMock,
    success: toastSuccessMock
  }
}));

vi.mock("@/common/api/requests/social", () => ({
  createLook: createLookMock,
  deleteMyLookDraft: deleteDraftMock,
  fetchMyLookDraft: fetchDraftMock,
  upsertMyLookDraft: upsertDraftMock
}));

const getDraft = (patch?: Partial<SocialLookDraft>): SocialLookDraft => ({
  title: "Server draft",
  description: "Description from server",
  tags: ["old"],
  style: "Casual",
  visibility: "public",
  imageUrl: null,
  imageDataUri: null,
  updatedAt: "2026-02-12T01:00:00.000Z",
  ...patch
});

describe("PublishLookView draft integration", () => {
  beforeEach(() => {
    pushMock.mockReset();
    createLookMock.mockReset();
    deleteDraftMock.mockReset();
    fetchDraftMock.mockReset();
    upsertDraftMock.mockReset();
    toastErrorMock.mockReset();
    toastSuccessMock.mockReset();

    fetchDraftMock.mockResolvedValue(getDraft());
    upsertDraftMock.mockResolvedValue(getDraft());
    deleteDraftMock.mockResolvedValue(undefined);

    createLookMock.mockImplementation(async (payload: CreateSocialLookPayload): Promise<SocialLook> => ({
      id: "look-2",
      author: {
        id: "u1",
        username: "u1",
        displayName: "U1",
        avatarUrl: null
      },
      imageUrl: "https://example.com/look.png",
      title: payload.title,
      description: payload.description,
      tags: payload.tags,
      style: payload.style,
      visibility: payload.visibility,
      likesCount: 0,
      commentsCount: 0,
      isLikedByMe: false,
      createdAt: "2026-02-12T01:00:00.000Z"
    }));

    useAuthStore.setState({
      user: {
        id: "u1",
        email: "u1@example.com",
        displayName: "U1",
        creditsBalance: 10
      },
      isAuthenticated: true
    });
  });

  afterEach(() => {
    cleanup();
  });

  const renderView = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false
        }
      }
    });

    render(
      <QueryClientProvider client={queryClient}>
        <PublishLookView />
      </QueryClientProvider>
    );
  };

  it("loads server draft and autosaves after edit", async () => {
    renderView();

    await waitFor(() => {
      expect((screen.getByPlaceholderText("Например: Urban Night Fit") as HTMLInputElement).value).toBe(
        "Server draft"
      );
    });

    const titleInput = screen.getByPlaceholderText("Например: Urban Night Fit");

    fireEvent.change(titleInput, {
      target: { value: "Warmup change" }
    });
    await waitFor(() => {
      expect((screen.getByPlaceholderText("Например: Urban Night Fit") as HTMLInputElement).value).toBe(
        "Warmup change"
      );
    });
    fireEvent.change(titleInput, {
      target: { value: "Updated from form" }
    });

    await new Promise((resolve) => {
      setTimeout(resolve, 1400);
    });

    await waitFor(() => {
      expect(upsertDraftMock).toHaveBeenCalledTimes(1);
    });

    expect(upsertDraftMock.mock.calls[0]?.[0]).toMatchObject({
      title: "Updated from form",
      description: "Description from server",
      style: "Casual",
      visibility: "public"
    });
  });

  it("shows retry action when autosave fails and retries on click", async () => {
    upsertDraftMock
      .mockRejectedValueOnce(new Error("save failed"))
      .mockResolvedValueOnce(getDraft({ title: "Retried title" }));

    renderView();

    await waitFor(() => {
      expect((screen.getByPlaceholderText("Например: Urban Night Fit") as HTMLInputElement).value).toBe(
        "Server draft"
      );
    });

    const titleInput = screen.getByPlaceholderText("Например: Urban Night Fit");
    fireEvent.change(titleInput, {
      target: { value: "Warmup retry" }
    });
    await waitFor(() => {
      expect((screen.getByPlaceholderText("Например: Urban Night Fit") as HTMLInputElement).value).toBe(
        "Warmup retry"
      );
    });
    fireEvent.change(titleInput, {
      target: { value: "Retried title" }
    });

    await new Promise((resolve) => {
      setTimeout(resolve, 1400);
    });

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalled();
    });

    const retryCall = toastErrorMock.mock.calls[0];
    const retryAction = retryCall?.[1]?.action;
    expect(retryAction).toBeDefined();

    retryAction.onClick();

    await waitFor(() => {
      expect(upsertDraftMock).toHaveBeenCalledTimes(2);
    });
  });
});
