"use client";

import { UserRound } from "lucide-react";
import { Card } from "@/common/components/ui/card";
import type { SocialProfile } from "@/common/entities/social/social-profile";
import { FollowButton } from "@/features/social/components/follow-button";

interface ProfileHeaderProps {
  profile: SocialProfile;
  onToggleFollow: () => void;
  followPending?: boolean;
}

export const ProfileHeader = ({
  profile,
  onToggleFollow,
  followPending = false
}: ProfileHeaderProps) => {
  return (
    <Card className="border-white/10">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt={profile.displayName} className="h-full w-full object-cover" />
            ) : (
              <UserRound className="h-7 w-7 text-higgs-text-muted" />
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-2xl font-bold text-white">{profile.displayName}</p>
            <p className="truncate text-sm text-higgs-text-muted">@{profile.username}</p>
            <p className="mt-3 text-sm text-higgs-text-muted">
              {profile.bio || "Пользователь пока не добавил описание профиля."}
            </p>
          </div>
        </div>

        {!profile.isMe && (
          <FollowButton
            isFollowing={profile.isFollowing}
            onToggle={onToggleFollow}
            pending={followPending}
            className="w-full md:w-auto"
          />
        )}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
        <div className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-2.5 text-center sm:p-3">
          <p className="truncate text-[10px] uppercase tracking-[0.04em] text-higgs-text-muted sm:text-[11px]">
            Образы
          </p>
          <p className="mt-1 text-2xl font-bold text-white sm:text-xl">{profile.looksCount}</p>
        </div>
        <div className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-2.5 text-center sm:p-3">
          <p className="truncate text-[10px] uppercase tracking-[0.04em] text-higgs-text-muted sm:text-[11px]">
            Подписчики
          </p>
          <p className="mt-1 text-2xl font-bold text-white sm:text-xl">{profile.followersCount}</p>
        </div>
        <div className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-2.5 text-center sm:p-3">
          <p className="truncate text-[10px] uppercase tracking-[0.04em] text-higgs-text-muted sm:text-[11px]">
            Подписки
          </p>
          <p className="mt-1 text-2xl font-bold text-white sm:text-xl">{profile.followingCount}</p>
        </div>
      </div>
    </Card>
  );
};
