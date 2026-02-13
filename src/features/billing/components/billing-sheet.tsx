"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Modal } from "@/common/components/ui/modal";
import { Button } from "@/common/components/ui/button";
import { Spinner } from "@/common/components/ui/spinner";
import { listPackages } from "@/common/api/requests/billing/list-packages";
import { createCheckout } from "@/common/api/requests/billing/checkout";
import { getPaymentStatus } from "@/common/api/requests/billing/get-payment-status";
import { storageKeys } from "@/common/constants/storage-keys";
import { isPaymentPaid, isPaymentTerminal } from "@/common/entities/payment-status";
import { getErrorMessage } from "@/common/utils/http-error";

interface BillingSheetProps {
  open: boolean;
  onClose: (wasPaid?: boolean) => void;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const BillingSheet = ({ open, onClose }: BillingSheetProps) => {
  const [processingCode, setProcessingCode] = useState<string | null>(null);

  const { data: packages = [], isPending, error } = useQuery({
    queryKey: ["billing-packages", open],
    queryFn: listPackages,
    enabled: open
  });

  const queryErrorMessage = useMemo(() => {
    if (!error) {
      return null;
    }

    return getErrorMessage(error);
  }, [error]);

  const startCheckout = async (packageCode: string) => {
    setProcessingCode(packageCode);

    try {
      const origin = window.location.origin;
      const checkout = await createCheckout({
        packageCode,
        successUrl: `${origin}/payment/success`,
        cancelUrl: `${origin}/payment/cancel`,
        platform: "web"
      });

      localStorage.setItem(storageKeys.pendingPaymentId, checkout.paymentId);

      const paymentWindow = window.open(checkout.redirectUrl, "_blank", "noopener,noreferrer");
      if (!paymentWindow) {
        toast.error("Браузер заблокировал окно оплаты");
      }

      for (let index = 0; index < 30; index += 1) {
        await delay(2000);
        const status = await getPaymentStatus(checkout.paymentId);

        if (!isPaymentTerminal(status.status)) {
          continue;
        }

        if (isPaymentPaid(status.status)) {
          onClose(true);
          return;
        }

        toast.error(`Оплата завершилась со статусом: ${status.status}`);
        return;
      }

      toast.error("Не удалось подтвердить оплату. Проверьте статус позже.");
    } catch (checkoutError) {
      toast.error(getErrorMessage(checkoutError));
    } finally {
      setProcessingCode(null);
    }
  };

  return (
    <Modal open={open} onClose={() => onClose(false)} title="Пополнить кредиты" className="max-w-xl">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-display text-3xl leading-none sm:text-xl">Пополнить кредиты</h3>
          <Button variant="ghost" size="sm" className="w-full sm:w-auto" onClick={() => onClose(false)}>
            Закрыть
          </Button>
        </div>

        {isPending && (
          <div className="flex items-center gap-2 text-sm text-higgs-text-muted">
            <Spinner /> Загружаем пакеты...
          </div>
        )}

        {queryErrorMessage && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
            {queryErrorMessage}
          </div>
        )}

        {!isPending && !queryErrorMessage && (
          <div className="space-y-2">
            {packages.map((pkg) => {
              const amount = (pkg.amountMinor / 100).toFixed(0);
              const processing = processingCode === pkg.code;

              return (
                <button
                  key={pkg.code}
                  type="button"
                  onClick={() => void startCheckout(pkg.code)}
                  disabled={!!processingCode}
                  className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-left transition-colors hover:border-violet-400/50 hover:bg-white/10 disabled:opacity-60"
                >
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-white sm:text-sm">{pkg.title}</p>
                    <p className="text-sm text-higgs-text-muted sm:text-xs">+{pkg.credits} кредитов</p>
                  </div>
                  <div className="whitespace-nowrap text-right text-2xl font-semibold text-white sm:text-sm">
                    {processing ? "Проверяем..." : `${amount} ${pkg.currency}`}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <p className="border-t border-white/10 pt-3 text-sm text-higgs-text-muted sm:text-xs">
          1 успешная AI-примерка = 1 кредит
        </p>
      </div>
    </Modal>
  );
};
