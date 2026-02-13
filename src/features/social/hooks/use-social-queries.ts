"use client";

import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchLook,
  fetchMyLookDraft,
  fetchMySocialProfile,
  fetchSocialProfile,
  listPublishedLooks,
  listLookComments,
  listProfileFollowers,
  listProfileFollowing,
  listProfileLooks,
  upsertMyLookDraft
} from "@/common/api/requests/social";
import type { CursorPage } from "@/common/entities/social/cursor-page";
import type { SocialComment } from "@/common/entities/social/social-comment";
import type { SocialLookDraft, UpsertMyLookDraftPayload } from "@/common/entities/social/social-look-draft";
import type { SocialLook } from "@/common/entities/social/social-look";
import type { SocialProfile } from "@/common/entities/social/social-profile";
import { socialQueryKeys } from "@/features/social/query-keys";
import { SOCIAL_DEFAULT_PAGE_SIZE } from "@/features/social/constants";

export const flattenCursorPages = <T>(pages: Array<CursorPage<T>>): T[] => {
  return pages.flatMap((page) => page.items);
};

export const useSocialProfileQuery = (userId: string) => {
  return useQuery<SocialProfile>({
    queryKey: socialQueryKeys.profile(userId),
    queryFn: () => (userId === "me" ? fetchMySocialProfile() : fetchSocialProfile(userId))
  });
};

export const useSocialLooksInfiniteQuery = (userId: string, enabled = true) => {
  return useInfiniteQuery<CursorPage<SocialLook>>({
    queryKey: socialQueryKeys.looks(userId),
    queryFn: ({ pageParam }) =>
      listProfileLooks(userId, {
        cursor: (pageParam as string | null) ?? null,
        limit: SOCIAL_DEFAULT_PAGE_SIZE
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: !!userId && enabled
  });
};

export const useSocialPublishedLooksInfiniteQuery = (enabled = true) => {
  return useInfiniteQuery<CursorPage<SocialLook>>({
    queryKey: socialQueryKeys.publishedLooks(),
    queryFn: ({ pageParam }) =>
      listPublishedLooks({
        cursor: (pageParam as string | null) ?? null,
        limit: SOCIAL_DEFAULT_PAGE_SIZE
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled
  });
};

export const useSocialFollowersInfiniteQuery = (userId: string, enabled = true) => {
  return useInfiniteQuery<CursorPage<SocialProfile>>({
    queryKey: socialQueryKeys.followers(userId),
    queryFn: ({ pageParam }) =>
      listProfileFollowers(userId, {
        cursor: (pageParam as string | null) ?? null,
        limit: SOCIAL_DEFAULT_PAGE_SIZE
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: !!userId && enabled
  });
};

export const useSocialFollowingInfiniteQuery = (userId: string, enabled = true) => {
  return useInfiniteQuery<CursorPage<SocialProfile>>({
    queryKey: socialQueryKeys.following(userId),
    queryFn: ({ pageParam }) =>
      listProfileFollowing(userId, {
        cursor: (pageParam as string | null) ?? null,
        limit: SOCIAL_DEFAULT_PAGE_SIZE
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: !!userId && enabled
  });
};

export const useSocialLookQuery = (lookId: string) => {
  return useQuery<SocialLook>({
    queryKey: socialQueryKeys.look(lookId),
    queryFn: () => fetchLook(lookId),
    enabled: !!lookId
  });
};

export const useSocialCommentsInfiniteQuery = (
  lookId: string,
  parentId: string | null,
  enabled = true
) => {
  return useInfiniteQuery<CursorPage<SocialComment>>({
    queryKey: socialQueryKeys.comments(lookId, parentId),
    queryFn: ({ pageParam }) =>
      listLookComments(lookId, {
        parentId,
        cursor: (pageParam as string | null) ?? null,
        limit: SOCIAL_DEFAULT_PAGE_SIZE
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: !!lookId && enabled
  });
};

export const useMyLookDraftQuery = (enabled = true) => {
  return useQuery<SocialLookDraft | null>({
    queryKey: socialQueryKeys.publishDraft("me"),
    queryFn: () => fetchMyLookDraft(),
    enabled,
    refetchOnWindowFocus: false
  });
};

export const useUpsertMyLookDraftMutation = () => {
  return useMutation<SocialLookDraft | null, unknown, UpsertMyLookDraftPayload>({
    mutationFn: upsertMyLookDraft
  });
};
