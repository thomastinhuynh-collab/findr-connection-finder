import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import heroBackground from "@/assets/hero-vintage.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background image with blue overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroBackground})`,
        }}
      />
      
      {/* Blue overlay gradient matching branding */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, 
            hsla(222, 37%, 36%, 0.92) 0%, 
            hsla(224, 67%, 19%, 0.95) 50%,
            hsla(224, 67%, 19%, 0.98) 100%
          )`,
        }}
      />

      {/* Subtle texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo Circle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              {/* Circular logo with cream text on navy */}
              <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-primary flex items-center justify-center shadow-2xl border-4 border-[hsl(42_33%_94%)]/20">
                <div className="flex flex-col items-center">
                  <span 
                    className="text-3xl md:text-4xl font-barlow font-semibold tracking-tight"
                    style={{ color: 'hsl(42 33% 94%)' }}
                  >
                    f
                    <span className="relative inline-block">
                      <span className="invisible">i</span>
                      <svg 
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 md:w-4 md:h-4"
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2.5"
                        style={{ color: 'hsl(42 33% 94%)' }}
                      >
                        <circle cx="10" cy="10" r="6" />
                        <path d="M14.5 14.5L20 20" strokeLinecap="round" />
                      </svg>
                    </span>
                    ndr
                  </span>
                  <span 
                    className="text-[8px] md:text-[10px] font-sans font-light italic tracking-wide mt-1"
                    style={{ color: 'hsl(42 33% 94% / 0.8)' }}
                  >
                    let others search for you
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-barlow font-semibold mb-8"
            style={{ 
              backgroundColor: 'hsla(42, 33%, 94%, 0.15)',
              color: 'hsl(42 33% 94%)'
            }}
          >
            <Sparkles className="w-4 h-4" />
            PREMIUM COMMUNITY
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-barlow font-bold mb-6 leading-tight"
            style={{ color: 'hsl(42 33% 94%)' }}
          >
            Trouvez l'introuvable,
            <br />
            <span className="not-italic">avec findr & buyr</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-base md:text-lg max-w-2xl mx-auto mb-10"
            style={{ color: 'hsla(42, 33%, 94%, 0.85)' }}
          >
            La plateforme premium de chinage collaboratif où les findr 
            passionnés trouvent pour les buyr leurs pépites vintage et objets pop culture.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              size="lg" 
              className="text-base px-8 py-6 rounded-full font-semibold"
              style={{ 
                backgroundColor: 'hsl(222 37% 55%)',
                color: 'hsl(42 33% 94%)'
              }}
              asChild
            >
              <Link to="/recherches">
                <Search className="w-5 h-5 mr-2" />
                Devenir buyr
              </Link>
            </Button>
            <Button 
              size="lg" 
              className="text-base px-8 py-6 rounded-full font-semibold"
              style={{ 
                backgroundColor: 'hsl(38 52% 69%)',
                color: 'hsl(224 67% 19%)'
              }}
              asChild
            >
              <Link to="/devenir-findr">
                Devenir findr
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mt-16 pt-8"
            style={{ borderTop: '1px solid hsla(42, 33%, 94%, 0.2)' }}
          >
            <div className="text-center">
              <p 
                className="text-3xl font-barlow font-bold"
                style={{ color: 'hsl(42 33% 94%)' }}
              >
                2.5K+
              </p>
              <p 
                className="text-sm"
                style={{ color: 'hsla(42, 33%, 94%, 0.7)' }}
              >
                Objets trouvés
              </p>
            </div>
            <div className="text-center">
              <p 
                className="text-3xl font-barlow font-bold"
                style={{ color: 'hsl(42 33% 94%)' }}
              >
                850+
              </p>
              <p 
                className="text-sm"
                style={{ color: 'hsla(42, 33%, 94%, 0.7)' }}
              >
                Findrs actifs
              </p>
            </div>
            <div className="text-center">
              <p 
                className="text-3xl font-barlow font-bold"
                style={{ color: 'hsl(42 33% 94%)' }}
              >
                98%
              </p>
              <p 
                className="text-sm"
                style={{ color: 'hsla(42, 33%, 94%, 0.7)' }}
              >
                Satisfaction
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: 'linear-gradient(to top, hsl(42 33% 94%) 0%, transparent 100%)'
        }}
      />
    </section>
  );
};

export default Hero;
