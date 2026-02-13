"use client";

import React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Globe2, Hash, ImagePlus, Lock, Sparkles, Users, X } from "lucide-react";
import { toast } from "sonner";
import { createLook, deleteMyLookDraft } from "@/common/api/requests/social";
import { socialConfig } from "@/common/config/social.config";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Card } from "@/common/components/ui/card";
import { AlertDialog } from "@/common/components/ui/alert-dialog";
import { Input } from "@/common/components/ui/input";
import { Select } from "@/common/components/ui/select";
import type { SocialLookVisibility } from "@/common/entities/social/social-look";
import type { UpsertMyLookDraftPayload } from "@/common/entities/social/social-look-draft";
import { toApiError } from "@/common/utils/http-error";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { SOCIAL_LIMITS } from "@/features/social/constants";
import {
  useMyLookDraftQuery,
  useUpsertMyLookDraftMutation
} from "@/features/social/hooks/use-social-queries";
import { socialQueryKeys } from "@/features/social/query-keys";
import { SocialDisabledCard } from "@/features/social/components/social-disabled-card";
import { isValidLookDescription, isValidLookTitle } from "@/features/social/validators";

const STYLE_OPTIONS = ["Casual", "Streetwear", "Office", "Sport", "Evening", "Minimal"] as const;

const VISIBILITY_OPTIONS: Array<{
  value: SocialLookVisibility;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: "public", label: "Публично", icon: Globe2 },
  { value: "followers", label: "Подписчики", icon: Users },
  { value: "private", label: "Только я", icon: Lock }
];

interface PublishLookDraft {
  title: string;
  description: string;
  style: string;
  visibility: SocialLookVisibility;
  tagsValue: string;
  photoDataUri: string | null;
}

interface DraftSaveTask {
  payload: UpsertMyLookDraftPayload;
  photoRevision: number;
}

type DraftSaveStatus = "idle" | "saving" | "saved" | "error";

const emptyDraft: PublishLookDraft = {
  title: "",
  description: "",
  style: STYLE_OPTIONS[0],
  visibility: "public",
  tagsValue: "",
  photoDataUri: null
};

const DRAFT_AUTOSAVE_DEBOUNCE_MS = 1200;

const getSavedAgoLabel = (savedAt: number): string => {
  const diffSeconds = Math.max(0, Math.floor((Date.now() - savedAt) / 1000));

  if (diffSeconds < 5) {
    return "только что";
  }

  if (diffSeconds < 60) {
    return `${diffSeconds} сек назад`;
  }

  const minutes = Math.floor(diffSeconds / 60);
  return `${minutes} мин назад`;
};

