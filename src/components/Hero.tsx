import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import heroBackground from "@/assets/hero-vintage-market.png";

const avatars = [
  "https://i.pravatar.cc/64?img=5",
  "https://i.pravatar.cc/64?img=12",
  "https://i.pravatar.cc/64?img=8",
  "https://i.pravatar.cc/64?img=32",
];

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
          {/* Badge social proof */}
          <div
            className="inline-flex items-center mb-8 animate-fade-in"
            style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
          >
            <span
              className="font-poppins"
              style={{
                fontSize: '12px',
                color: '#C9A84C',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(201,168,76,0.6)',
                borderRadius: '20px',
                padding: '6px 16px',
              }}
            >
              ✦ 2 341 membres · Accès 100% gratuit
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
          <div
            className="max-w-3xl mx-auto mb-10 animate-slide-up"
            style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
          >
            <p
              style={{
                fontSize: '20px',
                color: '#FFFFFF',
                fontWeight: 400,
                lineHeight: 1.5,
              }}
            >
              Décris ce que tu cherches. Des passionnés le trouvent pour toi.
            </p>
            <p
              style={{
                fontSize: '14px',
                color: '#C9A84C',
                fontWeight: 500,
                marginTop: '8px',
                letterSpacing: '0.04em',
              }}
            >
              Tu es buyr. Eux sont findr.
            </p>
          </div>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center animate-slide-up"
            style={{ animationDelay: '0.45s', animationFillMode: 'both', gap: '14px' }}
          >
            <Button
              asChild
              className="font-poppins w-full sm:w-auto group"
              style={{
                backgroundColor: '#C9A84C',
                color: '#1B2A4A',
                fontWeight: 700,
                fontSize: '16px',
                height: '54px',
                padding: '0 28px',
                borderRadius: '10px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#D4B05C')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#C9A84C')}
            >
              <Link to="/poster">
                <Search className="w-5 h-5 mr-2" />
                Poster ma recherche — c'est gratuit
              </Link>
            </Button>

            <Button
              asChild
              className="font-poppins w-full sm:w-auto transition-colors"
              style={{
                backgroundColor: 'transparent',
                border: '1.5px solid rgba(255,255,255,0.5)',
                color: '#FFFFFF',
                fontSize: '15px',
                height: '54px',
                padding: '0 24px',
                borderRadius: '10px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
              }}
            >
              <Link to="/recherches">
                Je deviens findr →
              </Link>
            </Button>
          </div>

          {/* Social proof: avatars + stat */}
          <div
            className="flex items-center justify-center animate-fade-in"
            style={{ marginTop: '20px', gap: '10px', animationDelay: '0.6s', animationFillMode: 'both' }}
          >
            <div className="flex items-center">
              {avatars.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  loading="lazy"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '2px solid white',
                    marginLeft: i === 0 ? 0 : '-10px',
                    objectFit: 'cover',
                  }}
                />
              ))}
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', margin: 0 }}>
              <span style={{ fontWeight: 700, color: '#C9A84C' }}>847</span> recherches actives en ce moment
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
