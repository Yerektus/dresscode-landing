"use client";

import { create } from "zustand";
import { storageKeys } from "@/common/constants/storage-keys";
import type { TryOnState } from "@/common/entities/try-on-state";
import {
  clothingSizes,
  type ClothingSize,
  type WardrobeItem
} from "@/common/entities/wardrobe-item";
import {
  emptyProfile,
  isProfileComplete,
  isProfileValid,
  type UserGender,
  type UserProfile
} from "@/common/entities/profile";
import {
  resizeAndEncodeImageFile,
  dataUriToBlob,
  isQuotaExceededError
} from "@/common/utils/image-data-uri";
import { analyzeTryOn } from "@/common/api/requests/try-on/analyze";
import { toApiError } from "@/common/utils/http-error";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { deserializeWardrobe, serializeWardrobe } from "@/common/utils/wardrobe-storage";
import type { TryOnHistoryItem } from "@/common/entities/try-on-history-item";
import type { TryOnOutput, TryOnStyleHint } from "@/common/entities/try-on-result";
import type { TryOnOutputId } from "@/common/api/responses/try-on.response";

interface TryOnStore {
  state: TryOnState;
  userPhotoDataUri: string | null;
  resultImageDataUri: string | null;
  resultMimeType: string | null;
  resultOutputs: TryOnOutput[];
  profile: UserProfile;
  wardrobeItems: WardrobeItem[];
  selectedWardrobeItemIds: string[];
  historyItems: TryOnHistoryItem[];
  resultStyleHints: TryOnStyleHint[];
  resultStyleHintsLoading: boolean;
  resultStyleHintsError: string | null;
  needsCredits: boolean;

  canTryOn: () => boolean;
  selectedWardrobeItem: () => WardrobeItem | null;

  setUserPhotoFromFile: (file: File) => Promise<string | null>;
  removePhoto: () => void;
  addWardrobeItem: (payload: {
    file: File;
    size: ClothingSize;
    name?: string;
  }) => Promise<string | null>;
  removeWardrobeItem: (id: string) => void;
  updateWardrobeItem: (id: string, payload: { name: string; size: ClothingSize }) => void;
  selectWardrobeItem: (id: string) => void;
  updateProfile: (payload: {
    heightCm: number | null;
    weightKg: number | null;
    gender: UserGender | null;
    ageYears: number | null;
  }) => void;
  startTryOn: () => Promise<string | null>;
  resetResult: () => void;
  resetAll: () => void;
  clearNeedsCredits: () => void;
  clearHistory: () => void;
}

const tryOnOutputIds: TryOnOutputId[] = ["inpaint", "front", "left_45"];
const clothingSizesSet = new Set<string>(clothingSizes);

const readJson = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

const removeKey = (key: string): void => {
  localStorage.removeItem(key);
};

const safePersist = (state: {
  profile: UserProfile;
  wardrobeItems: WardrobeItem[];
  selectedWardrobeItemIds: string[];
}): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    writeJson(storageKeys.profile, state.profile);
    localStorage.setItem(storageKeys.wardrobe, serializeWardrobe(state.wardrobeItems));

    if (state.selectedWardrobeItemIds.length > 0) {
      localStorage.setItem(storageKeys.wardrobeSelected, JSON.stringify(state.selectedWardrobeItemIds));
    } else {
      removeKey(storageKeys.wardrobeSelected);
    }

    return null;
  } catch (error) {
    if (isQuotaExceededError(error)) {
      return "Недостаточно памяти браузера. Удалите часть одежды и попробуйте снова.";
    }

    return "Не удалось сохранить локальные данные.";
  }
};

const initialWardrobe =
  typeof window === "undefined"
    ? []
    : deserializeWardrobe(localStorage.getItem(storageKeys.wardrobe) ?? "[]");

const readSelectedWardrobeIds = (): string[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = localStorage.getItem(storageKeys.wardrobeSelected);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((value): value is string => typeof value === "string");
    }
  } catch {
    // backward-compat for old format where a single id string was stored directly
    return [raw];
  }

  return [];
};

const initialSelectedWardrobeIds = readSelectedWardrobeIds();
const normalizedSelectedIds = initialSelectedWardrobeIds.filter((id) =>
  initialWardrobe.some((item) => item.id === id)
);

const MAX_TRY_ON_HISTORY_ITEMS = 18;

