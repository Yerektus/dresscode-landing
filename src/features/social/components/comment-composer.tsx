"use client";

import React from "react";
import { useMemo, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { SOCIAL_LIMITS } from "@/features/social/constants";
import { isValidCommentBody } from "@/features/social/validators";

interface CommentComposerProps {
  submitLabel?: string;
  placeholder?: string;
  pending?: boolean;
  onSubmit: (body: string) => Promise<void> | void;
}

export const CommentComposer = ({
  submitLabel = "Отправить",
  placeholder = "Напишите комментарий...",
  pending = false,
  onSubmit
}: CommentComposerProps) => {
  const [value, setValue] = useState("");

  const trimmed = value.trim();
  const disabled = pending || !isValidCommentBody(trimmed);
  const remaining = useMemo(() => SOCIAL_LIMITS.commentBodyMax - value.length, [value.length]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (disabled) {
      return;
    }

    await onSubmit(trimmed);
    setValue("");
  };

  return (
    <form className="space-y-2" onSubmit={(event) => void handleSubmit(event)}>
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value.slice(0, SOCIAL_LIMITS.commentBodyMax))}
        placeholder={placeholder}
        className="min-h-[90px] w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 shadow-inner transition-all focus:scale-[1.01] focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
      />

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-higgs-text-muted">Осталось: {remaining}</span>

        <Button type="submit" size="sm" disabled={disabled}>
          <Send className="mr-1.5 h-3.5 w-3.5" />
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
