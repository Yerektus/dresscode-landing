"use client";

import React from "react";
import { cn } from "@/common/utils/cn";

interface TabsProps<T extends string> {
  value: T;
  onChange: (nextValue: T) => void;
  options: Array<{ value: T; label: string }>;
}

export const Tabs = <T extends string>({ value, onChange, options }: TabsProps<T>) => {
  return (
    <div
      className="inline-flex w-full rounded-xl border border-white/10 bg-white/[0.03] p-1"
      role="tablist"
      aria-label="Режим авторизации"
    >
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500/50",
              isActive
                ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                : "text-higgs-text-muted hover:text-white"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
