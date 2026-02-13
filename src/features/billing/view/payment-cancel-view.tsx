"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { storageKeys } from "@/common/constants/storage-keys";
import { paths } from "@/common/constants/paths";
import { Card } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";

export const PaymentCancelView = () => {
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem(storageKeys.pendingPaymentId);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <Card className="max-w-md text-center">
        <h1 className="font-display text-2xl">Оплата отменена</h1>
        <p className="mt-3 text-sm text-brand-mist/80">
          Вы можете вернуться в приложение и повторить оплату в любой момент.
        </p>

        <div className="mt-4">
          <Button onClick={() => router.replace(paths.tryOn)}>Вернуться в примерку</Button>
        </div>
      </Card>
    </main>
  );
};
