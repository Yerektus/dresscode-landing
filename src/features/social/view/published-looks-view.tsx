"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/common/components/ui/button";
import { Card } from "@/common/components/ui/card";
import { likeLook, unlikeLook } from "@/common/api/requests/social";
import type { CursorPage } from "@/common/entities/social/cursor-page";
import type { SocialLook } from "@/common/entities/social/social-look";
import { socialConfig } from "@/common/config/social.config";
import { socialQueryKeys } from "@/features/social/query-keys";
import { SocialDisabledCard } from "@/features/social/components/social-disabled-card";
import { LooksGrid } from "@/features/social/components/looks-grid";
import {
  flattenCursorPages,
  useSocialPublishedLooksInfiniteQuery
} from "@/features/social/hooks/use-social-queries";

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

export const PublishedLooksView = () => {
  const queryClient = useQueryClient();
  const [pendingLikeLookId, setPendingLikeLookId] = useState<string | null>(null);

  const looksQuery = useSocialPublishedLooksInfiniteQuery();
  const looks = useMemo(
    () => flattenCursorPages(looksQuery.data?.pages ?? []),
    [looksQuery.data?.pages]
  );

  const likeMutation = useMutation({
    mutationFn: async (payload: { lookId: string; isLikedByMe: boolean }) => {
      return payload.isLikedByMe ? unlikeLook(payload.lookId) : likeLook(payload.lookId);
    },
    onMutate: (payload) => {
      setPendingLikeLookId(payload.lookId);

      const publishedLooksKey = socialQueryKeys.publishedLooks();
      const lookKey = socialQueryKeys.look(payload.lookId);
      const previousLooks = queryClient.getQueryData<InfiniteData<CursorPage<SocialLook>>>(publishedLooksKey);
      const previousLook = queryClient.getQueryData<SocialLook>(lookKey);
      const nextLiked = !payload.isLikedByMe;

      queryClient.setQueryData<InfiniteData<CursorPage<SocialLook>>>(publishedLooksKey, (current) =>
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
        publishedLooksKey,
        lookKey
      };
    },
    onError: (_error, _payload, context) => {
      if (context?.previousLooks !== undefined) {
        queryClient.setQueryData(context.publishedLooksKey, context.previousLooks);
      }
      if (context?.previousLook !== undefined) {
        queryClient.setQueryData(context.lookKey, context.previousLook);
      }

      toast.error("Не удалось обновить лайк.");
    },
    onSuccess: (updatedLook, payload) => {
      queryClient.setQueryData<SocialLook>(socialQueryKeys.look(payload.lookId), updatedLook);

      queryClient.setQueryData<InfiniteData<CursorPage<SocialLook>>>(
        socialQueryKeys.publishedLooks(),
        (current) => updateLookInInfiniteData(current, payload.lookId, () => updatedLook)
      );
    },
    onSettled: () => {
      setPendingLikeLookId(null);
    }
  });

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

  if (looksQuery.isLoading) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] w-full flex-col">
        <Card className="border-white/10 p-8 text-center text-higgs-text-muted">Загружаем образы...</Card>
      </main>
    );
  }

  if (looksQuery.isError) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] w-full flex-col">
        <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
          Не удалось загрузить опубликованные образы.
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] w-full flex-col pb-8">
      <div className="mx-auto w-full max-w-[980px]">
        <section className="mb-6 text-center">
          <h1 className="font-display text-3xl font-bold text-white md:text-4xl">Все опубликованные образы</h1>
          <p className="mt-3 text-sm text-higgs-text-muted md:text-base">
            Общая лента публичных образов от всех пользователей.
          </p>
        </section>

        <section className="space-y-4">
          <LooksGrid
            items={looks}
            onToggleLike={onToggleLike}
            pendingLikeLookId={pendingLikeLookId}
            layout="feed"
          />

          {looksQuery.hasNextPage && (
            <Button
              type="button"
              variant="secondary"
              className="mx-auto block w-full max-w-[760px]"
              onClick={() => void looksQuery.fetchNextPage()}
              disabled={looksQuery.isFetchingNextPage}
            >
              {looksQuery.isFetchingNextPage ? "Загрузка..." : "Загрузить еще образы"}
            </Button>
          )}
        </section>
      </div>
    </main>
  );
};
