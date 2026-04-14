import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroBackground from "@/assets/hero-vintage-market.png";

const Hero = () => {
  return (
    <section 
      className="relative flex items-center justify-center overflow-hidden pt-32 pb-14 md:pt-40 md:pb-14 bg-navy-primary"
    >
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-[0.35]"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />

      {/* Warm gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 40%, hsl(var(--gold) / 0.08) 0%, transparent 60%),
            linear-gradient(135deg, rgba(17, 33, 80, 0.55) 0%, rgba(17, 33, 80, 0.45) 100%)
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
          {/* Premium badge with pulse */}
          <div
            className="inline-flex items-center mb-8 animate-fade-in"
            style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
          >
            <span
              className="font-poppins uppercase badge-pulse"
              style={{
                fontSize: '11px',
                letterSpacing: '2px',
                color: 'hsl(var(--gold))',
                background: 'hsl(var(--gold) / 0.2)',
                border: '1px solid hsl(var(--gold))',
                borderRadius: '20px',
                padding: '6px 16px',
              }}
            >
              ✦ PREMIUM COMMUNITY
            </span>
          </div>

          {/* Main Headline */}
          <h1
            className="text-3xl md:text-5xl lg:text-6xl font-poppins font-extrabold mb-6 leading-tight text-cream animate-slide-up"
            style={{ animationDelay: '0.15s', animationFillMode: 'both' }}
          >
            Trouvez l'introuvable avec{" "}
            <span className="text-accent">findr</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-base md:text-lg lg:text-xl max-w-3xl mx-auto mb-10 text-cream/85 font-normal animate-slide-up"
            style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
          >
            La marketplace inversée où les findr passionnés dénichent pour les buyr leurs pépites vintage et objets pop culture.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up"
            style={{ animationDelay: '0.45s', animationFillMode: 'both' }}
          >
            <Button 
              size="lg" 
              className="cta-hover text-base px-8 py-6 rounded-full font-poppins font-semibold w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90"
              asChild
            >
              <Link to="/poster">
                <Search className="w-5 h-5 mr-2" />
                Devenir buyr
              </Link>
            </Button>

            <Button 
              size="lg" 
              variant="outline"
              className="cta-hover text-base px-8 py-6 rounded-full font-poppins font-semibold w-full sm:w-auto border-2 border-cream/50 text-cream bg-transparent hover:bg-cream/10"
              asChild
            >
              <Link to="/recherches">
                <ArrowRight className="w-5 h-5 mr-2" />
                Devenir findr
              </Link>
            </Button>
          </div>

          {/* Reassurance line */}
          <p
            className="mt-6 text-sm text-cream/60 font-normal animate-fade-in"
            style={{ animationDelay: '0.6s', animationFillMode: 'both' }}
          >
            🔒 Gratuit · Sans engagement · Accès anticipé
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
