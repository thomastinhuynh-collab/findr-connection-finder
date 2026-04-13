import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroBackground from "@/assets/hero-vintage-market.png";

const Hero = () => {
  return (
    <section 
      className="relative flex items-center justify-center overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32 bg-navy-primary"
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
          {/* Surtitle */}
          <p
            className="uppercase text-center mb-3"
            style={{
              fontSize: '13px',
              letterSpacing: '0.1em',
              color: '#C9A84C',
            }}
          >
            La marketplace où c'est le vendeur qui vient à toi
          </p>

          {/* Main Headline — Two Lines */}
          <h1
            className="text-center mb-4 leading-tight"
            style={{
              fontSize: 'clamp(28px, 5vw, 42px)',
              fontWeight: 700,
              lineHeight: 1.25,
              color: '#FFFFFF',
            }}
          >
            Tu cherches quelque chose.
            <br />
            <span style={{ color: '#C9A84C' }}>La communauté le trouve.</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-center mx-auto"
            style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.75)',
              maxWidth: '480px',
              marginTop: '16px',
              lineHeight: 1.5,
            }}
          >
            Poste ta recherche en 2 minutes.
            <br />
            Des vendeurs te proposent exactement ce que tu veux.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8">
            {/* Main CTA Button */}
            <Button
              size="lg"
              className="font-semibold w-full mx-auto block"
              style={{
                maxWidth: '320px',
                height: '52px',
                backgroundColor: '#C9A84C',
                color: '#1B2A4A',
                fontWeight: 700,
                fontSize: '15px',
                borderRadius: '10px',
                border: 'none',
              }}
              asChild
            >
              <Link to="/poster">
                Poster ma recherche — c'est gratuit
              </Link>
            </Button>

            {/* Secondary Link */}
            <Link
              to="/recherches"
              className="block text-center mt-3 transition-colors duration-150"
              style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.6)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
            >
              Voir les recherches en cours →
            </Link>
          </div>

          {/* Reassurance Band */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8"
            style={{ marginTop: '20px' }}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: '#C9A84C', fontSize: '12px' }}>✓</span>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>
                Gratuit pour le buyr
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: '#C9A84C', fontSize: '12px' }}>✓</span>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>
                Résultats en moins de 48h
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: '#C9A84C', fontSize: '12px' }}>✓</span>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>
                Paiement sécurisé
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
