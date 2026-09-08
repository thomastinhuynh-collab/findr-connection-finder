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
