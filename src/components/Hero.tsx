import { Button } from "@/components/ui/button";
import { Search, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroBackground from "@/assets/hero-vintage-market.png";
import { useState } from "react";

const Hero = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const mockImages = [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
  ];

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % mockImages.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + mockImages.length) % mockImages.length);
  };

  return (
    <section 
      className="relative flex items-center justify-center overflow-hidden bg-navy-primary"
      style={{ minHeight: 'clamp(480px, 85vh, 800px)' }}
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
      
      <div className="container mx-auto px-4 relative z-10 py-12 md:py-20">
        <div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[60px] items-center"
          style={{ maxWidth: '1100px', margin: '0 auto' }}
        >
          {/* Left Column - Text Content */}
          <div className="text-left">
            {/* Premium badge with pulse */}
            <div
              className="inline-flex items-center mb-6 animate-fade-in"
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
              className="font-poppins font-extrabold mb-6 leading-tight text-cream animate-slide-up"
              style={{ 
                fontSize: 'clamp(30px, 5vw, 52px)',
                animationDelay: '0.15s', 
                animationFillMode: 'both' 
              }}
            >
              Laisse la communauté{" "}
              <span 
                className="text-accent"
                style={{
                  textDecoration: 'underline',
                  textDecorationColor: '#C9A84C',
                  textDecorationThickness: '3px',
                  textUnderlineOffset: '6px',
                }}
              >trouve</span>{" "}
              pour toi
            </h1>

            {/* Subtitle */}
            <p
              className="text-cream/85 font-normal animate-slide-up mb-8"
              style={{ 
                fontSize: 'clamp(15px, 2vw, 18px)',
                maxWidth: '520px',
                animationDelay: '0.3s', 
                animationFillMode: 'both',
                lineHeight: '1.6'
              }}
            >
              <strong>Décris l'objet vintage que tu recherches.</strong> Les membres de findr te proposent ce qu'ils ont trouvé. <strong>Tu choisis, tu paies en sécurité.</strong>
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row items-start gap-4 animate-slide-up"
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

          {/* Right Column - Mock Card */}
          <div 
            className="hidden lg:flex justify-center items-center animate-slide-up"
            style={{ 
              animationDelay: '0.5s', 
              animationFillMode: 'both',
            }}
          >
            <div 
              className="bg-cream rounded-lg overflow-hidden"
              style={{ 
                width: '100%', 
                maxWidth: '380px',
                transform: 'rotate(-2deg)',
                boxShadow: '0 12px 40px rgba(27,42,74,0.15)',
              }}
            >
              {/* Card Image Carousel */}
              <div 
                className="relative overflow-hidden"
                style={{ height: '220px' }}
              >
                <img 
                  src={mockImages[currentImage]} 
                  alt="Nike Air Max 90"
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ 
                    background: 'rgba(27,42,74,0.7)',
                    border: 'none',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(27,42,74,0.95)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(27,42,74,0.7)'}
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ 
                    background: 'rgba(27,42,74,0.7)',
                    border: 'none',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(27,42,74,0.95)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(27,42,74,0.7)'}
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>

                {/* Image Counter */}
                <div 
                  className="absolute bottom-2 right-2 text-white text-xs px-2 py-1 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.5)' }}
                >
                  {currentImage + 1} / {mockImages.length}
                </div>

                {/* Status Badge */}
                <div 
                  className="absolute top-3 left-3 text-xs font-medium px-2 py-1 rounded"
                  style={{ 
                    background: '#C9A84C', 
                    color: '#1B2A4A',
                  }}
                >
                  CHERCHE
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4" style={{ background: '#F5F0E8' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span 
                    className="text-xs font-medium px-2 py-1 rounded"
                    style={{ 
                      background: 'rgba(27,42,74,0.1)', 
                      color: '#1B2A4A',
                    }}
                  >
                    Mode Vintage
                  </span>
                </div>
                
                <h3 className="font-semibold text-navy-primary mb-1" style={{ fontSize: '16px' }}>
                  Nike Air Max 90 — Taille 42
                </h3>
                
                <div className="flex items-center justify-between">
                  <span className="font-semibold" style={{ color: '#C9A84C', fontSize: '15px' }}>
                    80 € - 150 €
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(27,42,74,0.5)' }}>
                    3 propositions
                  </span>
                </div>

                {/* Dots indicator */}
                <div className="flex justify-center gap-2 mt-4">
                  {mockImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImage(idx)}
                      className="transition-all duration-200"
                      style={{
                        width: currentImage === idx ? '24px' : '8px',
                        height: '8px',
                        borderRadius: currentImage === idx ? '4px' : '50%',
                        background: currentImage === idx ? '#C9A84C' : '#D4CCBC',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
