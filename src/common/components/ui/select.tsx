"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/common/utils/cn";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            "h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-3 pr-10 text-sm leading-5 text-white shadow-inner transition-all",
            "focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70"
          aria-hidden="true"
        />
      </div>
    );
  }
);

Select.displayName = "Select";
