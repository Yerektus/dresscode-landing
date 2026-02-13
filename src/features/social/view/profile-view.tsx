"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card } from "@/common/components/ui/card";
import { toApiError } from "@/common/utils/http-error";
import {
  followUser,
  likeLook,
  unfollowUser,
  unlikeLook
} from "@/common/api/requests/social";
import type { CursorPage } from "@/common/entities/social/cursor-page";
import type { SocialLook } from "@/common/entities/social/social-look";
import type { SocialProfile } from "@/common/entities/social/social-profile";
import { socialQueryKeys } from "@/features/social/query-keys";
import { ProfileHeader } from "@/features/social/components/profile-header";
import { ProfileTabs } from "@/features/social/components/profile-tabs";
import { LooksGrid } from "@/features/social/components/looks-grid";
import { FollowersList } from "@/features/social/components/followers-list";
import {
  flattenCursorPages,
  useSocialFollowersInfiniteQuery,
  useSocialFollowingInfiniteQuery,
  useSocialLooksInfiniteQuery,
  useSocialProfileQuery
} from "@/features/social/hooks/use-social-queries";
import { isSocialTab, type SocialTab } from "@/features/social/constants";
import { socialConfig } from "@/common/config/social.config";
import { SocialDisabledCard } from "@/features/social/components/social-disabled-card";

interface ProfileViewProps {
  profileId?: string;
}

const updateProfileInInfiniteData = (
  data: InfiniteData<CursorPage<SocialProfile>> | undefined,
  userId: string,
  updater: (profile: SocialProfile) => SocialProfile
): InfiniteData<CursorPage<SocialProfile>> | undefined => {
  if (!data) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((item) => (item.id === userId ? updater(item) : item))
    }))
  };
};

const updateLookInInfiniteData = (
  data: InfiniteData<CursorPage<SocialLook>> | undefined,
  lookId: string,
  updater: (look: SocialLook) => SocialLook
): InfiniteData<CursorPage<SocialLook>> | undefined => {
  if (!data) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((item) => (item.id === lookId ? updater(item) : item))
    }))
  };
};

