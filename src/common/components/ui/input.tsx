"use client";

import React from "react";
import { cn } from "@/common/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, icon, ...props }, ref) => {
    return (
      <div className="relative group">
        {label && (
          <label className="block text-xs font-medium text-higgs-text-muted mb-1.5 ml-1 transition-colors group-focus-within:text-violet-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white transition-colors">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:scale-[1.01] focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-inner",
              icon && "pl-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {/* Subtle bottom glow line - removed for cleaner look, or updated to primary */}
          <div className="absolute bottom-0 left-2 right-2 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent group-focus-within:via-violet-400/50 transition-all" />
        </div>
      </div>
    );
  }
);
Input.displayName = "Input";
