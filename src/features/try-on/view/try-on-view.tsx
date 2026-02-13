"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { HeroPhotoSection } from "@/features/try-on/components/hero-photo-section";
import { UserProfileSection } from "@/features/try-on/components/user-profile-section";
import { WardrobeSection } from "@/features/try-on/components/wardrobe-section";
import { TryOnButton } from "@/features/try-on/components/try-on-button";
import { ResultView } from "@/features/try-on/components/result-view";
import { useTryOnStore } from "@/features/try-on/stores/try-on-store";
import { BillingSheet } from "@/features/billing/components/billing-sheet";
import { PaymentStatusBanner } from "@/features/billing/components/payment-status-banner";

export const TryOnView = () => {
  const [openBilling, setOpenBilling] = useState(false);

  const refreshBalance = useAuthStore((state) => state.refreshBalance);

  const state = useTryOnStore((store) => store.state);
  const needsCredits = useTryOnStore((store) => store.needsCredits);
  const canTryOn = useTryOnStore((store) => store.canTryOn());
  const startTryOn = useTryOnStore((store) => store.startTryOn);
  const clearNeedsCredits = useTryOnStore((store) => store.clearNeedsCredits);

  const onTryOn = async () => {
    const error = await startTryOn();
    if (!error) {
      return;
    }

    toast.error(error);
    if (useTryOnStore.getState().needsCredits) {
      setOpenBilling(true);
    }
  };

  const onBillingClose = async (wasPaid?: boolean) => {
    setOpenBilling(false);
    if (!wasPaid) {
      return;
    }

    await refreshBalance();
    clearNeedsCredits();
    toast.success("Баланс обновлен. Можно продолжить примерку.");
  };

  if (state === "result") {
    return <ResultView />;
  }

  return (
    <main className="flex min-h-[calc(100svh-4rem)] w-full flex-col">
      <div className="mb-3 flex items-center justify-between sm:mb-6">
        <h1 className="font-display text-[1.65rem] font-bold text-white sm:text-3xl">AI Studio</h1>
      </div>

      <section className="space-y-2.5 pb-[calc(env(safe-area-inset-bottom)+6.25rem)] pt-1 sm:space-y-4 sm:pb-32">
        <HeroPhotoSection />
        <PaymentStatusBanner visible={needsCredits} onBuy={() => setOpenBilling(true)} />
        <UserProfileSection />
        <WardrobeSection />
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-higgs-bg/85 px-2 pb-[calc(env(safe-area-inset-bottom)+0.625rem)] pt-2 backdrop-blur-xl sm:px-4 sm:pb-5 sm:pt-4 lg:left-64">
        <div className="mx-auto max-w-5xl rounded-2xl border border-white/5 bg-black/10 p-2 sm:border-0 sm:bg-transparent sm:p-0">
          <TryOnButton
            disabled={!canTryOn}
            processing={state === "processing"}
            onClick={() => void onTryOn()}
          />
        </div>
      </div>

      <BillingSheet open={openBilling} onClose={(wasPaid) => void onBillingClose(wasPaid)} />
    </main>
  );
};
