"use client";

import { useTryOnStore } from "@/features/try-on/stores/try-on-store";
import { WardrobeSection } from "@/features/try-on/components/wardrobe-section";

export const WardrobeView = () => {
  const wardrobeItems = useTryOnStore((state) => state.wardrobeItems);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] w-full flex-col">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Мой гардероб</h1>
          <p className="mt-1 text-sm text-higgs-text-muted">
            Сохраняйте свои вещи и выбирайте их для примерки.
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-higgs-text-muted">Всего вещей</p>
            <p className="text-sm font-semibold text-white">{wardrobeItems.length}</p>
          </div>
        </div>
      </div>

      <section className="pb-6">
        <WardrobeSection />
      </section>
    </main>
  );
};
