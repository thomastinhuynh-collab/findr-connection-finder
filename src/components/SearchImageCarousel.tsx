import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SearchImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

const SearchImageCarousel = ({ images, alt, className = "" }: SearchImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  const handleImageError = useCallback((index: number) => {
    setFailedImages((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  // Filter out failed images
  const validImages = images
    .map((src, i) => ({ src, originalIndex: i }))
    .filter(({ originalIndex }) => !failedImages.has(originalIndex));

  if (validImages.length === 0) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted ${className}`}>
        <span className="text-5xl">🔍</span>
      </div>
    );
  }

  // Clamp currentIndex to valid range
  const safeIndex = Math.min(currentIndex, validImages.length - 1);

  if (validImages.length === 1) {
    return (
      <img
        src={validImages[0].src}
        alt={alt}
        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${className}`}
        onError={() => handleImageError(validImages[0].originalIndex)}
      />
    );
  }

  const goTo = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((i) => (i === 0 ? validImages.length - 1 : i - 1));
  };

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((i) => (i === validImages.length - 1 ? 0 : i + 1));
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <img
        src={validImages[safeIndex].src}
        alt={`${alt} - ${safeIndex + 1}`}
        className="w-full h-full object-cover transition-all duration-300"
        onError={() => handleImageError(validImages[safeIndex].originalIndex)}
      />

      {/* Nav arrows */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm hover:bg-card rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm z-10"
        aria-label="Photo précédente"
      >
        <ChevronLeft className="w-4 h-4 text-primary" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm hover:bg-card rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm z-10"
        aria-label="Photo suivante"
      >
        <ChevronRight className="w-4 h-4 text-primary" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {validImages.map((_, i) => (
          <button
            key={i}
            onClick={(e) => goTo(e, i)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              i === safeIndex
                ? "bg-primary-foreground scale-110"
                : "bg-primary-foreground/50 hover:bg-primary-foreground/75"
            }`}
            aria-label={`Photo ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchImageCarousel;