const isTryOnOutputId = (value: unknown): value is TryOnOutputId =>
  typeof value === "string" && tryOnOutputIds.includes(value as TryOnOutputId);

const normalizeOutput = (value: unknown): TryOnOutput | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<TryOnOutput>;
  if (!isTryOnOutputId(candidate.id)) {
    return null;
  }

  if (typeof candidate.imageDataUri !== "string" || candidate.imageDataUri.length === 0) {
    return null;
  }

  const mimeType =
    typeof candidate.mimeType === "string" && candidate.mimeType.length > 0
      ? candidate.mimeType
      : "image/png";

  return {
    id: candidate.id,
    imageDataUri: candidate.imageDataUri,
    mimeType
  };
};

const normalizeHistoryItem = (value: unknown): TryOnHistoryItem | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Partial<TryOnHistoryItem>;
  if (
    typeof item.id !== "string" ||
    typeof item.createdAt !== "string" ||
    typeof item.clothingName !== "string" ||
    typeof item.clothingSize !== "string" ||
    !clothingSizesSet.has(item.clothingSize)
  ) {
    return null;
  }

  const normalizedOutputs = Array.isArray(item.outputs)
    ? item.outputs.map((output) => normalizeOutput(output)).filter((output): output is TryOnOutput => output !== null)
    : [];

  const primaryOutput = normalizedOutputs.find((output) => output.id === "inpaint");
  const fallbackDataUri =
    typeof item.resultImageDataUri === "string" && item.resultImageDataUri.length > 0
      ? item.resultImageDataUri
      : null;
  const fallbackMimeType =
    typeof item.resultMimeType === "string" && item.resultMimeType.length > 0
      ? item.resultMimeType
      : "image/png";

  const outputs =
    normalizedOutputs.length > 0
      ? normalizedOutputs
      : fallbackDataUri
        ? [
            {
              id: "inpaint" as const,
              imageDataUri: fallbackDataUri,
              mimeType: fallbackMimeType
            }
          ]
        : [];

  const resultingOutput =
    primaryOutput ??
    outputs.find((output) => output.id === "inpaint") ??
    outputs.find((output) => output.id === "front") ??
    outputs[0] ??
    null;
  if (!resultingOutput) {
    return null;
  }

  return {
    id: item.id,
    createdAt: item.createdAt,
    clothingName: item.clothingName,
    clothingSize: item.clothingSize as ClothingSize,
    resultImageDataUri: resultingOutput.imageDataUri,
    resultMimeType: resultingOutput.mimeType,
    outputs,
    creditsSpent: typeof item.creditsSpent === "number" ? item.creditsSpent : 0,
    remainingCredits: typeof item.remainingCredits === "number" ? item.remainingCredits : 0
  };
};

const normalizeHistory = (items: unknown[]): TryOnHistoryItem[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => normalizeHistoryItem(item))
    .filter((item): item is TryOnHistoryItem => item !== null)
    .slice(0, MAX_TRY_ON_HISTORY_ITEMS);
};

const initialHistory = normalizeHistory(readJson<unknown[]>(storageKeys.tryOnHistory, []));

const persistHistory = (items: TryOnHistoryItem[]): TryOnHistoryItem[] => {
  const normalized = normalizeHistory(items);

  if (typeof window === "undefined") {
    return normalized;
  }

  let nextItems = normalized;

  while (nextItems.length > 0) {
    try {
      writeJson(storageKeys.tryOnHistory, nextItems);
      return nextItems;
    } catch (error) {
      if (!isQuotaExceededError(error)) {
        return nextItems;
      }

      nextItems = nextItems.slice(0, nextItems.length - 1);
    }
  }

  removeKey(storageKeys.tryOnHistory);
  return [];
};

