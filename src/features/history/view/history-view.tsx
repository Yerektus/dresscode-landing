"use client";

import { useMemo, useState } from "react";
import { Clock3, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Modal } from "@/common/components/ui/modal";
import { clothingSizeLabels } from "@/common/entities/wardrobe-item";
import { useTryOnStore } from "@/features/try-on/stores/try-on-store";
import type { TryOnOutput } from "@/common/entities/try-on-result";
import type { TryOnOutputId } from "@/common/api/responses/try-on.response";

type HistoryOutputTab = TryOnOutputId;

const OUTPUT_LABELS: Record<HistoryOutputTab, string> = {
  front: "Front",
  left_45: "45° left",
  inpaint: "Inpaint"
};

const formatHistoryDate = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Дата неизвестна";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(parsed);
};

const resolvePrimaryImage = (outputs: TryOnOutput[] | undefined, fallback: string): string => {
  if (!outputs || outputs.length === 0) {
    return fallback;
  }

  return (
    outputs.find((output) => output.id === "inpaint")?.imageDataUri ??
    outputs.find((output) => output.id === "front")?.imageDataUri ??
    outputs[0]?.imageDataUri ??
    fallback
  );
};

export const HistoryView = () => {
  const historyItems = useTryOnStore((state) => state.historyItems);
  const clearHistory = useTryOnStore((state) => state.clearHistory);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [activeOutputTab, setActiveOutputTab] = useState<HistoryOutputTab>("inpaint");

  const activeItem = useMemo(
    () => historyItems.find((item) => item.id === activeItemId) ?? null,
    [historyItems, activeItemId]
  );

  const activeOutputs = useMemo(() => {
    if (!activeItem?.outputs || activeItem.outputs.length === 0) {
      return [
        {
          id: "inpaint" as const,
          imageDataUri: activeItem?.resultImageDataUri ?? "",
          mimeType: activeItem?.resultMimeType ?? "image/png"
        }
      ];
    }

    return activeItem.outputs;
  }, [activeItem]);

  const activeOutputImage =
    activeOutputs.find((output) => output.id === activeOutputTab)?.imageDataUri ??
    activeOutputs.find((output) => output.id === "inpaint")?.imageDataUri ??
    activeOutputs.find((output) => output.id === "front")?.imageDataUri ??
    activeOutputs[0]?.imageDataUri ??
    null;

  return (
    <main className="flex min-h-[calc(100vh-4rem)] w-full flex-col">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">История запросов</h1>
          <p className="mt-1 text-sm text-higgs-text-muted">Сохраненные результаты AI-примерки.</p>
        </div>
        {historyItems.length > 0 && (
          <Button variant="ghost" onClick={clearHistory}>
            <Trash2 className="mr-2 h-4 w-4" />
            Очистить
          </Button>
        )}
      </div>

      {historyItems.length === 0 ? (
        <Card className="border-white/10 text-center">
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-6">
            <div className="rounded-full border border-white/10 bg-white/5 p-3">
              <Clock3 className="h-5 w-5 text-higgs-text-muted" />
            </div>
            <h2 className="font-display text-xl text-white">История пока пустая</h2>
            <p className="text-sm text-higgs-text-muted">
              После первой успешной AI-примерки здесь появится запись.
            </p>
          </div>
        </Card>
      ) : (
        <section className="grid gap-3 pb-6">
          {historyItems.map((item) => (
            <Card key={item.id} className="border-white/10 p-0">
              <button
                type="button"
                onClick={() => {
                  setActiveItemId(item.id);
                  setActiveOutputTab(
                    item.outputs?.find((output) => output.id === "inpaint")?.id ??
                      item.outputs?.[0]?.id ??
                      "inpaint"
                  );
                }}
                className="w-full rounded-2xl text-left transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500/60"
              >
                <div className="grid gap-4 p-4 sm:grid-cols-[150px_minmax(0,1fr)] sm:p-5">
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
                    <img
                      src={resolvePrimaryImage(item.outputs, item.resultImageDataUri)}
                      alt={`Результат примерки: ${item.clothingName}`}
                      className="h-36 w-full object-cover sm:h-full"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="truncate text-base font-semibold text-white">{item.clothingName}</p>
                      <span className="text-xs text-higgs-text-muted">{formatHistoryDate(item.createdAt)}</span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge className="border-white/15 bg-white/5 text-higgs-text-muted hover:bg-white/5">
                        Размер: {clothingSizeLabels[item.clothingSize]}
                      </Badge>
                      <Badge className="border-violet-400/35 bg-violet-500/12 text-violet-300 hover:bg-violet-500/16">
                        <Sparkles className="mr-1 h-3 w-3" />
                        -{item.creditsSpent} кредитов
                      </Badge>
                    </div>
                  </div>
                </div>
              </button>
            </Card>
          ))}
        </section>
      )}

      <Modal
        open={!!activeItem}
        onClose={() => setActiveItemId(null)}
        title={activeItem ? `Результат примерки: ${activeItem.clothingName}` : "Результат примерки"}
        className="max-w-4xl"
      >
        {activeItem && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-2xl font-semibold text-white">{activeItem.clothingName}</h3>
                <p className="text-sm text-higgs-text-muted">{formatHistoryDate(activeItem.createdAt)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveItemId(null)}>
                Закрыть
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeOutputs.map((output) => (
                <Button
                  key={output.id}
                  variant={activeOutputTab === output.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setActiveOutputTab(output.id)}
                >
                  {OUTPUT_LABELS[output.id]}
                </Button>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              {activeOutputImage ? (
                <img
                  src={activeOutputImage}
                  alt={`Результат примерки: ${activeItem.clothingName}`}
                  className="max-h-[72vh] w-full object-contain"
                />
              ) : (
                <div className="flex min-h-[220px] items-center justify-center text-sm text-white/70">
                  Изображение недоступно
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className="border-white/15 bg-white/5 text-higgs-text-muted hover:bg-white/5">
                Размер: {clothingSizeLabels[activeItem.clothingSize]}
              </Badge>
              <Badge className="border-violet-400/35 bg-violet-500/12 text-violet-300 hover:bg-violet-500/16">
                <Sparkles className="mr-1 h-3 w-3" />
                -{activeItem.creditsSpent} кредитов
              </Badge>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
};
