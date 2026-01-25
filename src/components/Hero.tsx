import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Camera, Disc3, Watch, Glasses, Shirt, Radio, Gem, Crown, Music, Headphones, Tv, Star } from "lucide-react";
import { motion } from "framer-motion";

const heroIcons = [
  { Icon: Camera, x: "8%", y: "15%", size: 36, rotate: -12 },
  { Icon: Disc3, x: "85%", y: "12%", size: 42, rotate: 15 },
  { Icon: Watch, x: "92%", y: "45%", size: 32, rotate: -8 },
  { Icon: Glasses, x: "5%", y: "55%", size: 38, rotate: 10 },
  { Icon: Shirt, x: "88%", y: "72%", size: 40, rotate: -15 },
  { Icon: Radio, x: "12%", y: "78%", size: 34, rotate: 8 },
  { Icon: Gem, x: "75%", y: "25%", size: 28, rotate: -5 },
  { Icon: Crown, x: "18%", y: "32%", size: 30, rotate: 12 },
  { Icon: Music, x: "82%", y: "58%", size: 32, rotate: -10 },
  { Icon: Headphones, x: "25%", y: "68%", size: 36, rotate: 5 },
  { Icon: Tv, x: "70%", y: "82%", size: 38, rotate: -8 },
  { Icon: Star, x: "35%", y: "22%", size: 24, rotate: 15 },
  { Icon: Sparkles, x: "65%", y: "35%", size: 26, rotate: -12 },
  { Icon: Camera, x: "55%", y: "75%", size: 30, rotate: 10 },
];

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 to-background" />
      
      {/* Vintage paper texture */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating vintage/pop culture icons */}
      {heroIcons.map(({ Icon, x, y, size, rotate }, index) => (
        <motion.div
          key={index}
          className="absolute z-0"
          style={{ left: x, top: y }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0.08, 0.15, 0.08],
            y: [0, -8, 0],
            rotate: [rotate, rotate + 5, rotate],
          }}
          transition={{
            duration: 6 + index * 0.5,
            delay: index * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Icon 
            className="text-primary" 
            size={size} 
            strokeWidth={1}
          />
        </motion.div>
      ))}

      {/* Decorative circles */}
      <motion.div 
        className="absolute top-20 left-[15%] w-64 h-64 rounded-full border border-primary/5"
        animate={{ scale: [1, 1.05, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="absolute bottom-32 right-[10%] w-48 h-48 rounded-full border border-accent/10"
        animate={{ scale: [1, 1.08, 1], rotate: [360, 180, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />

      {/* Diagonal lines pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 60px,
              hsl(var(--primary)) 60px,
              hsl(var(--primary)) 61px
            )
          `,
        }}
      />

      {/* Halftone dots pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at center, hsl(var(--primary)) 1.5px, transparent 1.5px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Gold accent glow */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-[0.06]"
        style={{
          background: `radial-gradient(ellipse at center, hsl(var(--accent)) 0%, transparent 70%)`,
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 backdrop-blur-sm border border-primary/5"
          >
            <Sparkles className="w-4 h-4" />
            La marketplace inversée du vintage
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-primary mb-6 leading-tight"
          >
            Tu demandes,
            <br />
            <span className="text-gradient">la communauté trouve.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Décris l'objet vintage, rare ou nostalgique que tu cherches. 
            Notre communauté de chineurs passionnés le trouve pour toi.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="btn-hero text-base px-8 py-6 rounded-full">
              Poster ma recherche
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 py-6 rounded-full border-2 bg-background/50 backdrop-blur-sm">
              Devenir Findr
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mt-16 pt-8 border-t border-border/50"
          >
            <div className="text-center">
              <p className="text-3xl font-serif font-bold text-primary">2.5K+</p>
              <p className="text-sm text-muted-foreground">Objets trouvés</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-serif font-bold text-primary">850+</p>
              <p className="text-sm text-muted-foreground">Findrs actifs</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-serif font-bold text-primary">98%</p>
              <p className="text-sm text-muted-foreground">Satisfaction</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom decorative wave */}
      <div className="absolute bottom-0 left-0 right-0 h-24 opacity-[0.03]">
        <svg viewBox="0 0 1440 120" className="w-full h-full" preserveAspectRatio="none">
          <path 
            d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,30 1440,60 L1440,120 L0,120 Z" 
            fill="hsl(var(--primary))"
          />
        </svg>
      </div>

      {/* Floating decorative blurs */}
      <motion.div 
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-32 left-10 w-24 h-24 bg-accent/15 rounded-full blur-3xl"
      />
      <motion.div 
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-48 right-16 w-36 h-36 bg-primary/8 rounded-full blur-3xl"
      />
    </section>
  );
};

export default Hero;
