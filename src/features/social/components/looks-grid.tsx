"use client";

import { LookCard } from "@/features/social/components/look-card";
import type { SocialLook } from "@/common/entities/social/social-look";
import { cn } from "@/common/utils/cn";

interface LooksGridProps {
  items: SocialLook[];
  onToggleLike?: (look: SocialLook) => void;
  pendingLikeLookId?: string | null;
  layout?: "grid" | "feed";
}

export const LooksGrid = ({
  items,
  onToggleLike,
  pendingLikeLookId = null,
  layout = "grid"
}: LooksGridProps) => {
  const isFeed = layout === "feed";

  if (items.length === 0) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-white/10 bg-white/5 p-6 text-center",
          isFeed && "mx-auto w-full max-w-[760px] p-8"
        )}
      >
        <p className="text-base font-semibold text-white">Пока нет опубликованных образов</p>
        <p className="mt-1 text-sm text-higgs-text-muted">Опубликуйте первый образ на странице Publish.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid",
        isFeed
          ? "mx-auto w-full max-w-[760px] grid-cols-1 gap-5"
          : "grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      )}
    >
      {items.map((look) => (
        <LookCard
          key={look.id}
          look={look}
          onToggleLike={onToggleLike}
          likePending={pendingLikeLookId === look.id}
          variant={isFeed ? "feed" : "default"}
        />
      ))}
    </div>
  );
};
