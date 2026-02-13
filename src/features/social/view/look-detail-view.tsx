"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Heart, MessageCircle, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/common/components/ui/button";
import { Card } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { socialConfig } from "@/common/config/social.config";
import { toApiError } from "@/common/utils/http-error";
import { likeLook, unlikeLook } from "@/common/api/requests/social";
import type { SocialLook } from "@/common/entities/social/social-look";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { socialQueryKeys } from "@/features/social/query-keys";
import { CommentThread } from "@/features/social/components/comment-thread";
import { SocialDisabledCard } from "@/features/social/components/social-disabled-card";
import { useSocialLookQuery } from "@/features/social/hooks/use-social-queries";
import { formatSocialDateTime } from "@/features/social/utils";

interface LookDetailViewProps {
  lookId: string;
}

export const LookDetailView = ({ lookId }: LookDetailViewProps) => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const lookQuery = useSocialLookQuery(lookId);

  const likeMutation = useMutation({
    mutationFn: async (payload: { lookId: string; isLikedByMe: boolean }) => {
      return payload.isLikedByMe ? unlikeLook(payload.lookId) : likeLook(payload.lookId);
    },
    onMutate: (payload) => {
      const lookKey = socialQueryKeys.look(payload.lookId);
      const previousLook = queryClient.getQueryData<SocialLook>(lookKey);
      const nextLiked = !payload.isLikedByMe;

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

      return { previousLook, lookKey };
    },
    onError: (_error, _payload, context) => {
      if (context?.previousLook !== undefined) {
        queryClient.setQueryData(context.lookKey, context.previousLook);
      }

      toast.error("Не удалось обновить лайк.");
    },
    onSuccess: (updatedLook, payload) => {
      queryClient.setQueryData<SocialLook>(socialQueryKeys.look(payload.lookId), updatedLook);
    }
  });

  if (!socialConfig.enabled) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] w-full flex-col">
        <SocialDisabledCard />
      </main>
    );
  }

  if (lookQuery.isLoading) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] w-full flex-col">
        <Card className="border-white/10 p-8 text-center text-higgs-text-muted">Загружаем лук...</Card>
      </main>
    );
  }

  if (lookQuery.isError || !lookQuery.data) {
    const parsed = toApiError(lookQuery.error);

    if (parsed.status === 404) {
      return (
        <main className="flex min-h-[calc(100vh-4rem)] w-full flex-col">
          <Card className="border-white/10 p-8 text-center">
            <h1 className="font-display text-2xl font-bold text-white">Лук не найден</h1>
            <p className="mt-2 text-sm text-higgs-text-muted">Возможно, он был удален или ссылка неверна.</p>
            <div className="mt-5 flex justify-center">
              <Link href="/app/profile?tab=looks">
                <Button type="button" variant="secondary">
                  <ArrowLeft className="mr-2 h-4 w-4" /> К профилю
                </Button>
              </Link>
            </div>
          </Card>
        </main>
      );
    }

    return (
      <main className="flex min-h-[calc(100vh-4rem)] w-full flex-col">
        <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
          Не удалось загрузить страницу лука.
        </Card>
      </main>
    );
  }

  const look = lookQuery.data;

  return (
    <main className="flex min-h-[calc(100vh-4rem)] w-full flex-col gap-6 pb-8">
      <div>
        <Link href={`/app/users/${look.author.id}?tab=looks`}>
          <Button type="button" variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> К профилю автора
          </Button>
        </Link>
      </div>

      <Card className="overflow-hidden border-white/10 p-0">
        <div className="grid lg:min-h-[760px] lg:grid-cols-[minmax(0,1fr)_460px]">
          <div className="min-h-[420px] overflow-hidden bg-black/20 lg:h-full lg:border-r lg:border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={look.imageUrl} alt={look.title} className="h-full w-full object-cover object-top" />
          </div>

          <div className="flex min-h-[420px] flex-col bg-white/[0.03] lg:h-full">
            <div className="border-b border-white/10 px-4 py-3">
              <Link href={`/app/users/${look.author.id}?tab=looks`} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5">
                  {look.author.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={look.author.avatarUrl}
                      alt={look.author.displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound className="h-5 w-5 text-higgs-text-muted" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-white">{look.author.displayName}</p>
                  <p className="truncate text-sm text-higgs-text-muted">@{look.author.username}</p>
                </div>
              </Link>
            </div>

            <div className="space-y-4 border-b border-white/10 px-4 py-4">
              <div>
                <p className="text-sm text-higgs-text-muted">{formatSocialDateTime(look.createdAt)}</p>
                <h1 className="mt-1 font-display text-3xl font-bold text-white">{look.title}</h1>
                <p className="mt-2 whitespace-pre-wrap text-sm text-higgs-text-muted">{look.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {look.tags.map((tag) => (
                  <Badge key={tag} className="border-white/15 bg-white/5 text-higgs-text-muted">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            <CommentThread
              lookId={look.id}
              isAuthenticated={isAuthenticated}
              mode="embedded"
              bottomSlot={
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={likeMutation.isPending}
                    onClick={() =>
                      likeMutation.mutate({
                        lookId: look.id,
                        isLikedByMe: look.isLikedByMe
                      })
                    }
                    className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-sm transition-colors ${
                      look.isLikedByMe
                        ? "border-violet-400/45 bg-violet-500/15 text-violet-300"
                        : "border-white/10 bg-white/5 text-higgs-text-muted hover:text-white"
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${look.isLikedByMe ? "fill-current" : ""}`} />
                    {look.likesCount}
                  </button>

                  <div className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-higgs-text-muted">
                    <MessageCircle className="h-4 w-4" />
                    {look.commentsCount}
                  </div>

                  <div className="min-w-0 max-w-full rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-higgs-text-muted sm:text-sm">
                    <span className="block truncate">Стиль: {look.style}</span>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </Card>
    </main>
  );
};
