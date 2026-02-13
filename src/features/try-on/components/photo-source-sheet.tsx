"use client";

import React from "react";
import { useRef, type ChangeEvent } from "react";
import { Modal } from "@/common/components/ui/modal";
import { Button } from "@/common/components/ui/button";

interface PhotoSourceSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onFileSelected: (file: File) => void;
}

export const PhotoSourceSheet = ({
  open,
  title,
  onClose,
  onFileSelected
}: PhotoSourceSheetProps) => {
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const consumeFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    onFileSelected(file);
    event.target.value = "";
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        <h3 className="font-display text-xl">{title}</h3>
        <p className="text-sm text-higgs-text-muted">Выберите источник изображения</p>

        <div className="grid gap-3">
          <Button variant="secondary" className="justify-start" onClick={() => cameraInputRef.current?.click()}>
            Камера
          </Button>
          <Button variant="ghost" className="justify-start" onClick={() => galleryInputRef.current?.click()}>
            Галерея / Файлы
          </Button>
        </div>

        <Button variant="ghost" className="w-full" onClick={onClose}>
          Отмена
        </Button>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={consumeFile}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={consumeFile}
      />
    </Modal>
  );
};
