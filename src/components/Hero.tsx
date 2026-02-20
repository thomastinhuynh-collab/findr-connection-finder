import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroBackground from "@/assets/hero-vintage-market.png";

const Hero = () => {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-24"
      style={{
        backgroundColor: 'hsl(224 67% 19%)'
      }}
    >
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroBackground})`,
          opacity: 0.15
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
            <div className="flex flex-col items-center">
              <span 
                className="text-6xl md:text-7xl lg:text-8xl font-barlow font-bold tracking-tight"
                style={{ color: 'hsl(42 33% 94%)' }}
              >
                f
                <span className="relative inline-block">
                  ı
                  <svg 
                    className="absolute top-0 md:top-0.5 left-1/2 -translate-x-1/2 w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7"
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
                className="text-sm md:text-base lg:text-lg font-barlow font-medium tracking-wide mt-2"
                style={{ color: 'hsl(42 33% 94% / 0.9)' }}
              >
                let others search for you
              </span>
            </div>
          </motion.div>

          {/* Badge Marketplace Inversé */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-barlow font-bold mb-6 uppercase tracking-wider"
            style={{ 
              backgroundColor: 'hsl(38 52% 69%)',
              color: 'hsl(224 67% 19%)'
            }}
          >
            <Sparkles className="w-4 h-4" />
            Marketplace Inversé
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-barlow font-bold mb-6 leading-tight"
            style={{ color: 'hsl(42 33% 94%)' }}
          >
            Trouvez l'introuvable
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-base md:text-lg max-w-2xl mx-auto mb-8"
            style={{ color: 'hsla(42, 33%, 94%, 0.85)' }}
          >
            La plateforme premium de chinage collaboratif où les findr 
            passionnés trouvent pour les buyr leurs pépites vintage et objets pop culture.
          </motion.p>



          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center justify-center"
          >
            <Button 
              size="lg" 
              className="text-base px-8 py-6 rounded-full font-semibold"
              style={{ 
                backgroundColor: 'hsl(38 52% 69%)',
                color: 'hsl(224 67% 19%)'
              }}
              asChild
            >
              <Link to="/poster">
                <ArrowRight className="w-5 h-5 mr-2" />
                Poster une recherche
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mt-10 pt-6"
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
                findrs actifs
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

    </section>
  );
};

export default Hero;