export const PublishLookView = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const user = useAuthStore((state) => state.user);
  const draftFeatureEnabled = socialConfig.enabled && socialConfig.draftEnabled;
  const draftQuery = useMyLookDraftQuery(draftFeatureEnabled);
  const upsertDraftMutation = useUpsertMyLookDraftMutation();

  const [title, setTitle] = useState(emptyDraft.title);
  const [description, setDescription] = useState(emptyDraft.description);
  const [style, setStyle] = useState<string>(emptyDraft.style);
  const [visibility, setVisibility] = useState<SocialLookVisibility>(emptyDraft.visibility);
  const [tagsValue, setTagsValue] = useState(emptyDraft.tagsValue);
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(emptyDraft.photoDataUri);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoRevision, setPhotoRevision] = useState(0);
  const [removePhotoDialogOpen, setRemovePhotoDialogOpen] = useState(false);
  const [draftHydrated, setDraftHydrated] = useState(!draftFeatureEnabled);
  const [draftStatus, setDraftStatus] = useState<DraftSaveStatus>("idle");
  const [lastSavedAtMs, setLastSavedAtMs] = useState<number | null>(null);
  const [, setStatusRefreshTick] = useState(0);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestTaskRef = useRef<DraftSaveTask | null>(null);
  const failedTaskRef = useRef<DraftSaveTask | null>(null);
  const inFlightRef = useRef(false);
  const queuedRef = useRef(false);
  const hasUserEditedRef = useRef(false);
  const savedPhotoRevisionRef = useRef(0);
  const draftLoadErrorShownRef = useRef(false);
  const upsertDraftMutateRef = useRef(upsertDraftMutation.mutateAsync);

  const tags = useMemo(
    () =>
      tagsValue
        .split(/[,\s]+/)
        .map((tag) => tag.trim().replace(/^#+/, ""))
        .filter(Boolean)
        .slice(0, SOCIAL_LIMITS.maxTags),
    [tagsValue]
  );

  const remainingDescription = SOCIAL_LIMITS.lookDescriptionMax - description.length;
  const autosaveLabel = (() => {
    if (!draftFeatureEnabled) {
      return null;
    }

    if (!draftHydrated && draftQuery.isLoading) {
      return "Загружаем серверный черновик...";
    }

    if (draftStatus === "saving") {
      return "Сохраняем...";
    }

    if (draftStatus === "error") {
      return "Ошибка сохранения";
    }

    if (draftStatus === "saved" && lastSavedAtMs) {
      return `Сохранено ${getSavedAgoLabel(lastSavedAtMs)}`;
    }

    return "Черновик сохраняется автоматически";
  })();

  const resetForm = () => {
    hasUserEditedRef.current = false;
    setTitle(emptyDraft.title);
    setDescription(emptyDraft.description);
    setStyle(emptyDraft.style);
    setVisibility(emptyDraft.visibility);
    setTagsValue(emptyDraft.tagsValue);
    setPhotoDataUri(emptyDraft.photoDataUri);
    setPhotoFile(null);
    setPhotoRevision(0);
  };

  const runAutosave = useCallback(async () => {
    if (!draftFeatureEnabled) {
      return;
    }

    if (inFlightRef.current) {
      queuedRef.current = true;
      return;
    }

    const task = latestTaskRef.current;
    if (!task) {
      return;
    }

    inFlightRef.current = true;
    setDraftStatus("saving");

    try {
      const savedDraft = await upsertDraftMutateRef.current(task.payload);

      if (task.photoRevision > savedPhotoRevisionRef.current) {
        savedPhotoRevisionRef.current = task.photoRevision;
      }

      if (savedDraft) {
        queryClient.setQueryData(socialQueryKeys.publishDraft("me"), savedDraft);
        const updatedAtMs = Date.parse(savedDraft.updatedAt);
        setLastSavedAtMs(Number.isNaN(updatedAtMs) ? Date.now() : updatedAtMs);
      } else {
        setLastSavedAtMs(Date.now());
      }

      setDraftStatus("saved");
      failedTaskRef.current = null;
    } catch (error) {
      failedTaskRef.current = task;
      setDraftStatus("error");

      const parsed = toApiError(error);
      const message =
        parsed.status === 413
          ? "Сервер отклонил фото черновика из-за размера."
          : "Не удалось сохранить черновик на сервере.";

      toast.error(message, {
        action: {
          label: "Повторить",
          onClick: () => {
            if (!failedTaskRef.current) {
              return;
            }

            latestTaskRef.current = failedTaskRef.current;
            queuedRef.current = true;
            void runAutosave();
          }
        }
      });
    } finally {
      inFlightRef.current = false;

      if (queuedRef.current) {
        queuedRef.current = false;
        void runAutosave();
      }
    }
  }, [draftFeatureEnabled, queryClient]);

  useEffect(() => {
    upsertDraftMutateRef.current = upsertDraftMutation.mutateAsync;
  }, [upsertDraftMutation.mutateAsync]);

  useEffect(() => {
    if (!draftFeatureEnabled || draftHydrated) {
      return;
    }

    if (draftQuery.isError && !draftLoadErrorShownRef.current) {
      draftLoadErrorShownRef.current = true;
      setDraftHydrated(true);
      setDraftStatus("error");
      toast.error("Не удалось загрузить черновик с сервера.");
      return;
    }

    if (draftQuery.isLoading) {
      return;
    }

    if (draftQuery.data) {
      const serverDraft = draftQuery.data;
      const serverImage = serverDraft.imageDataUri ?? serverDraft.imageUrl ?? null;

      setTitle(serverDraft.title);
      setDescription(serverDraft.description);
      setStyle(serverDraft.style || STYLE_OPTIONS[0]);
      setVisibility(serverDraft.visibility);
      setTagsValue(serverDraft.tags.join(", "));
      setPhotoDataUri(serverImage);
      setPhotoFile(null);
      setDraftStatus("saved");

      const updatedAtMs = Date.parse(serverDraft.updatedAt);
      setLastSavedAtMs(Number.isNaN(updatedAtMs) ? Date.now() : updatedAtMs);
    }

    setDraftHydrated(true);
  }, [draftFeatureEnabled, draftHydrated, draftQuery.data, draftQuery.isError, draftQuery.isLoading]);

  useEffect(() => {
    if (draftStatus !== "saved" || !lastSavedAtMs) {
      return;
    }

    const timerId = setInterval(() => {
      setStatusRefreshTick((value) => value + 1);
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [draftStatus, lastSavedAtMs]);

  useEffect(() => {
    if (!draftFeatureEnabled || !draftHydrated) {
      return;
    }

    if (!hasUserEditedRef.current) {
      return;
    }

    if (title.length > SOCIAL_LIMITS.lookTitleMax || description.length > SOCIAL_LIMITS.lookDescriptionMax) {
      return;
    }

    const payload: UpsertMyLookDraftPayload = {
      title,
      description,
      style,
      visibility,
      tags
    };

    if (photoRevision > savedPhotoRevisionRef.current) {
      if (photoFile) {
        payload.image = photoFile;
      } else if (!photoDataUri) {
        payload.clearImage = true;
      }
    }

    latestTaskRef.current = {
      payload,
      photoRevision
    };

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      void runAutosave();
    }, DRAFT_AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    description,
    draftFeatureEnabled,
    draftHydrated,
    photoDataUri,
    photoFile,
    photoRevision,
    runAutosave,
    style,
    tags,
    title,
    visibility
  ]);

  const publishMutation = useMutation({
    mutationFn: createLook,
    onSuccess: async () => {
      if (user?.id) {
        void queryClient.invalidateQueries({ queryKey: socialQueryKeys.profile(user.id) });
        void queryClient.invalidateQueries({ queryKey: socialQueryKeys.looks(user.id) });
      }
      void queryClient.invalidateQueries({ queryKey: socialQueryKeys.profile("me") });
      void queryClient.invalidateQueries({ queryKey: socialQueryKeys.looks("me") });
      void queryClient.invalidateQueries({ queryKey: socialQueryKeys.publishedLooks() });

      if (draftFeatureEnabled) {
        try {
          await deleteMyLookDraft();
        } catch {
          // Ignore cleanup errors after successful publish.
        }

        queryClient.setQueryData(socialQueryKeys.publishDraft("me"), null);
      }

      hasUserEditedRef.current = false;
      savedPhotoRevisionRef.current = 0;
      setDraftStatus("idle");
      setLastSavedAtMs(null);
      toast.success("Лук опубликован.");
      router.push("/app/profile?tab=looks");
    },
    onError: () => {
      toast.error("Не удалось опубликовать лук.");
    }
  });

  const onPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Можно загрузить только изображение.");
      event.target.value = "";
      return;
    }

    if (file.size > SOCIAL_LIMITS.maxImageSizeBytes) {
      toast.error("Размер файла должен быть меньше 5 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      hasUserEditedRef.current = true;
      setPhotoDataUri(result);
      setPhotoFile(file);
      setPhotoRevision((value) => value + 1);
      event.target.value = "";
    };
    reader.onerror = () => {
      toast.error("Не удалось прочитать файл.");
      event.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  const onRemovePhoto = () => {
    if (!photoDataUri) {
      return;
    }

    setRemovePhotoDialogOpen(true);
  };

  const onConfirmRemovePhoto = () => {
    hasUserEditedRef.current = true;
    setPhotoDataUri(null);
    setPhotoFile(null);
    setPhotoRevision((value) => value + 1);
    setRemovePhotoDialogOpen(false);
  };

  const onTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    hasUserEditedRef.current = true;
    setTitle(event.target.value);
  };

  const onDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    hasUserEditedRef.current = true;
    setDescription(event.target.value.slice(0, SOCIAL_LIMITS.lookDescriptionMax));
  };

  const onStyleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    hasUserEditedRef.current = true;
    setStyle(event.target.value);
  };

  const onVisibilityChange = (nextVisibility: SocialLookVisibility) => {
    hasUserEditedRef.current = true;
    setVisibility(nextVisibility);
  };

  const onTagsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    hasUserEditedRef.current = true;
    setTagsValue(event.target.value);
  };

  const resolvePublishImage = useCallback(async (): Promise<File | null> => {
    if (photoFile) {
      return photoFile;
    }

    if (!photoDataUri) {
      return null;
    }

    try {
      const response = await fetch(photoDataUri);
      if (!response.ok) {
        return null;
      }

      const blob = await response.blob();
      const extension = blob.type.includes("png") ? "png" : "jpg";
      return new File([blob], `draft-look.${extension}`, {
        type: blob.type || "image/jpeg"
      });
    } catch {
      return null;
    }
  }, [photoDataUri, photoFile]);

  const onPublish = async () => {
    const normalizedTitle = title.trim();

    if (!isValidLookTitle(normalizedTitle)) {
      toast.error("Добавьте название лука.");
      return;
    }

    if (!isValidLookDescription(description)) {
      toast.error("Описание слишком длинное.");
      return;
    }

    const imageForPublish = await resolvePublishImage();

    if (!imageForPublish) {
      toast.error("Добавьте фото лука перед публикацией.");
      return;
    }

    await publishMutation.mutateAsync({
      image: imageForPublish,
      title: normalizedTitle,
      description: description.trim(),
      style,
      visibility,
      tags
    });

    resetForm();
  };

  if (!socialConfig.enabled) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] w-full flex-col">
        <SocialDisabledCard />
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] w-full flex-col">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-white">Публикация лука</h1>
        <p className="mt-1 text-sm text-higgs-text-muted">Поделитесь своим стилем с сообществом AI TRYON.</p>
      </div>

      <section className="grid gap-6 pb-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        <Card className="border-white/10">
          <div className="flex h-full min-h-[420px] flex-col">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-white">Фото лука</p>
              <div className="flex items-center gap-2">
                {photoDataUri && (
                  <Button type="button" variant="ghost" size="sm" onClick={onRemovePhoto}>
                    <X className="mr-1 h-3.5 w-3.5" />
                    Удалить
                  </Button>
                )}
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-white/10">
                  <ImagePlus className="h-4 w-4" />
                  Загрузить фото
                  <input type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
                </label>
              </div>
            </div>

            <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4">
              {photoDataUri ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoDataUri} alt="Предпросмотр лука" className="h-full w-full rounded-xl object-cover" />
              ) : (
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    <ImagePlus className="h-5 w-5 text-higgs-text-muted" />
                  </div>
                  <p className="text-sm font-medium text-white">Перетащите фото или выберите файл</p>
                  <p className="mt-1 text-xs text-higgs-text-muted">Поддерживается JPG/PNG до 5 MB</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="border-white/10">
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void onPublish();
            }}
          >
            {draftFeatureEnabled && autosaveLabel && (
              <p
                className={`text-xs ${
                  draftStatus === "error" ? "text-red-300" : "text-higgs-text-muted"
                }`}
              >
                {autosaveLabel}
              </p>
            )}

            <Input
              label="Название лука"
              placeholder="Например: Urban Night Fit"
              value={title}
              onChange={onTitleChange}
              maxLength={SOCIAL_LIMITS.lookTitleMax}
            />

            <div className="space-y-1.5">
              <label className="ml-1 block text-xs font-medium text-higgs-text-muted">Описание</label>
              <textarea
                value={description}
                onChange={onDescriptionChange}
                placeholder="Расскажите про сочетание вещей, настроение и стиль."
                className="min-h-[130px] w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 shadow-inner transition-all focus:scale-[1.01] focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
              />
              <p className="text-right text-[11px] text-higgs-text-muted">{remainingDescription}</p>
            </div>

            <Select value={style} onChange={onStyleChange} aria-label="Стиль">
              {STYLE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>

            <div className="space-y-2">
              <p className="ml-1 text-xs font-medium text-higgs-text-muted">Видимость</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {VISIBILITY_OPTIONS.map((item) => {
                  const isActive = visibility === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => onVisibilityChange(item.value)}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-medium transition-colors ${
                        isActive
                          ? "border-violet-400/45 bg-violet-500/15 text-white"
                          : "border-white/10 bg-white/5 text-higgs-text-muted hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <Input
              label="Теги"
              placeholder="streetwear, autumn, minimal"
              value={tagsValue}
              onChange={onTagsChange}
              icon={<Hash className="h-4 w-4" />}
            />

            <div className="flex min-h-8 flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} className="border-white/15 bg-white/5 text-white">
                  #{tag}
                </Badge>
              ))}
              {tags.length === 0 && (
                <p className="text-xs text-higgs-text-muted">
                  Добавьте до {SOCIAL_LIMITS.maxTags} тегов через пробел или запятую
                </p>
              )}
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full" disabled={publishMutation.isPending}>
                <Sparkles className="mr-2 h-4 w-4" />
                {publishMutation.isPending ? "Публикуем..." : "Опубликовать лук"}
              </Button>
            </div>
          </form>
        </Card>
      </section>

      <AlertDialog
        open={removePhotoDialogOpen}
        title="Удалить фото?"
        description="Фото будет удалено из черновика."
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        confirmVariant="destructive"
        onCancel={() => setRemovePhotoDialogOpen(false)}
        onConfirm={onConfirmRemovePhoto}
      />
    </main>
  );
};
