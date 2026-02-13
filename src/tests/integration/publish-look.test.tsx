import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PublishLookView } from "@/features/publish/view/publish-look-view";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import type { CreateSocialLookPayload, SocialLook } from "@/common/entities/social";

const { pushMock, createLookMock, deleteDraftMock, fetchDraftMock, upsertDraftMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  createLookMock: vi.fn(),
  deleteDraftMock: vi.fn(),
  fetchDraftMock: vi.fn(),
  upsertDraftMock: vi.fn()
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock
  })
}));

vi.mock("@/common/config/social.config", () => ({
  socialConfig: {
    enabled: true,
    draftEnabled: false
  }
}));

vi.mock("@/common/api/requests/social", () => ({
  createLook: createLookMock,
  deleteMyLookDraft: deleteDraftMock,
  fetchMyLookDraft: fetchDraftMock,
  upsertMyLookDraft: upsertDraftMock
}));

class MockFileReader {
  public result: string | ArrayBuffer | null = null;
  public onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;
  public onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;

  readAsDataURL() {
    this.result = "data:image/png;base64,Zm9v";
    if (this.onload) {
      this.onload.call(this as unknown as FileReader, {} as ProgressEvent<FileReader>);
    }
  }
}

describe("PublishLookView integration", () => {
  beforeEach(() => {
    pushMock.mockReset();
    createLookMock.mockReset();
    deleteDraftMock.mockReset();
    fetchDraftMock.mockReset();
    upsertDraftMock.mockReset();
    createLookMock.mockImplementation(async (payload: CreateSocialLookPayload): Promise<SocialLook> => ({
      id: "look-1",
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
      createdAt: new Date().toISOString()
    }));

    // @ts-expect-error test polyfill
    global.FileReader = MockFileReader;

    useAuthStore.setState({
      user: {
        id: "u1",
        email: "u1@example.com",
        displayName: "U1",
        creditsBalance: 5
      },
      isAuthenticated: true
    });
  });

  it("publishes look and redirects to profile looks tab", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false
        }
      }
    });

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <PublishLookView />
      </QueryClientProvider>
    );

    expect(screen.queryByText("Черновик сохраняется автоматически")).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Например: Urban Night Fit"), {
      target: { value: "Urban fit" }
    });

    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();

    const file = new File(["binary"], "look.png", { type: "image/png" });
    fireEvent.change(fileInput!, {
      target: { files: [file] }
    });

    fireEvent.click(screen.getByRole("button", { name: "Опубликовать лук" }));

    await waitFor(() => {
      expect(createLookMock).toHaveBeenCalledTimes(1);
    });

    expect((createLookMock.mock.calls[0]?.[0] ?? null) as CreateSocialLookPayload | null).toMatchObject({
      title: "Urban fit",
      visibility: "public"
    });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/app/profile?tab=looks");
    });
  });
});
