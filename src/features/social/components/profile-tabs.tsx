"use client";

import React from "react";
import { cn } from "@/common/utils/cn";
import { SOCIAL_TABS, type SocialTab } from "@/features/social/constants";

const tabLabels: Record<SocialTab, string> = {
  looks: "Образы",
  followers: "Подписчики",
  following: "Подписки"
};

interface ProfileTabsProps {
  value: SocialTab;
  onChange: (value: SocialTab) => void;
}

export const ProfileTabs = ({ value, onChange }: ProfileTabsProps) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-1">
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {SOCIAL_TABS.map((tab) => {
          const isActive = tab === value;
          return (
            <button
              key={tab}
              type="button"
              className={cn(
                "min-w-0 rounded-xl px-2 py-2 text-xs font-semibold leading-tight transition-colors sm:px-3 sm:text-sm",
                isActive
                  ? "border border-violet-400/45 bg-violet-500/20 text-white"
                  : "text-higgs-text-muted hover:bg-white/10 hover:text-white"
              )}
              onClick={() => onChange(tab)}
            >
              <span className="block truncate">{tabLabels[tab]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
