import { motion } from "framer-motion";
import { 
  Camera, Disc3, Watch, Radio, Tv, Glasses,
  Shirt, Star, Gem, Music, Headphones, Sparkles, Heart, Crown
} from "lucide-react";

const floatingIcons = [
  { Icon: Camera, x: "5%", y: "12%", delay: 0, duration: 12, size: 28 },
  { Icon: Disc3, x: "88%", y: "8%", delay: 1.2, duration: 14, size: 32 },
  { Icon: Radio, x: "92%", y: "55%", delay: 2.4, duration: 11, size: 26 },
  { Icon: Tv, x: "8%", y: "75%", delay: 0.8, duration: 13, size: 30 },
  { Icon: Music, x: "78%", y: "82%", delay: 1.6, duration: 10, size: 24 },
  { Icon: Headphones, x: "45%", y: "5%", delay: 2.8, duration: 15, size: 26 },
  { Icon: Glasses, x: "82%", y: "35%", delay: 0.4, duration: 11, size: 28 },
  { Icon: Shirt, x: "12%", y: "42%", delay: 1.8, duration: 13, size: 30 },
  { Icon: Watch, x: "72%", y: "65%", delay: 2.2, duration: 12, size: 24 },
  { Icon: Gem, x: "18%", y: "88%", delay: 0.6, duration: 14, size: 22 },
  { Icon: Star, x: "55%", y: "92%", delay: 3, duration: 9, size: 20 },
  { Icon: Sparkles, x: "35%", y: "18%", delay: 1.4, duration: 10, size: 22 },
  { Icon: Heart, x: "65%", y: "48%", delay: 2.6, duration: 11, size: 18 },
  { Icon: Crown, x: "25%", y: "58%", delay: 0.2, duration: 12, size: 24 },
];

const VintageBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Base warm cream */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, 
            hsl(38 33% 93%) 0%, 
            hsl(30 25% 91%) 25%,
            hsl(25 18% 90%) 50%,
            hsl(38 28% 92%) 75%,
            hsl(38 33% 93%) 100%
          )`,
        }}
      />

      {/* Grain texture */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Subtle warm radials */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 10% 20%, hsl(18 66% 47% / 0.03) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 85% 75%, hsl(36 62% 58% / 0.02) 0%, transparent 45%)
          `,
        }}
      />

      {/* Floating icons */}
      {floatingIcons.map(({ Icon, x, y, delay, duration, size }, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{ left: x, top: y }}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.02, 0.05, 0.02],
            y: [0, -12, 0],
            rotate: [-3, 3, -3],
          }}
          transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Icon 
            className="text-foreground" 
            size={size} 
            strokeWidth={1.2}
          />
        </motion.div>
      ))}

      {/* Vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, hsl(38 25% 91% / 0.5) 100%)`,
        }}
      />
    </div>
  );
};

export default VintageBackground;