export const ProfileView = ({ profileId = "me" }: ProfileViewProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [pendingFollowUserId, setPendingFollowUserId] = useState<string | null>(null);
  const [pendingLikeLookId, setPendingLikeLookId] = useState<string | null>(null);

  const tabParam = searchParams.get("tab");
  const activeTab: SocialTab = isSocialTab(tabParam) ? tabParam : "looks";

  const profileQuery = useSocialProfileQuery(profileId);

  const listOwnerId = profileId === "me" ? profileQuery.data?.id ?? "" : profileId;
  const hasListOwner = listOwnerId.length > 0;

  const looksQuery = useSocialLooksInfiniteQuery(listOwnerId, activeTab === "looks" && hasListOwner);
  const followersQuery = useSocialFollowersInfiniteQuery(
    listOwnerId,
    activeTab === "followers" && hasListOwner
  );
  const followingQuery = useSocialFollowingInfiniteQuery(
    listOwnerId,
    activeTab === "following" && hasListOwner
  );

  const looks = useMemo(
    () => flattenCursorPages(looksQuery.data?.pages ?? []),
    [looksQuery.data?.pages]
  );
  const followers = useMemo(
    () => flattenCursorPages(followersQuery.data?.pages ?? []),
    [followersQuery.data?.pages]
  );
  const following = useMemo(
    () => flattenCursorPages(followingQuery.data?.pages ?? []),
    [followingQuery.data?.pages]
  );

  const followMutation = useMutation({
    mutationFn: async (payload: { userId: string; isFollowing: boolean }) => {
      return payload.isFollowing ? unfollowUser(payload.userId) : followUser(payload.userId);
    },
    onMutate: async (payload) => {
      setPendingFollowUserId(payload.userId);

      const profileKey = socialQueryKeys.profile(payload.userId);
      const previousProfile = queryClient.getQueryData<SocialProfile>(profileKey);
      const followersKey = socialQueryKeys.followers(listOwnerId);
      const followingKey = socialQueryKeys.following(listOwnerId);
      const previousFollowers = queryClient.getQueryData<InfiniteData<CursorPage<SocialProfile>>>(followersKey);
      const previousFollowing = queryClient.getQueryData<InfiniteData<CursorPage<SocialProfile>>>(followingKey);

      const nextIsFollowing = !payload.isFollowing;

      queryClient.setQueryData<SocialProfile>(profileKey, (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          isFollowing: nextIsFollowing,
          followersCount: Math.max(0, current.followersCount + (nextIsFollowing ? 1 : -1))
        };
      });

      queryClient.setQueryData<InfiniteData<CursorPage<SocialProfile>>>(
        followersKey,
        (current) =>
          updateProfileInInfiniteData(current, payload.userId, (item) => ({
            ...item,
            isFollowing: nextIsFollowing
          }))
      );
      queryClient.setQueryData<InfiniteData<CursorPage<SocialProfile>>>(
        followingKey,
        (current) =>
          updateProfileInInfiniteData(current, payload.userId, (item) => ({
            ...item,
            isFollowing: nextIsFollowing
          }))
      );

      return {
        previousProfile,
        previousFollowers,
        previousFollowing,
        profileKey,
        followersKey,
        followingKey
      };
    },
    onError: (_error, _payload, context) => {
      if (context?.previousProfile !== undefined) {
        queryClient.setQueryData(context.profileKey, context.previousProfile);
      }
      if (context?.previousFollowers !== undefined) {
        queryClient.setQueryData(context.followersKey, context.previousFollowers);
      }
      if (context?.previousFollowing !== undefined) {
        queryClient.setQueryData(context.followingKey, context.previousFollowing);
      }

      toast.error("Не удалось обновить подписку.");
    },
    onSuccess: (relation, payload) => {
      queryClient.setQueryData<SocialProfile>(socialQueryKeys.profile(payload.userId), (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          isFollowing: relation.isFollowing,
          followersCount: relation.followersCount
        };
      });
    },
    onSettled: () => {
      setPendingFollowUserId(null);
    }
  });

  const likeMutation = useMutation({
    mutationFn: async (payload: { lookId: string; isLikedByMe: boolean }) => {
      return payload.isLikedByMe ? unlikeLook(payload.lookId) : likeLook(payload.lookId);
    },
    onMutate: async (payload) => {
      setPendingLikeLookId(payload.lookId);

      const looksKey = socialQueryKeys.looks(listOwnerId);
      const lookKey = socialQueryKeys.look(payload.lookId);
      const previousLooks = queryClient.getQueryData<InfiniteData<CursorPage<SocialLook>>>(looksKey);
      const previousLook = queryClient.getQueryData<SocialLook>(lookKey);

      const nextLiked = !payload.isLikedByMe;

      queryClient.setQueryData<InfiniteData<CursorPage<SocialLook>>>(looksKey, (current) =>
        updateLookInInfiniteData(current, payload.lookId, (look) => ({
          ...look,
          isLikedByMe: nextLiked,
          likesCount: Math.max(0, look.likesCount + (nextLiked ? 1 : -1))
        }))
      );

      queryClient.setQueryData<SocialLook>(lookKey, (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          isLikedByMe: nextLiked,
          likesCount: Math.max(0, current.likesCount + (nextLiked ? 1 : -1))
        };
      });

      return {
        previousLooks,
        previousLook,
        looksKey,
        lookKey
      };
    },
    onError: (_error, _payload, context) => {
      if (context?.previousLooks !== undefined) {
        queryClient.setQueryData(context.looksKey, context.previousLooks);
      }
      if (context?.previousLook !== undefined) {
        queryClient.setQueryData(context.lookKey, context.previousLook);
      }

      toast.error("Не удалось обновить лайк.");
    },
    onSuccess: (updatedLook, payload) => {
      queryClient.setQueryData<SocialLook>(socialQueryKeys.look(payload.lookId), updatedLook);

      queryClient.setQueryData<InfiniteData<CursorPage<SocialLook>>>(
        socialQueryKeys.looks(listOwnerId),
        (current) => updateLookInInfiniteData(current, payload.lookId, () => updatedLook)
      );
    },
    onSettled: () => {
      setPendingLikeLookId(null);
    }
  });

  const onChangeTab = (nextTab: SocialTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", nextTab);
    router.replace(`${pathname}?${params.toString()}` as Route, { scroll: false });
  };

  const onToggleFollow = (targetProfile: SocialProfile) => {
    if (targetProfile.isMe) {
      return;
    }

    followMutation.mutate({
      userId: targetProfile.id,
      isFollowing: targetProfile.isFollowing
    });
  };

  const onToggleLike = (look: SocialLook) => {
    likeMutation.mutate({
      lookId: look.id,
      isLikedByMe: look.isLikedByMe
    });
  };

  if (!socialConfig.enabled) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] w-full flex-col">
        <SocialDisabledCard />
      </main>
    );
  }

  if (profileQuery.isLoading) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] w-full flex-col">
        <Card className="border-white/10 p-8 text-center text-higgs-text-muted">Загружаем профиль...</Card>
      </main>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    const parsed = toApiError(profileQuery.error);

    if (parsed.status === 404) {
      return (
        <main className="flex min-h-[calc(100vh-4rem)] w-full flex-col">
          <Card className="border-white/10 p-8 text-center">
            <h1 className="font-display text-2xl font-bold text-white">Профиль не найден</h1>
            <p className="mt-2 text-sm text-higgs-text-muted">Проверьте ссылку или вернитесь назад.</p>
            <div className="mt-5 flex justify-center">
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Назад
              </Button>
            </div>
          </Card>
        </main>
      );
    }

    return (
      <main className="flex min-h-[calc(100vh-4rem)] w-full flex-col">
        <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
          Не удалось загрузить профиль. Попробуйте позже.
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] w-full flex-col">
      <div className="mb-6 space-y-4">
        <ProfileHeader
          profile={profileQuery.data}
          onToggleFollow={() => onToggleFollow(profileQuery.data)}
          followPending={pendingFollowUserId === profileQuery.data.id}
        />

        <ProfileTabs value={activeTab} onChange={onChangeTab} />
      </div>

      {activeTab === "looks" && (
        <section className="space-y-4 pb-8">
          <LooksGrid items={looks} onToggleLike={onToggleLike} pendingLikeLookId={pendingLikeLookId} />

          {looksQuery.hasNextPage && (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => void looksQuery.fetchNextPage()}
              disabled={looksQuery.isFetchingNextPage}
            >
              {looksQuery.isFetchingNextPage ? "Загрузка..." : "Загрузить еще образы"}
            </Button>
          )}
        </section>
      )}

      {activeTab === "followers" && (
        <section className="space-y-4 pb-8">
          <FollowersList
            items={followers}
            pendingUserId={pendingFollowUserId}
            onToggleFollow={onToggleFollow}
          />

          {followersQuery.hasNextPage && (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => void followersQuery.fetchNextPage()}
              disabled={followersQuery.isFetchingNextPage}
            >
              {followersQuery.isFetchingNextPage ? "Загрузка..." : "Загрузить еще"}
            </Button>
          )}
        </section>
      )}

      {activeTab === "following" && (
        <section className="space-y-4 pb-8">
          <FollowersList
            items={following}
            pendingUserId={pendingFollowUserId}
            onToggleFollow={onToggleFollow}
          />

          {followingQuery.hasNextPage && (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => void followingQuery.fetchNextPage()}
              disabled={followingQuery.isFetchingNextPage}
            >
              {followingQuery.isFetchingNextPage ? "Загрузка..." : "Загрузить еще"}
            </Button>
          )}
        </section>
      )}
    </main>
  );
};
