"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { paths } from "@/common/constants/paths";
import { storageKeys } from "@/common/constants/storage-keys";
import { getPaymentStatus } from "@/common/api/requests/billing/get-payment-status";
import { isPaymentPaid } from "@/common/entities/payment-status";
import { Button } from "@/common/components/ui/button";
import { Card } from "@/common/components/ui/card";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { getErrorMessage } from "@/common/utils/http-error";

export const PaymentSuccessView = () => {
  const router = useRouter();
  const refreshBalance = useAuthStore((state) => state.refreshBalance);
  const [message, setMessage] = useState("Проверяем статус оплаты...");

  useEffect(() => {
    const run = async () => {
      const paymentId = localStorage.getItem(storageKeys.pendingPaymentId);
      if (!paymentId) {
        setMessage("Платеж не найден. Вернитесь в приложение.");
        return;
      }

      try {
        const status = await getPaymentStatus(paymentId);

        if (isPaymentPaid(status.status)) {
          await refreshBalance();
          localStorage.removeItem(storageKeys.pendingPaymentId);
          setMessage("Оплата подтверждена. Возвращаем вас в приложение...");
          toast.success("Баланс успешно пополнен");
          setTimeout(() => router.replace(paths.tryOn), 1200);
          return;
        }

        setMessage(`Оплата пока не подтверждена: ${status.status}`);
      } catch (error) {
        setMessage(getErrorMessage(error));
      }
    };

    void run();
  }, [refreshBalance, router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <Card className="max-w-md text-center">
        <h1 className="font-display text-2xl">Оплата</h1>
        <p className="mt-3 text-sm text-brand-mist/80">{message}</p>

        <div className="mt-4">
          <Button onClick={() => router.replace(paths.tryOn)}>Вернуться в примерку</Button>
        </div>
      </Card>
    </main>
  );
};
