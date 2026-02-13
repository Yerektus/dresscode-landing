export const parseDataUri = (
  value: string
): { mimeType: string; base64: string } | null => {
  if (!value.startsWith("data:")) {
    return null;
  }

  const commaIndex = value.indexOf(",");
  if (commaIndex < 0) {
    return null;
  }

  const header = value.slice(5, commaIndex);
  if (!header.includes(";base64")) {
    return null;
  }

  const mimeType = header.split(";")[0] || "image/jpeg";
  const base64 = value.slice(commaIndex + 1);

  return { mimeType, base64 };
};

export const dataUriToBlob = (value: string): Blob | null => {
  const parsed = parseDataUri(value);
  if (!parsed) {
    return null;
  }

  try {
    const binary = atob(parsed.base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }

    return new Blob([bytes], { type: parsed.mimeType });
  } catch {
    return null;
  }
};

export const blobToDataUri = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Failed to read blob"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read blob"));
    reader.readAsDataURL(blob);
  });
};

const drawResizedImage = async (
  file: File,
  maxEdge: number,
  quality: number
): Promise<Blob> => {
  const sourceUrl = URL.createObjectURL(file);
  const image = new Image();

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Не удалось обработать изображение"));
    image.src = sourceUrl;
  });

  const ratio = Math.min(1, maxEdge / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    URL.revokeObjectURL(sourceUrl);
    throw new Error("Canvas is unavailable");
  }

  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", quality);
  });

  URL.revokeObjectURL(sourceUrl);

  if (!blob) {
    throw new Error("Не удалось сжать изображение");
  }

  return blob;
};

export const resizeAndEncodeImageFile = async (
  file: File,
  maxEdge = 1400,
  quality = 0.85
): Promise<string> => {
  const compressed = await drawResizedImage(file, maxEdge, quality);
  return blobToDataUri(compressed);
};

export const isQuotaExceededError = (error: unknown): boolean => {
  return (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" || error.code === 22)
  );
};
