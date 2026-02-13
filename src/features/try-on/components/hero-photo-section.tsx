"use client";

import { useState } from "react";
import { Button } from "@/common/components/ui/button";
import { Card } from "@/common/components/ui/card";
import { AlertDialog } from "@/common/components/ui/alert-dialog";
import { useTryOnStore } from "@/features/try-on/stores/try-on-store";
import { PhotoSourceSheet } from "@/features/try-on/components/photo-source-sheet";
import { toast } from "sonner";

export const HeroPhotoSection = () => {
  const [openPicker, setOpenPicker] = useState(false);
  const [removePhotoDialogOpen, setRemovePhotoDialogOpen] = useState(false);
  const userPhotoDataUri = useTryOnStore((state) => state.userPhotoDataUri);
  const setUserPhotoFromFile = useTryOnStore((state) => state.setUserPhotoFromFile);
  const removePhoto = useTryOnStore((state) => state.removePhoto);

  const onSelected = async (file: File) => {
    const error = await setUserPhotoFromFile(file);
    if (error) {
      toast.error(error);
    }
  };

  const onRemovePhoto = () => {
    setRemovePhotoDialogOpen(true);
  };

  const onConfirmRemovePhoto = () => {
    removePhoto();
    setRemovePhotoDialogOpen(false);
  };

  return (
    <>
      <Card className="overflow-hidden p-0 bg-surface/50 border-white/5">
        {userPhotoDataUri ? (
          <div className="relative">
            <img
              src={userPhotoDataUri}
              alt="Ваше фото"
              className="h-[260px] w-full object-cover sm:h-[320px] md:h-[420px]"
            />
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-3 backdrop-blur-md sm:flex-nowrap sm:p-4">
              <Button
                variant="secondary"
                className="h-10 min-w-[8.5rem] flex-1 border-white/30 bg-white/10 px-3 text-sm font-semibold text-white backdrop-blur-lg shadow-[0_10px_30px_rgba(0,0,0,0.18)] hover:bg-white/16 sm:h-12 sm:text-base"
                onClick={() => setOpenPicker(true)}
              >
                Изменить
              </Button>
              <Button
                variant="destructive"
                className="h-10 min-w-[8.5rem] flex-1 border-red-300/45 bg-red-500/22 px-4 text-sm font-semibold text-white backdrop-blur-lg shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:bg-red-500/30 sm:h-12 sm:flex-none sm:px-6 sm:text-base"
                onClick={onRemovePhoto}
              >
                Удалить
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex h-[250px] flex-col items-center justify-center gap-3 px-4 text-center sm:h-[320px] sm:gap-4 sm:px-6 md:h-[360px]">
            <p className="text-base font-medium text-white sm:text-lg">Загрузите ваше фото</p>
            <p className="max-w-sm text-sm text-higgs-text-muted">
              Сделайте снимок или выберите фото из галереи для виртуальной примерки.
            </p>
            <Button variant="secondary" onClick={() => setOpenPicker(true)}>Загрузить фото</Button>
          </div>
        )}
      </Card>

      <PhotoSourceSheet
        open={openPicker}
        title="Фото пользователя"
        onClose={() => setOpenPicker(false)}
        onFileSelected={onSelected}
      />

      <AlertDialog
        open={removePhotoDialogOpen}
        title="Удалить фото?"
        description="Фото пользователя будет удалено."
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        confirmVariant="destructive"
        onCancel={() => setRemovePhotoDialogOpen(false)}
        onConfirm={onConfirmRemovePhoto}
      />
    </>
  );
};
