import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroBackground from "@/assets/hero-vintage-market.png";

const Hero = () => {
  return (
    <section 
      className="relative flex items-center justify-center overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32 grain-texture"
      style={{ backgroundColor: 'hsl(0 0% 10%)' }}
    >
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroBackground})`,
          opacity: 0.1
        }}
      />

      {/* Warm gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 40%, hsl(18 66% 47% / 0.1) 0%, transparent 60%),
            linear-gradient(180deg, hsl(0 0% 10% / 0.2) 0%, hsl(18 30% 12% / 0.5) 100%)
          `
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Small brand tag */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 border"
            style={{ 
              backgroundColor: 'hsl(18 66% 47% / 0.15)',
              borderColor: 'hsl(18 66% 47% / 0.3)',
              color: 'hsl(18 66% 60%)'
            }}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-sm font-medium font-barlow">La marketplace inversée du vintage</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 leading-tight"
            style={{ color: 'hsl(38 33% 93%)' }}
          >
            Tu cherches un objet rare ?{" "}
            <span style={{ color: 'hsl(36 62% 58%)' }}>
              Publie ta demande,
            </span>{" "}
            la communauté le trouve pour toi.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base md:text-lg lg:text-xl max-w-3xl mx-auto mb-10"
            style={{ color: 'hsl(38 33% 93% / 0.75)' }}
          >
            Findr est la première marketplace inversée du vintage : tu décris l'objet, les chineurs le dénichent.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              size="lg" 
              className="text-base px-8 py-6 rounded-full font-semibold w-full sm:w-auto"
              style={{ 
                backgroundColor: 'hsl(18 66% 47%)',
                color: 'hsl(38 33% 95%)'
              }}
              asChild
            >
              <Link to="/poster">
                <Search className="w-5 h-5 mr-2" />
                Je cherche un objet
              </Link>
            </Button>

            <Button 
              size="lg" 
              variant="outline"
              className="text-base px-8 py-6 rounded-full font-semibold w-full sm:w-auto border-2"
              style={{ 
                borderColor: 'hsl(38 33% 93% / 0.4)',
                color: 'hsl(38 33% 93%)',
                backgroundColor: 'transparent'
              }}
              asChild
            >
              <Link to="/recherches">
                <ArrowRight className="w-5 h-5 mr-2" />
                Je suis chineur
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
