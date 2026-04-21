import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "cream" | "navy";
}

const Logo = ({ className, variant = "cream" }: LogoProps) => {
  const fillColor = variant === "navy" ? "#112150" : "#F5F0EA";
  
  return (
    <svg
      width="110"
      height="38"
      viewBox="0 0 140 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      <text
        x="70"
        y="36"
        textAnchor="middle"
        fontFamily="'Space Grotesk', sans-serif"
        fontWeight="700"
        fontSize="38"
        fill={fillColor}
      >
        fındr
      </text>
      <circle cx="46" cy="9" r="3" fill="none" stroke={fillColor} strokeWidth="1.8" />
      <line x1="48.2" y1="11.2" x2="50.5" y2="13.5" stroke={fillColor} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
};

export default Logo;
