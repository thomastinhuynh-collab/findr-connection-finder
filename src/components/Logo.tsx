import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** cream = on dark navy backgrounds (main version), navy = on light backgrounds */
  variant?: "cream" | "navy";
  /** font-size in px of the wordmark */
  size?: number;
}

export const LOGO_CREAM = "#F5F1E8";
export const LOGO_NAVY = "#0A1628";

/**
 * findr wordmark — Space Grotesk 700, always lowercase.
 * The dot of the "i" is replaced by a stylised magnifying glass in the same color.
 */
const Logo = ({ className, variant = "cream", size = 28 }: LogoProps) => {
  const color = variant === "navy" ? LOGO_NAVY : LOGO_CREAM;
  const glassSize = Math.round(size * 0.34);

  return (
    <span
      className={cn("inline-flex items-baseline select-none", className)}
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "-0.02em",
        color,
        textTransform: "lowercase",
      }}
      aria-label="findr"
    >
      <span aria-hidden="true">f</span>
      <span aria-hidden="true" style={{ position: "relative", display: "inline-block" }}>
        {/* dotless i (U+0131) */}
        {"\u0131"}
        <svg
          viewBox="1 1 21 21"
          width={glassSize}
          height={glassSize}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          style={{
            position: "absolute",
            left: "50%",
            top: -glassSize * 0.35,
            transform: "translateX(-50%)",
            pointerEvents: "none",
          }}
        >
          <circle cx="10" cy="10" r="6.5" />
          <line x1="15" y1="15" x2="21" y2="21" />
        </svg>
      </span>
      <span aria-hidden="true">ndr</span>
    </span>
  );
};

export default Logo;
