export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo

export const MAX_FILE_SIZE_MESSAGE =
  "Chaque image doit peser moins de 5 Mo. Merci de compresser ou choisir une autre photo.";

/** Sépare les fichiers valides de ceux qui dépassent 5 Mo. */
export function splitBySize(files: File[], maxSize: number = MAX_FILE_SIZE) {
  const valid: File[] = [];
  const oversized: File[] = [];
  files.forEach((f) => (f.size > maxSize ? oversized : valid).push(f));
  return { valid, oversized };
}

export function oversizedDescription(oversized: File[]) {
  const names = oversized.map((f) => f.name).join(", ");
  return `${MAX_FILE_SIZE_MESSAGE} Fichier(s) refusé(s) : ${names}`;
}

export const MAX_IMAGE_WIDTH = 1600;
export const IMAGE_QUALITY = 0.8;

/**
 * Redimensionne (largeur max 1600px) et compresse une image en JPEG qualité 80%
 * avant envoi vers le stockage. Retourne le fichier original en cas d'échec.
 */
export async function compressImage(
  file: File,
  maxWidth: number = MAX_IMAGE_WIDTH,
  quality: number = IMAGE_QUALITY,
): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxWidth / bitmap.width);
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch (e) {
    console.error("Image compression failed, using original:", e);
    return file;
  }
}

/** Compresse puis rejette les fichiers dépassant encore la limite de 5 Mo. */
export async function compressAndValidate(files: File[]) {
  const compressed = await Promise.all(files.map((f) => compressImage(f)));
  return splitBySize(compressed);
}
