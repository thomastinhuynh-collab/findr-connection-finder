import { cn } from "@/lib/utils";

interface ContainedPhotoProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  onError?: () => void;
}

/**
 * Shows a photo in full (never cropped) inside a fixed-size frame.
 * Empty bands are filled with a blurred, faded copy of the same photo
 * over the beige photo backdrop.
 */
const ContainedPhoto = ({ src, alt, className, loading = "lazy", onError }: ContainedPhotoProps) => (
  <div className={cn("relative w-full h-full overflow-hidden bg-photo-backdrop", className)}>
    <img
      src={src}
      alt=""
      aria-hidden="true"
      loading={loading}
      className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl transform-gpu"
    />
    <img
      src={src}
      alt={alt}
      loading={loading}
      onError={onError}
      className="relative h-full w-full object-contain"
    />
  </div>
);

export default ContainedPhoto;
