import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

const Logo = ({ className }: LogoProps) => {
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
        fill="#F5F0EA"
      >
        fındr
      </text>
      <circle cx="46" cy="9" r="3" fill="none" stroke="#F5F0EA" strokeWidth="1.8" />
      <line x1="48.2" y1="11.2" x2="50.5" y2="13.5" stroke="#F5F0EA" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
};

export default Logo;
