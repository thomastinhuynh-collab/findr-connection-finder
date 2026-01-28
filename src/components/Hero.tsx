import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: 'hsl(230 84% 14%)' // Deep Cove
      }}
    >
      {/* Subtle gradient overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(230 70% 20%) 0%, transparent 70%)'
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center py-24">
          
          {/* Main Headline - Serif for elegance */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8"
            style={{ 
              color: 'hsl(40 30% 85%)', // Bone
              fontFamily: "'Playfair Display', Georgia, serif"
            }}
          >
            Tu demandes,
            <br />
            <span className="italic">la communauté trouve.</span>
          </motion.h1>

          {/* Subtitle - Sans-serif for clarity */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl max-w-2xl mx-auto mb-12 font-light"
            style={{ 
              color: 'hsl(40 30% 85% / 0.8)',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            La première marketplace inversée pour objets uniques et pépites vintage.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button 
              size="lg" 
              className="text-lg px-10 py-7 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl"
              style={{ 
                backgroundColor: 'hsl(43 49% 58%)', // Gold
                color: 'hsl(230 84% 14%)', // Deep Cove
                fontFamily: "'Inter', sans-serif"
              }}
              asChild
            >
              <Link to="/poster-recherche">
                Lancer une mission
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            <div 
              className="w-6 h-10 rounded-full border-2 flex justify-center pt-2"
              style={{ borderColor: 'hsl(40 30% 85% / 0.3)' }}
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'hsl(43 49% 58%)' }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