export const useTryOnStore = create<TryOnStore>((set, get) => ({
  state: "idle",
  userPhotoDataUri: null,
  resultImageDataUri: null,
  resultMimeType: null,
  resultOutputs: [],
  profile: readJson<UserProfile>(storageKeys.profile, emptyProfile),
  wardrobeItems: initialWardrobe,
  selectedWardrobeItemIds: normalizedSelectedIds,
  historyItems: initialHistory,
  resultStyleHints: [],
  resultStyleHintsLoading: false,
  resultStyleHintsError: null,
  needsCredits: false,

  canTryOn: () => {
    const state = get();
    return (
      !!state.userPhotoDataUri &&
      !!state.selectedWardrobeItem() &&
      isProfileComplete(state.profile) &&
      isProfileValid(state.profile)
    );
  },

  selectedWardrobeItem: () => {
    const state = get();
    const [firstSelectedId] = state.selectedWardrobeItemIds;
    return state.wardrobeItems.find((item) => item.id === firstSelectedId) ?? null;
  },

  setUserPhotoFromFile: async (file) => {
    try {
      const dataUri = await resizeAndEncodeImageFile(file, 1400, 0.85);
      set({
        userPhotoDataUri: dataUri,
        state: "photoLoaded"
      });
      return null;
    } catch {
      return "Не удалось загрузить фотографию. Попробуйте другое изображение.";
    }
  },

  removePhoto: () => {
    set({
      userPhotoDataUri: null,
      resultImageDataUri: null,
      resultMimeType: null,
      resultOutputs: [],
      resultStyleHints: [],
      resultStyleHintsLoading: false,
      resultStyleHintsError: null,
      state: "idle",
      needsCredits: false
    });
  },

  addWardrobeItem: async ({ file, size, name }) => {
    try {
      const imageDataUri = await resizeAndEncodeImageFile(file, 1400, 0.85);
      const state = get();
      const item: WardrobeItem = {
        id: `${Date.now()}`,
        name: name?.trim() ? name.trim() : `Вещь ${state.wardrobeItems.length + 1}`,
        imageDataUri,
        size,
        createdAt: new Date().toISOString()
      };

      const wardrobeItems = [item, ...state.wardrobeItems];
      const selectedWardrobeItemIds = [item.id, ...state.selectedWardrobeItemIds];

      const persistError = safePersist({
        profile: state.profile,
        wardrobeItems,
        selectedWardrobeItemIds
      });

      if (persistError) {
        return persistError;
      }

      set({ wardrobeItems, selectedWardrobeItemIds });

      return null;
    } catch {
      return "Не удалось добавить одежду.";
    }
  },

  removeWardrobeItem: (id) => {
    const state = get();
    const wardrobeItems = state.wardrobeItems.filter((item) => item.id !== id);
    const selectedWardrobeItemIds = state.selectedWardrobeItemIds.filter(
      (selectedId) => selectedId !== id
    );

    safePersist({
      profile: state.profile,
      wardrobeItems,
      selectedWardrobeItemIds
    });

    set({
      wardrobeItems,
      selectedWardrobeItemIds
    });
  },

  updateWardrobeItem: (id, payload) => {
    const state = get();
    const existing = state.wardrobeItems.find((item) => item.id === id);
    if (!existing) {
      return;
    }

    const normalizedName = payload.name.trim();
    const wardrobeItems = state.wardrobeItems.map((item) => {
      if (item.id !== id) {
        return item;
      }

      return {
        ...item,
        name: normalizedName.length > 0 ? normalizedName : item.name,
        size: payload.size
      };
    });

    safePersist({
      profile: state.profile,
      wardrobeItems,
      selectedWardrobeItemIds: state.selectedWardrobeItemIds
    });

    set({ wardrobeItems });
  },

  selectWardrobeItem: (id) => {
    const state = get();
    if (!state.wardrobeItems.some((item) => item.id === id)) {
      return;
    }

    const selectedWardrobeItemIds = state.selectedWardrobeItemIds.includes(id)
      ? state.selectedWardrobeItemIds.filter((selectedId) => selectedId !== id)
      : [...state.selectedWardrobeItemIds, id];

    safePersist({
      profile: state.profile,
      wardrobeItems: state.wardrobeItems,
      selectedWardrobeItemIds
    });

    set({ selectedWardrobeItemIds });
  },

  updateProfile: ({ heightCm, weightKg, gender, ageYears }) => {
    const state = get();
    const profile = {
      heightCm,
      weightKg,
      gender,
      ageYears
    };

    safePersist({
      profile,
      wardrobeItems: state.wardrobeItems,
      selectedWardrobeItemIds: state.selectedWardrobeItemIds
    });

    set({ profile });
  },

  startTryOn: async () => {
    const state = get();
    const auth = useAuthStore.getState();

    if (!auth.isAuthenticated || !auth.user) {
      return "Войдите в аккаунт, чтобы выполнить примерку.";
    }

    const selected = state.selectedWardrobeItem();
    if (!state.userPhotoDataUri || !selected) {
      return "Загрузите фото и выберите одежду.";
    }

    if (!isProfileValid(state.profile)) {
      return "Заполните корректно рост, вес, пол и возраст.";
    }

    const personBlob = dataUriToBlob(state.userPhotoDataUri);
    const clothingBlob = dataUriToBlob(selected.imageDataUri);

    if (!personBlob || !clothingBlob) {
      return "Не удалось прочитать изображение. Попробуйте загрузить файлы снова.";
    }

    set({
      state: "processing",
      resultStyleHints: [],
      resultStyleHintsLoading: false,
      resultStyleHintsError: null
    });

    try {
      const result = await analyzeTryOn({
        personImage: personBlob,
        clothingImage: clothingBlob,
        clothingName: selected.name,
        clothingSize: selected.size,
        heightCm: state.profile.heightCm!,
        weightKg: state.profile.weightKg!,
        gender: state.profile.gender!,
        ageYears: state.profile.ageYears!
      });

      const outputs = result.outputs.length > 0 ? result.outputs : [];
      const primaryOutput =
        outputs.find((output) => output.id === "inpaint") ??
        outputs.find((output) => output.id === "front") ??
        outputs[0] ??
        null;

      auth.updateCredits(result.remainingCredits);
      const historyItem: TryOnHistoryItem = {
        id: `${result.jobId}-${Date.now()}`,
        createdAt: new Date().toISOString(),
        clothingName: selected.name,
        clothingSize: selected.size,
        resultImageDataUri: primaryOutput?.imageDataUri ?? result.imageDataUri,
        resultMimeType: primaryOutput?.mimeType ?? result.mimeType,
        outputs,
        creditsSpent: result.creditsSpent,
        remainingCredits: result.remainingCredits
      };
      const historyItems = persistHistory([historyItem, ...state.historyItems]);

      set({
        resultImageDataUri: primaryOutput?.imageDataUri ?? result.imageDataUri,
        resultMimeType: primaryOutput?.mimeType ?? result.mimeType,
        resultOutputs: outputs,
        resultStyleHints: [],
        resultStyleHintsLoading: false,
        resultStyleHintsError: null,
        state: "result",
        needsCredits: false,
        historyItems
      });

      return null;
    } catch (error) {
      const parsed = toApiError(error);
      const fallbackState: TryOnState = state.userPhotoDataUri ? "photoLoaded" : "idle";

      if (parsed.status === 402) {
        set({ state: fallbackState, needsCredits: true });
        return "Недостаточно кредитов. Пополните баланс.";
      }

      if (parsed.status === 401) {
        set({ state: fallbackState });
        return "Сессия истекла. Войдите снова.";
      }

      set({ state: fallbackState });
      return parsed.message || "Не удалось выполнить AI примерку.";
    }
  },

  resetResult: () => {
    const hasPhoto = !!get().userPhotoDataUri;
    set({
      state: hasPhoto ? "photoLoaded" : "idle",
      resultImageDataUri: null,
      resultMimeType: null,
      resultOutputs: [],
      resultStyleHints: [],
      resultStyleHintsLoading: false,
      resultStyleHintsError: null
    });
  },

  resetAll: () => {
    if (typeof window !== "undefined") {
      removeKey(storageKeys.profile);
      removeKey(storageKeys.wardrobe);
      removeKey(storageKeys.wardrobeSelected);
      removeKey(storageKeys.tryOnHistory);
    }

    set({
      state: "idle",
      userPhotoDataUri: null,
      resultImageDataUri: null,
      resultMimeType: null,
      resultOutputs: [],
      profile: emptyProfile,
      wardrobeItems: [],
      selectedWardrobeItemIds: [],
      historyItems: [],
      resultStyleHints: [],
      resultStyleHintsLoading: false,
      resultStyleHintsError: null,
      needsCredits: false
    });
  },

  clearNeedsCredits: () => {
    if (!get().needsCredits) {
      return;
    }

    set({ needsCredits: false });
  },

  clearHistory: () => {
    if (typeof window !== "undefined") {
      removeKey(storageKeys.tryOnHistory);
    }

    set({ historyItems: [] });
  }
}));
