"use client";

import { Button } from "@/common/components/ui/button";

interface PaymentStatusBannerProps {
  visible: boolean;
  onBuy: () => void;
}

export const PaymentStatusBanner = ({ visible, onBuy }: PaymentStatusBannerProps) => {
  if (!visible) {
    return null;
  }

  return (
    <div className="rounded-xl border border-amber-300/40 bg-amber-400/15 p-4 text-sm text-amber-100">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p>Недостаточно кредитов для примерки.</p>
        <Button size="sm" variant="secondary" onClick={onBuy}>
          Купить
        </Button>
      </div>
    </div>
  );
};
