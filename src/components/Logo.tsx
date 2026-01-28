import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
  showTagline?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: { text: "text-xl", loupe: "w-2 h-2", tagline: "text-xs" },
  md: { text: "text-2xl", loupe: "w-2.5 h-2.5", tagline: "text-xs" },
  lg: { text: "text-3xl", loupe: "w-3 h-3", tagline: "text-sm" },
  xl: { text: "text-4xl", loupe: "w-4 h-4", tagline: "text-sm" },
};

const Logo = ({ 
  className, 
  variant = "dark", 
  showTagline = false,
  size = "md" 
}: LogoProps) => {
  // Cream/beige color for dark backgrounds, primary navy for light backgrounds
  const textColor = variant === "dark" ? "text-primary" : "text-[hsl(42_33%_94%)]";
  const taglineColor = variant === "dark" ? "text-muted-foreground" : "text-[hsl(42_33%_94%)]/80";
  const sizes = sizeClasses[size];

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center">
        <span 
          className={cn(
            "font-barlow font-semibold tracking-tight",
            sizes.text,
            textColor
          )}
        >
          f
          <span className="relative inline-block">
            ı
            {/* Loupe/magnifying glass icon replacing the dot of 'i' */}
            <svg 
              className={cn("absolute -top-1 left-1/2 -translate-x-1/2", sizes.loupe)}
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5"
            >
              <circle cx="10" cy="10" r="6" />
              <path d="M14.5 14.5L20 20" strokeLinecap="round" />
            </svg>
          </span>
          ndr
        </span>
      </div>
      {showTagline && (
        <span 
          className={cn(
            "font-sans font-light italic tracking-wide mt-0.5",
            sizes.tagline,
            taglineColor
          )}
        >
          let others search for you
        </span>
      )}
    </div>
  );
};

export default Logo;
