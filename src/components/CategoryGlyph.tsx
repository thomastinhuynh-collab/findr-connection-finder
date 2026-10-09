import type { CSSProperties, ReactNode } from "react";

const GLYPHS: Record<string, ReactNode> = {
  "Mode & Maroquinerie": (
    <>
      <path d="M12 8V6.6a2 2 0 1 0-2-2" />
      <path d="M12 8 3.2 14.6a1 1 0 0 0 .6 1.8h16.4a1 1 0 0 0 .6-1.8z" />
    </>
  ),
  "Pop Culture & TCG": (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M12 8.2l1.3 3 3 1.3-3 1.3-1.3 3-1.3-3-3-1.3 3-1.3z" />
    </>
  ),
  "Vinyles & Musique": (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.2" />
      <path d="M5.6 12a6.4 6.4 0 0 1 6.4-6.4" />
    </>
  ),
  "Photo & Électronique": (
    <>
      <rect x="3" y="7.5" width="18" height="12" rx="2.4" />
      <path d="M8.3 7.5l1.2-2.4h5l1.2 2.4" />
      <circle cx="12" cy="13.5" r="3.6" />
    </>
  ),
  "Bijoux & Accessoires": (
    <>
      <circle cx="12" cy="15" r="5.6" />
      <path d="M12 3.4l2.6 2.8L12 9.4 9.4 6.2z" />
      <path d="M9.4 6.2h5.2" />
    </>
  ),
  "Déco & Mobilier": (
    <>
      <path d="M8 4.5h8l2.2 7.5H5.8z" />
      <path d="M12 12v6.6" />
      <path d="M8.4 20h7.2" />
    </>
  ),
};

interface CategoryGlyphProps {
  slug: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

/** Pictogramme décoratif dessiné sur mesure ; la couleur suit celle du texte. */
const CategoryGlyph = ({ slug, size = 14, className, style }: CategoryGlyphProps) => {
  const glyph = GLYPHS[slug];
  if (!glyph) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ flexShrink: 0, ...style }}
    >
      {glyph}
    </svg>
  );
};

export default CategoryGlyph;
