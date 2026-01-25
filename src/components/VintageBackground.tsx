import { motion } from "framer-motion";
import { Camera, Disc3, Lamp, Watch, Radio, Armchair, Tv, Phone } from "lucide-react";

const floatingIcons = [
  { Icon: Camera, x: "5%", y: "15%", delay: 0, duration: 8 },
  { Icon: Disc3, x: "85%", y: "10%", delay: 1, duration: 10 },
  { Icon: Lamp, x: "90%", y: "45%", delay: 2, duration: 7 },
  { Icon: Watch, x: "10%", y: "60%", delay: 0.5, duration: 9 },
  { Icon: Radio, x: "80%", y: "75%", delay: 1.5, duration: 11 },
  { Icon: Armchair, x: "15%", y: "85%", delay: 2.5, duration: 8 },
  { Icon: Tv, x: "75%", y: "30%", delay: 0.8, duration: 10 },
  { Icon: Phone, x: "50%", y: "90%", delay: 1.8, duration: 9 },
];

const VintageBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Paper texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Vintage paper gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, hsl(43 40% 94% / 0.8) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, hsl(43 35% 90% / 0.6) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, hsl(43 30% 96% / 0.4) 0%, transparent 70%)
          `,
        }}
      />

      {/* Aged paper edges effect */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(90deg, hsl(30 20% 40%) 0%, transparent 3%),
            linear-gradient(270deg, hsl(30 20% 40%) 0%, transparent 3%),
            linear-gradient(180deg, hsl(30 20% 40%) 0%, transparent 2%),
            linear-gradient(0deg, hsl(30 20% 40%) 0%, transparent 2%)
          `,
        }}
      />

      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(227 90% 14%) 1px, transparent 1px),
            linear-gradient(90deg, hsl(227 90% 14%) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating vintage icons */}
      {floatingIcons.map(({ Icon, x, y, delay, duration }, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{ left: x, top: y }}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.04, 0.08, 0.04],
            y: [0, -15, 0],
            rotate: [-5, 5, -5],
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
            size={32} 
            strokeWidth={1}
          />
        </motion.div>
      ))}

      {/* Corner decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-[0.03]">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z"
            fill="hsl(227 90% 14%)"
          />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-[0.03] rotate-180">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z"
            fill="hsl(227 90% 14%)"
          />
        </svg>
      </div>
    </div>
  );
};

export default VintageBackground;
