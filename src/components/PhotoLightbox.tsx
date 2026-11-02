import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PhotoLightboxProps {
  images: string[];
  index: number;
  open: boolean;
  alt: string;
  onOpenChange: (open: boolean) => void;
  onIndexChange: (index: number) => void;
}

/** Full-screen viewer showing each photo in full. Escape or a tap outside closes it; arrows (buttons or keyboard) switch photos. */
const PhotoLightbox = ({ images, index, open, alt, onOpenChange, onIndexChange }: PhotoLightboxProps) => {
  const { t } = useTranslation();
  const total = images.length;
  if (total === 0) return null;
  const safeIndex = Math.min(Math.max(index, 0), total - 1);
  const prev = () => onIndexChange((safeIndex - 1 + total) % total);
  const next = () => onIndexChange((safeIndex + 1) % total);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-primary/95 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-[101] flex items-center justify-center p-4 outline-none sm:p-12"
          onClick={(e) => { if (e.target === e.currentTarget) onOpenChange(false); }}
          onKeyDown={(e) => {
            if (total < 2) return;
            if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
            if (e.key === "ArrowRight") { e.preventDefault(); next(); }
          }}
        >
          <DialogPrimitive.Title className="sr-only">
            {t("photos.viewerTitle", { current: safeIndex + 1, total })}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">{alt}</DialogPrimitive.Description>

          <img
            src={images[safeIndex]}
            alt={`${alt} ${safeIndex + 1}`}
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          />

          <DialogPrimitive.Close
            className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground transition-colors hover:bg-primary-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={t("photos.close")}
          >
            <X className="h-6 w-6" />
          </DialogPrimitive.Close>

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground transition-colors hover:bg-primary-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label={t("photos.previous")}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground transition-colors hover:bg-primary-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label={t("photos.next")}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-primary-foreground/15 px-4 py-1.5 text-sm font-medium tabular-nums text-primary-foreground"
                aria-live="polite"
              >
                {safeIndex + 1} / {total}
              </div>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default PhotoLightbox;
