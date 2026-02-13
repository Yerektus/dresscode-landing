"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import type { SocialProfile } from "@/common/entities/social/social-profile";
import { FollowButton } from "@/features/social/components/follow-button";

interface FollowersListProps {
  items: SocialProfile[];
  pendingUserId: string | null;
  onToggleFollow: (profile: SocialProfile) => void;
}

export const FollowersList = ({
  items,
  pendingUserId,
  onToggleFollow
}: FollowersListProps) => {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <p className="text-base font-semibold text-white">Список пуст</p>
        <p className="mt-1 text-sm text-higgs-text-muted">Пока здесь нет пользователей.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((profile) => (
        <article
          key={profile.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          <Link href={`/app/users/${profile.id}`} className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatarUrl} alt={profile.displayName} className="h-full w-full object-cover" />
              ) : (
                <UserRound className="h-5 w-5 text-higgs-text-muted" />
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{profile.displayName}</p>
              <p className="truncate text-xs text-higgs-text-muted">@{profile.username}</p>
            </div>
          </Link>

          {!profile.isMe && (
            <FollowButton
              isFollowing={profile.isFollowing}
              pending={pendingUserId === profile.id}
              onToggle={() => onToggleFollow(profile)}
              className="h-9 px-4 text-xs"
            />
          )}
        </article>
      ))}
    </div>
  );
};
