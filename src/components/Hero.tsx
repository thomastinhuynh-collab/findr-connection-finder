import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroBackground from "@/assets/hero-vintage-market.png";

const Hero = () => {
  return (
    <section 
      className="relative flex items-center justify-center overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32 bg-navy-primary"
    >
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-[0.12]"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />

      {/* Warm gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 40%, hsl(var(--gold) / 0.08) 0%, transparent 60%),
            linear-gradient(180deg, hsl(var(--navy-primary) / 0.3) 0%, hsl(var(--navy-primary) / 0.6) 100%)
          `
        }}
      />

      {/* Subtle texture pattern */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at center, hsl(var(--cream)) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Small brand tag */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 border border-accent/30 bg-accent/15 text-accent"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-sm font-medium font-barlow">La marketplace inversée du vintage</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-3xl md:text-5xl lg:text-6xl font-poppins font-bold mb-6 leading-tight text-cream"
          >
            Tu cherches un objet rare ?{" "}
            <span className="text-accent">
              Publie ta demande,
            </span>{" "}
            la communauté le trouve pour toi.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base md:text-lg lg:text-xl max-w-3xl mx-auto mb-10 text-cream/80"
          >
            findr est la première marketplace inversée du vintage : tu décris l'objet, les findrs le dénichent.
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
              className="text-base px-8 py-6 rounded-full font-poppins font-semibold w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90"
              asChild
            >
              <Link to="/poster">
                <Search className="w-5 h-5 mr-2" />
                Je deviens buyr
              </Link>
            </Button>

            <Button 
              size="lg" 
              variant="outline"
              className="text-base px-8 py-6 rounded-full font-poppins font-semibold w-full sm:w-auto border-2 border-cream/50 text-cream bg-transparent hover:bg-cream/10"
              asChild
            >
              <Link to="/recherches">
                <ArrowRight className="w-5 h-5 mr-2" />
                Je deviens findr
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
