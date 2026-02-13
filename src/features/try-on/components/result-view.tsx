"use client";

import React from "react";
import { useMemo, useRef, useState } from "react";
import { Download, Share2, Sparkles } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { dataUriToBlob } from "@/common/utils/image-data-uri";
import { useTryOnStore } from "@/features/try-on/stores/try-on-store";
import { toast } from "sonner";

export const ResultView = () => {
  const userPhotoDataUri = useTryOnStore((state) => state.userPhotoDataUri);
  const resultImageDataUri = useTryOnStore((state) => state.resultImageDataUri);
  const resultMimeType = useTryOnStore((state) => state.resultMimeType);
  const resultStyleHints = useTryOnStore((state) => state.resultStyleHints);
  const resultStyleHintsLoading = useTryOnStore((state) => state.resultStyleHintsLoading);
  const resultStyleHintsError = useTryOnStore((state) => state.resultStyleHintsError);
  const resetResult = useTryOnStore((state) => state.resetResult);
  const compareFrameRef = useRef<HTMLDivElement | null>(null);
  const [compareValue, setCompareValue] = useState(50);

  const activeImage = resultImageDataUri ?? userPhotoDataUri;
  const activeMime = resultMimeType || "image/png";
  const imageLabel = "inpaint";

  const hasResult = !!resultImageDataUri;
  const hasBefore = !!userPhotoDataUri;
  const hasComparison = hasBefore && hasResult;

  const clampCompareValue = (value: number): number => {
    return Math.min(100, Math.max(0, value));
  };

  const setCompareFromClientX = (clientX: number) => {
    const frame = compareFrameRef.current;
    if (!frame) {
      return;
    }

    const rect = frame.getBoundingClientRect();
    if (rect.width <= 0) {
      return;
    }

    const relative = ((clientX - rect.left) / rect.width) * 100;
    setCompareValue(clampCompareValue(relative));
  };

  const onComparePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setCompareFromClientX(event.clientX);
  };

  const onComparePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }
    setCompareFromClientX(event.clientX);
  };

  const onComparePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onCompareKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setCompareValue((current) => clampCompareValue(current - 2));
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      setCompareValue((current) => clampCompareValue(current + 2));
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setCompareValue(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setCompareValue(100);
    }
  };

  const hintsTitle = useMemo(() => {
    if (resultStyleHintsLoading) {
      return "AI подбирает подсказки стиля...";
    }
    if (resultStyleHintsError) {
      return "Не удалось получить подсказки стиля";
    }
    if (resultStyleHints.length === 0) {
      return "Подсказки стиля не найдены";
    }
    return "Подсказки стиля после AI-анализа";
  }, [resultStyleHints, resultStyleHintsError, resultStyleHintsLoading]);

  const getImageBlob = async (image: string): Promise<Blob | null> => {
    if (image.startsWith("data:")) {
      return dataUriToBlob(image);
    }

    const response = await fetch(image);
    if (!response.ok) {
      return null;
    }

    return response.blob();
  };

  const resolveExtension = (mimeType: string | null | undefined): string => {
    if (!mimeType) {
      return "png";
    }
    if (mimeType.startsWith("image/png")) {
      return "png";
    }
    if (mimeType.startsWith("image/jpeg")) {
      return "jpg";
    }
    if (mimeType.startsWith("image/webp")) {
      return "webp";
    }
    return "png";
  };

  const onDownload = async () => {
    if (!activeImage) {
      toast.error("Фото недоступно");
      return;
    }

    try {
      const blob = await getImageBlob(activeImage);
      if (!blob) {
        toast.error("Не удалось подготовить фото для скачивания");
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      const mimeType = blob.type || activeMime;
      const extension = resolveExtension(mimeType);
      link.download = `ai-try-on-${imageLabel}-${Date.now()}.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    } catch {
      toast.error("Не удалось скачать фото");
    }
  };

  const onShare = async () => {
    if (!activeImage) {
      toast.error("Фото недоступно");
      return;
    }

    if (typeof navigator.share !== "function") {
      toast.info("Поделиться не поддерживается в этом браузере. Используйте «Скачать».");
      return;
    }

    try {
      const blob = await getImageBlob(activeImage);
      if (!blob) {
        toast.error("Не удалось подготовить фото для отправки");
        return;
      }

      const mimeType = blob.type || activeMime;
      const extension = resolveExtension(mimeType);
      const file = new File([blob], `ai-try-on-${imageLabel}.${extension}`, {
        type: mimeType
      });
      const payload = {
        title: "AI Try-On",
        text: "Результат AI-примерки",
        files: [file]
      };

      if (typeof navigator.canShare === "function" && navigator.canShare(payload)) {
        await navigator.share(payload);
        return;
      }

      await navigator.share({
        title: "AI Try-On",
        text: "Результат AI-примерки"
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      toast.error("Не удалось поделиться фото");
    }
  };

  return (
    <section className="flex min-h-[calc(100svh-4rem)] flex-col gap-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:gap-4 sm:pb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" className="h-9 px-3 text-sm sm:h-10 sm:px-5" onClick={resetResult}>
          Закрыть
        </Button>
      </div>

      <div className="rounded-2xl border border-violet-400/25 bg-violet-500/[0.06] px-3 py-2.5 text-xs text-violet-100/90 sm:px-4 sm:py-3 sm:text-sm">
        Итог построен в режиме image editing (inpainting). Сгенерировано 1 финальное фото.
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-surface/30 p-1.5 sm:rounded-3xl sm:p-4">
        {hasComparison ? (
          <div className="w-full max-w-[960px]">
            <div ref={compareFrameRef} className="relative overflow-hidden rounded-xl sm:rounded-2xl">
              <img
                src={userPhotoDataUri ?? ""}
                alt="До"
                className="max-h-[60svh] w-full select-none object-contain sm:max-h-[75vh]"
                draggable={false}
              />

              <div
                className="pointer-events-none absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 0 0 ${compareValue}%)` }}
              >
                <img
                  src={resultImageDataUri ?? ""}
                  alt="После (inpainting)"
                  className="max-h-[60svh] w-full select-none object-contain sm:max-h-[75vh]"
                  draggable={false}
                />
              </div>

              <div
                role="slider"
                aria-label="Сравнение до и после"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(compareValue)}
                tabIndex={0}
                onKeyDown={onCompareKeyDown}
                onPointerDown={onComparePointerDown}
                onPointerMove={onComparePointerMove}
                onPointerUp={onComparePointerUp}
                onPointerCancel={onComparePointerUp}
                className="absolute inset-y-0 z-20 w-14 -translate-x-1/2 cursor-ew-resize touch-none outline-none sm:w-12"
                style={{ left: `${compareValue}%` }}
              >
                <div className="pointer-events-none absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-white/95 shadow-[0_0_0_1px_rgba(0,0,0,0.25),0_0_16px_rgba(123,98,198,0.45)]" />
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 bg-black/60 shadow-[0_0_14px_rgba(123,98,198,0.5)] sm:h-8 sm:w-8" />
              </div>

              <span className="pointer-events-none absolute left-2 top-2 rounded-full border border-white/25 bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white sm:left-3 sm:top-3 sm:py-1 sm:text-xs">
                До
              </span>
              <span className="pointer-events-none absolute right-2 top-2 rounded-full border border-white/25 bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white sm:right-3 sm:top-3 sm:py-1 sm:text-xs">
                После
              </span>
            </div>
          </div>
        ) : activeImage ? (
          <img
            src={activeImage}
            alt={hasResult ? "После (inpainting)" : "До"}
            className="max-h-[60svh] w-full rounded-xl object-contain sm:max-h-[75vh] sm:rounded-2xl"
          />
        ) : (
          <p className="text-sm text-white/70">{hasResult ? "Фото недоступно" : "Результат еще не готов"}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-3 sm:grid-cols-2">
        <Button variant="secondary" onClick={() => void onDownload()}>
          <Download className="mr-2 h-4 w-4" />
          Скачать
        </Button>
        <Button onClick={() => void onShare()}>
          <Share2 className="mr-2 h-4 w-4" />
          Поделиться
        </Button>
      </div>

      <div className="rounded-2xl border border-violet-400/25 bg-violet-500/[0.06] p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-violet-100">{hintsTitle}</p>
            <p className="text-xs text-violet-200/70">
              Рекомендации появляются после завершения AI-примерки.
            </p>
          </div>
          <Sparkles className="h-4 w-4 text-violet-300" />
        </div>

        {resultStyleHintsLoading ? (
          <p className="mt-3 text-sm text-violet-100/85">Подбираем стили...</p>
        ) : resultStyleHintsError ? (
          <div className="mt-3 rounded-xl border border-red-300/30 bg-red-500/10 p-3">
            <p className="text-sm text-red-200">{resultStyleHintsError}</p>
          </div>
        ) : resultStyleHints.length === 0 ? (
          <p className="mt-3 text-sm text-violet-100/85">Подсказок пока нет.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {resultStyleHints.map((hint, index) => (
              <li
                key={`${hint.style}-${index}`}
                className="rounded-xl border border-violet-200/20 bg-black/20 px-3 py-2"
              >
                <p className="text-sm font-semibold text-violet-100">{hint.style}</p>
                <p className="text-xs text-violet-100/80">{hint.reason}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
