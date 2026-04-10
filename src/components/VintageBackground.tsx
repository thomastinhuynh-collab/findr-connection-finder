import { motion } from "framer-motion";
import { 
  Camera, 
  Disc3, 
  Watch, 
  Radio, 
  Tv, 
  Glasses,
  Shirt,
  Star,
  Gem,
  Music,
  Headphones,
  Sparkles,
  Heart,
  Crown
} from "lucide-react";

const floatingIcons = [
  // Pop culture & vintage
  { Icon: Camera, x: "5%", y: "12%", delay: 0, duration: 12, size: 28 },
  { Icon: Disc3, x: "88%", y: "8%", delay: 1.2, duration: 14, size: 32 },
  { Icon: Radio, x: "92%", y: "55%", delay: 2.4, duration: 11, size: 26 },
  { Icon: Tv, x: "8%", y: "75%", delay: 0.8, duration: 13, size: 30 },
  { Icon: Music, x: "78%", y: "82%", delay: 1.6, duration: 10, size: 24 },
  { Icon: Headphones, x: "45%", y: "5%", delay: 2.8, duration: 15, size: 26 },
  
  // Fashion & style
  { Icon: Glasses, x: "82%", y: "35%", delay: 0.4, duration: 11, size: 28 },
  { Icon: Shirt, x: "12%", y: "42%", delay: 1.8, duration: 13, size: 30 },
  { Icon: Watch, x: "72%", y: "65%", delay: 2.2, duration: 12, size: 24 },
  { Icon: Gem, x: "18%", y: "88%", delay: 0.6, duration: 14, size: 22 },
  
  // Accent elements
  { Icon: Star, x: "55%", y: "92%", delay: 3, duration: 9, size: 20 },
  { Icon: Sparkles, x: "35%", y: "18%", delay: 1.4, duration: 10, size: 22 },
  { Icon: Heart, x: "65%", y: "48%", delay: 2.6, duration: 11, size: 18 },
  { Icon: Crown, x: "25%", y: "58%", delay: 0.2, duration: 12, size: 24 },
];

const VintageBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Base warm gradient using brand colors */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(135deg, 
              hsl(42 33% 94%) 0%, 
              hsl(42 25% 92%) 25%,
              hsl(22 22% 90%) 50%,
              hsl(42 30% 93%) 75%,
              hsl(42 33% 94%) 100%
            )
          `,
        }}
      />

      {/* Sophisticated paper texture */}
      <div 
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Elegant radial accents with brand gold */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 10% 20%, hsl(38 52% 69% / 0.04) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 85% 75%, hsl(38 52% 69% / 0.03) 0%, transparent 45%),
            radial-gradient(ellipse 100% 60% at 50% 100%, hsl(224 67% 19% / 0.02) 0%, transparent 40%)
          `,
        }}
      />

      {/* Diagonal fashion lines */}
      <div 
        className="absolute inset-0 opacity-[0.008]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 80px,
              hsl(224 67% 19%) 80px,
              hsl(224 67% 19%) 81px
            )
          `,
        }}
      />

      {/* Subtle dot pattern - reminiscent of halftone prints */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, hsl(224 67% 19%) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Floating pop culture & fashion icons */}
      {floatingIcons.map(({ Icon, x, y, delay, duration, size }, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{ left: x, top: y }}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.03, 0.07, 0.03],
            y: [0, -12, 0],
            rotate: [-3, 3, -3],
          }}
          transition={{
            duration: duration,
            delay: delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Icon 
            className="text-primary" 
            size={size} 
            strokeWidth={1.2}
          />
        </motion.div>
      ))}

      {/* Art deco corner accents */}
      <svg className="absolute top-0 left-0 w-40 h-40 opacity-[0.025]" viewBox="0 0 100 100">
        <path d="M0 0 L30 0 L30 3 L3 3 L3 30 L0 30 Z" fill="hsl(224 67% 19%)" />
        <path d="M0 0 L15 0 L15 1.5 L1.5 1.5 L1.5 15 L0 15 Z" fill="hsl(38 52% 69%)" />
      </svg>
      <svg className="absolute top-0 right-0 w-40 h-40 opacity-[0.025] scale-x-[-1]" viewBox="0 0 100 100">
        <path d="M0 0 L30 0 L30 3 L3 3 L3 30 L0 30 Z" fill="hsl(224 67% 19%)" />
        <path d="M0 0 L15 0 L15 1.5 L1.5 1.5 L1.5 15 L0 15 Z" fill="hsl(38 52% 69%)" />
      </svg>
      <svg className="absolute bottom-0 left-0 w-40 h-40 opacity-[0.025] scale-y-[-1]" viewBox="0 0 100 100">
        <path d="M0 0 L30 0 L30 3 L3 3 L3 30 L0 30 Z" fill="hsl(224 67% 19%)" />
        <path d="M0 0 L15 0 L15 1.5 L1.5 1.5 L1.5 15 L0 15 Z" fill="hsl(38 52% 69%)" />
      </svg>
      <svg className="absolute bottom-0 right-0 w-40 h-40 opacity-[0.025] scale-[-1]" viewBox="0 0 100 100">
        <path d="M0 0 L30 0 L30 3 L3 3 L3 30 L0 30 Z" fill="hsl(224 67% 19%)" />
        <path d="M0 0 L15 0 L15 1.5 L1.5 1.5 L1.5 15 L0 15 Z" fill="hsl(38 52% 69%)" />
      </svg>

      {/* Soft vignette effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, hsl(42 25% 92% / 0.4) 100%)
          `,
        }}
      />
    </div>
  );
};

export default VintageBackground;
