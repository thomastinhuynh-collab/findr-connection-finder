import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
  showTagline?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
};

const Logo = ({ 
  className, 
  variant = "dark", 
  showTagline = false,
  size = "md" 
}: LogoProps) => {
  const textColor = variant === "dark" ? "text-primary" : "text-cream";
  const taglineColor = variant === "dark" ? "text-muted-foreground" : "text-cream/80";

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center">
        <span 
          className={cn(
            "font-serif font-bold tracking-tight",
            sizeClasses[size],
            textColor
          )}
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          f
          <span className="relative inline-block">
            î
            {/* Loupe icon on the i */}
            <svg 
              className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3"
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="6" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          ndr
        </span>
      </div>
      {showTagline && (
        <span 
          className={cn(
            "text-sm font-light italic tracking-wide mt-1",
            taglineColor
          )}
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          let others search for you
        </span>
      )}
    </div>
  );
};

export default Logo;
