"use client";

import { Card } from "@/common/components/ui/card";

export const SocialDisabledCard = () => {
  return (
    <Card className="border-white/10 text-center">
      <div className="mx-auto max-w-lg py-8">
        <h1 className="font-display text-3xl font-bold text-white">Social скоро</h1>
        <p className="mt-2 text-sm text-higgs-text-muted">
          Социальные функции временно недоступны. Включите feature-flag `NEXT_PUBLIC_SOCIAL_ENABLED=true`.
        </p>
      </div>
    </Card>
  );
};
