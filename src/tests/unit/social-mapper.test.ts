import { describe, expect, it } from "vitest";
import {
  mapCursorPageResponse,
  mapSocialCommentResponse,
  mapSocialLookDraftResponse,
  mapSocialLookResponse,
  mapSocialProfileResponse
} from "@/common/api/mappers/social.mapper";

describe("social mapper", () => {
  it("maps profile response", () => {
    const mapped = mapSocialProfileResponse({
      id: "u1",
      username: "alex",
      displayName: "Alex",
      avatarUrl: null,
      bio: null,
      followersCount: 10,
      followingCount: 4,
      looksCount: 7,
      isFollowing: true,
      isMe: false
    });

    expect(mapped).toEqual({
      id: "u1",
      username: "alex",
      displayName: "Alex",
      avatarUrl: null,
      bio: "",
      followersCount: 10,
      followingCount: 4,
      looksCount: 7,
      isFollowing: true,
      isMe: false
    });
  });

  it("maps look response", () => {
    const mapped = mapSocialLookResponse({
      id: "look-1",
      author: {
        id: "u1",
        username: "alex",
        displayName: "Alex",
        avatarUrl: "https://cdn/avatar.jpg"
      },
      imageUrl: "https://cdn/look.jpg",
      title: "Fit",
      description: null,
      tags: undefined,
      style: null,
      visibility: "public",
      likesCount: 5,
      commentsCount: 2,
      isLikedByMe: false,
      createdAt: "2026-02-11T10:00:00.000Z"
    });

    expect(mapped).toEqual({
      id: "look-1",
      author: {
        id: "u1",
        username: "alex",
        displayName: "Alex",
        avatarUrl: "https://cdn/avatar.jpg"
      },
      imageUrl: "https://cdn/look.jpg",
      title: "Fit",
      description: "",
      tags: [],
      style: "Casual",
      visibility: "public",
      likesCount: 5,
      commentsCount: 2,
      isLikedByMe: false,
      createdAt: "2026-02-11T10:00:00.000Z"
    });
  });

  it("maps comment response and cursor page", () => {
    const page = mapCursorPageResponse(
      {
        items: [
          {
            id: "c1",
            lookId: "look-1",
            author: {
              id: "u2",
              username: "kate",
              displayName: "Kate",
              avatarUrl: null
            },
            body: "Nice",
            parentId: null,
            createdAt: "2026-02-11T10:00:00.000Z",
            repliesCount: 1,
            isLikedByMe: false,
            likesCount: 0,
            canDelete: true
          }
        ],
        nextCursor: null
      },
      mapSocialCommentResponse
    );

    expect(page.hasMore).toBe(false);
    expect(page.nextCursor).toBe(null);
    expect(page.items[0]).toEqual({
      id: "c1",
      lookId: "look-1",
      author: {
        id: "u2",
        username: "kate",
        displayName: "Kate",
        avatarUrl: null
      },
      body: "Nice",
      parentId: null,
      createdAt: "2026-02-11T10:00:00.000Z",
      repliesCount: 1,
      isLikedByMe: false,
      likesCount: 0,
      canDelete: true
    });
  });

  it("maps look draft response", () => {
    const mapped = mapSocialLookDraftResponse({
      title: "Draft look",
      description: null,
      tags: ["streetwear"],
      style: null,
      visibility: "followers",
      imageUrl: "https://cdn/draft.jpg",
      imageDataUri: null,
      updatedAt: "2026-02-12T01:00:00.000Z"
    });

    expect(mapped).toEqual({
      title: "Draft look",
      description: "",
      tags: ["streetwear"],
      style: "Casual",
      visibility: "followers",
      imageUrl: "https://cdn/draft.jpg",
      imageDataUri: null,
      updatedAt: "2026-02-12T01:00:00.000Z"
    });
  });
});
