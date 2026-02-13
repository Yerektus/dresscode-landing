"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/utils/cn";

interface AlertDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "secondary" | "destructive";
  pending?: boolean;
  className?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const AlertDialog = ({
  open,
  title,
  description,
  confirmLabel = "Подтвердить",
  cancelLabel = "Отмена",
  confirmVariant = "destructive",
  pending = false,
  className,
  onConfirm,
  onCancel
}: AlertDialogProps) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) {
        onCancel();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel, pending]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-black/80 p-2 backdrop-blur-sm sm:p-3 md:items-center md:p-6"
      role="presentation"
      onClick={() => {
        if (!pending) {
          onCancel();
        }
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "w-full max-w-md rounded-2xl border border-white/10 bg-higgs-bg p-4 shadow-[0_24px_80px_rgba(0,0,0,0.7)] sm:rounded-3xl sm:p-5",
          className
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="font-display text-xl text-white">{title}</h2>

        {description && <p className="mt-2 text-sm text-higgs-text-muted">{description}</p>}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            isLoading={pending}
            disabled={pending}
            onClick={() => void onConfirm()}
          >
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>,
    document.body
  );
};
