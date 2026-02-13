"use client";

import Link from "next/link";
import { Heart, MessageCircle, MoreHorizontal, UserRound } from "lucide-react";
import { Badge } from "@/common/components/ui/badge";
import { cn } from "@/common/utils/cn";
import type { SocialLook } from "@/common/entities/social/social-look";
import { formatSocialDateTime } from "@/features/social/utils";

interface LookCardProps {
  look: SocialLook;
  onToggleLike?: (look: SocialLook) => void;
  likePending?: boolean;
  variant?: "default" | "feed";
}

export const LookCard = ({
  look,
  onToggleLike,
  likePending = false,
  variant = "default"
}: LookCardProps) => {
  const isFeed = variant === "feed";
  const authorName = look.author.displayName?.trim() || look.author.username;

  const likeButton = onToggleLike && (
    <button
      type="button"
      disabled={likePending}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggleLike(look);
      }}
      className={cn(
        "pointer-events-auto inline-flex items-center gap-1 transition-colors",
        isFeed
          ? look.isLikedByMe
            ? "text-violet-400"
            : "text-white/85 hover:text-white"
          : look.isLikedByMe
            ? "rounded-lg border border-violet-400/40 bg-violet-500/15 px-2 py-1 text-xs font-medium text-violet-300"
            : "rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-medium text-higgs-text-muted hover:text-white"
      )}
    >
      <Heart className={cn(isFeed ? "h-5 w-5" : "h-3.5 w-3.5", look.isLikedByMe && "fill-current")} />
      <span className={cn(isFeed ? "text-base" : "text-xs")}>{look.likesCount}</span>
    </button>
  );

  if (isFeed) {
    return (
      <article className="relative flex h-screen flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-4">
        <Link
          href={`/app/looks/${look.id}`}
          aria-label={`Открыть лук: ${look.title}`}
          className="absolute inset-0 z-0"
        />

        <div className="relative z-10 flex h-full flex-col gap-3 pointer-events-none">
          <div className="flex shrink-0 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/5">
                {look.author.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={look.author.avatarUrl}
                    alt={look.author.displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="h-4 w-4 text-higgs-text-muted" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {authorName}
                  <span className="ml-2 text-xs font-medium text-higgs-text-muted">
                    • {formatSocialDateTime(look.createdAt)}
                  </span>
                </p>
              </div>
            </div>
            <MoreHorizontal className="h-5 w-5 text-higgs-text-muted" />
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={look.imageUrl} alt={look.title} className="h-full w-full object-cover" />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent px-4 pb-5 pt-12">
              <p className="line-clamp-2 text-center text-xl font-bold text-white sm:text-2xl">{look.title}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              {likeButton}
              <div className="inline-flex items-center gap-1 text-sm text-white/85">
                <MessageCircle className="h-5 w-5" />
                {look.commentsCount}
              </div>
            </div>

            <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-higgs-text-muted">
              {look.style}
            </div>
          </div>

          <div className="shrink-0 text-sm leading-relaxed text-higgs-text-muted">
            <span className="mr-2 font-semibold text-white">{authorName}</span>
            {look.description || look.title}
          </div>

          {look.tags.length > 0 && (
            <div className="flex shrink-0 flex-wrap gap-2">
              {look.tags.slice(0, 5).map((tag) => (
                <span key={tag} className="text-xs text-higgs-text-muted">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    );
  }

  return (
    <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <Link
        href={`/app/looks/${look.id}`}
        aria-label={`Открыть лук: ${look.title}`}
        className="absolute inset-0 z-0"
      />

      <div className="relative z-10 pointer-events-none">
        <div className="relative aspect-[4/5] overflow-hidden bg-black/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={look.imageUrl} alt={look.title} className="h-full w-full object-cover" />
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-white">{look.title}</p>
              <p className="text-xs text-higgs-text-muted">{formatSocialDateTime(look.createdAt)}</p>
            </div>

            {likeButton}
          </div>

          {look.description && <p className="line-clamp-2 text-sm text-higgs-text-muted">{look.description}</p>}

          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {look.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} className="border-white/15 bg-white/5 text-higgs-text-muted">
                  #{tag}
                </Badge>
              ))}
            </div>

            <div className="inline-flex items-center gap-1 text-xs text-higgs-text-muted">
              <MessageCircle className="h-3.5 w-3.5" />
              {look.commentsCount}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
