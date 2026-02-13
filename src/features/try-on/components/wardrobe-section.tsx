"use client";

import React from "react";
import { useEffect, useMemo, useState } from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Select } from "@/common/components/ui/select";
import { AlertDialog } from "@/common/components/ui/alert-dialog";
import { cn } from "@/common/utils/cn";
import {
  clothingSizeLabels,
  clothingSizes,
  type ClothingSize,
  type WardrobeItem
} from "@/common/entities/wardrobe-item";
import { PhotoSourceSheet } from "@/features/try-on/components/photo-source-sheet";
import { useTryOnStore } from "@/features/try-on/stores/try-on-store";
import { Modal } from "@/common/components/ui/modal";
import { toast } from "sonner";

const WardrobeCard = ({
  item,
  selected,
  onSelect,
  onEdit,
  onDelete
}: {
  item: WardrobeItem;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border transition-colors",
        selected
          ? "border-violet-400/65 bg-violet-500/[0.06] shadow-[0_0_16px_rgba(217,70,239,0.22),inset_0_1px_0_rgba(255,255,255,0.05)]"
          : "border-white/10 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]"
      )}
    >
      <div className="flex snap-x snap-mandatory overflow-x-auto touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="min-w-full snap-start p-3">
          <button
            type="button"
            role="checkbox"
            aria-checked={selected}
            aria-label={selected ? "Снять выбор" : "Выбрать для примерки"}
            onClick={onSelect}
            className="flex w-full items-center justify-between gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/75"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageDataUri}
                  alt={item.name}
                  className={cn(
                    "h-14 w-14 rounded-xl object-cover sm:h-16 sm:w-16",
                    selected ? "ring-2 ring-violet-400/75" : "ring-1 ring-white/10"
                  )}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white sm:text-base">{item.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-higgs-text-muted">
                    Размер: {clothingSizeLabels[item.size]}
                  </span>
                </div>
              </div>
            </div>

            <span
              aria-hidden="true"
              className={cn(
                "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors sm:h-9 sm:w-9",
                selected
                  ? "border-violet-400/70 bg-violet-500/20 text-violet-100"
                  : "border-white/15 bg-white/5 text-transparent hover:border-white/30"
              )}
            >
              <Check className="h-4 w-4" />
            </span>
          </button>
        </div>

        <div className="grid w-56 shrink-0 snap-end grid-cols-2 border-l border-white/10 sm:w-64">
          <button
            type="button"
            onClick={onEdit}
            className="flex h-full w-full flex-col items-center justify-center gap-1.5 border-r border-white/10 bg-white/[0.02] px-3 py-3 text-center text-higgs-text-muted transition-colors hover:bg-white/[0.06] hover:text-white sm:gap-2 sm:py-4"
          >
            <Pencil className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-xs font-medium sm:text-sm">Редактировать</span>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-red-500/15 px-3 py-3 text-center text-red-200 transition-colors hover:bg-red-500/25 hover:text-red-100 sm:gap-2 sm:py-4"
          >
            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-xs font-medium sm:text-sm">Удалить</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export const WardrobeSection = () => {
  const wardrobeItems = useTryOnStore((state) => state.wardrobeItems);
  const selectedWardrobeItemIds = useTryOnStore((state) => state.selectedWardrobeItemIds);
  const selectWardrobeItem = useTryOnStore((state) => state.selectWardrobeItem);
  const updateWardrobeItem = useTryOnStore((state) => state.updateWardrobeItem);
  const removeWardrobeItem = useTryOnStore((state) => state.removeWardrobeItem);
  const addWardrobeItem = useTryOnStore((state) => state.addWardrobeItem);

  const [openCreate, setOpenCreate] = useState(false);
  const [openPicker, setOpenPicker] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSize, setNewSize] = useState<ClothingSize>("m");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [wardrobeItemIdToEdit, setWardrobeItemIdToEdit] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSize, setEditSize] = useState<ClothingSize>("m");
  const [wardrobeItemIdToDelete, setWardrobeItemIdToDelete] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedLabel = useMemo(() => {
    if (!selectedFile) {
      return "Фото одежды не выбрано";
    }

    return selectedFile.name;
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (selectedPreview) {
        URL.revokeObjectURL(selectedPreview);
      }
    };
  }, [selectedPreview]);

  const onSave = async () => {
    if (!selectedFile) {
      toast.error("Сначала выберите фото одежды");
      return;
    }

    setSaving(true);
    const error = await addWardrobeItem({
      file: selectedFile,
      size: newSize,
      name: newName
    });
    setSaving(false);

    if (error) {
      toast.error(error);
      return;
    }

    setSelectedFile(null);
    setSelectedPreview(null);
    setNewName("");
    setNewSize("m");
    setOpenCreate(false);
  };

  const onPickFile = (file: File) => {
    if (selectedPreview) {
      URL.revokeObjectURL(selectedPreview);
    }
    setSelectedFile(file);
    setSelectedPreview(URL.createObjectURL(file));
  };

  const onEditWardrobeItem = (itemId: string) => {
    const item = wardrobeItems.find((entry) => entry.id === itemId);
    if (!item) {
      return;
    }

    setWardrobeItemIdToEdit(item.id);
    setEditName(item.name);
    setEditSize(item.size);
  };

  const onSaveWardrobeItemEdit = () => {
    if (!wardrobeItemIdToEdit) {
      return;
    }

    updateWardrobeItem(wardrobeItemIdToEdit, {
      name: editName,
      size: editSize
    });
    setWardrobeItemIdToEdit(null);
  };

  const onDeleteWardrobeItem = (itemId: string) => {
    setWardrobeItemIdToDelete(itemId);
  };

  const onConfirmDeleteWardrobeItem = () => {
    if (!wardrobeItemIdToDelete) {
      return;
    }

    removeWardrobeItem(wardrobeItemIdToDelete);
    setWardrobeItemIdToDelete(null);
  };

  return (
    <>
      <Card>
        <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-lg text-white sm:text-xl">Моя одежда</h2>
            <p className="text-sm text-higgs-text-muted">Добавьте фото вещи и выберите размер</p>
          </div>
          <Button variant="secondary" className="w-full sm:w-auto" onClick={() => setOpenCreate(true)}>
            Добавить
          </Button>
        </div>

        {wardrobeItems.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-white/5 p-4 text-sm text-higgs-text-muted">
            Список пуст. Нажмите «Добавить».
          </div>
        ) : (
          <div className="space-y-3">
            {wardrobeItems.map((item) => (
              <WardrobeCard
                key={item.id}
                item={item}
                selected={selectedWardrobeItemIds.includes(item.id)}
                onSelect={() => selectWardrobeItem(item.id)}
                onEdit={() => onEditWardrobeItem(item.id)}
                onDelete={() => onDeleteWardrobeItem(item.id)}
              />
            ))}
          </div>
        )}

      </Card>

      <Modal open={openCreate} onClose={() => setOpenCreate(false)} title="Добавить одежду">
        <div className="space-y-4">
          <h3 className="font-display text-xl">Добавить одежду</h3>

          <button
            type="button"
            onClick={() => setOpenPicker(true)}
            className="w-full rounded-xl border border-dashed border-violet-400/35 bg-violet-950/30 p-4 text-left"
          >
            <p className="text-sm text-brand-mist">{selectedLabel}</p>
            <p className="mt-1 text-xs text-brand-mist/60">Нажмите, чтобы выбрать фото</p>
          </button>

          {selectedPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={selectedPreview} alt="Предпросмотр" className="h-36 w-full rounded-xl object-cover" />
          )}

          <div>
            <label className="mb-1 block text-sm">Название (опционально)</label>
            <Input value={newName} onChange={(event) => setNewName(event.target.value)} />
          </div>

          <div>
            <label className="mb-1 block text-sm">Размер</label>
            <Select value={newSize} onChange={(event) => setNewSize(event.target.value as ClothingSize)}>
              {clothingSizes.map((size) => (
                <option key={size} value={size}>
                  {clothingSizeLabels[size]}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="ghost" className="w-full sm:flex-1" onClick={() => setOpenCreate(false)}>
              Отмена
            </Button>
            <Button className="w-full sm:flex-1" onClick={onSave} disabled={saving}>
              {saving ? "Сохраняем..." : "Сохранить"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={wardrobeItemIdToEdit !== null}
        onClose={() => setWardrobeItemIdToEdit(null)}
        title="Редактировать вещь"
      >
        <div className="space-y-4">
          <h3 className="font-display text-xl">Редактировать вещь</h3>

          <div>
            <label className="mb-1 block text-sm">Название</label>
            <Input value={editName} onChange={(event) => setEditName(event.target.value)} />
          </div>

          <div>
            <label className="mb-1 block text-sm">Размер</label>
            <Select value={editSize} onChange={(event) => setEditSize(event.target.value as ClothingSize)}>
              {clothingSizes.map((size) => (
                <option key={size} value={size}>
                  {clothingSizeLabels[size]}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="ghost" className="w-full sm:flex-1" onClick={() => setWardrobeItemIdToEdit(null)}>
              Отмена
            </Button>
            <Button className="w-full sm:flex-1" onClick={onSaveWardrobeItemEdit}>
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>

      <PhotoSourceSheet
        open={openPicker}
        title="Фото одежды"
        onClose={() => setOpenPicker(false)}
        onFileSelected={onPickFile}
      />

      <AlertDialog
        open={wardrobeItemIdToDelete !== null}
        title="Удалить вещь?"
        description="Вещь будет удалена из гардероба."
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        confirmVariant="destructive"
        onCancel={() => setWardrobeItemIdToDelete(null)}
        onConfirm={onConfirmDeleteWardrobeItem}
      />
    </>
  );
};
