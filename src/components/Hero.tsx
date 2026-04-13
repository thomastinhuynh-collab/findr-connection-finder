import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section
      className="pt-32 pb-20 md:pt-40 md:pb-28"
      style={{ backgroundColor: '#F5F0E8' }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          {/* Left column — 60% */}
          <div className="w-full lg:w-[60%]">
            {/* Label */}
            <span
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#C9A84C',
                fontWeight: 500,
              }}
            >
              LA MARKETPLACE INVERSÉE DU VINTAGE
            </span>

            {/* H1 */}
            <h1
              className="mt-4"
              style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontWeight: 700,
                lineHeight: 1.2,
                color: '#1B2A4A',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              Tu cherches,
              <br />
              la communauté{' '}
              <span
                style={{
                  textDecoration: 'underline',
                  textDecorationColor: '#C9A84C',
                  textUnderlineOffset: '6px',
                  textDecorationThickness: '3px',
                }}
              >
                trouve
              </span>
              .
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '17px',
                color: '#4A4035',
                lineHeight: 1.6,
                maxWidth: '480px',
                marginTop: '16px',
              }}
            >
              Décris l'objet vintage que tu recherches.
              Les membres de Findr te proposent ce qu'ils ont trouvé.
              Tu choisis, tu paies en sécurité.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3" style={{ marginTop: '32px' }}>
              <Button
                asChild
                style={{
                  backgroundColor: '#1B2A4A',
                  color: '#FFFFFF',
                  height: '52px',
                  padding: '0 28px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 600,
                }}
              >
                <Link to="/poster">Poster ma recherche — c'est gratuit</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                style={{
                  backgroundColor: 'transparent',
                  border: '1.5px solid #C9A84C',
                  color: '#1B2A4A',
                  height: '52px',
                  padding: '0 28px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 600,
                }}
              >
                <Link to="/recherches">Voir les annonces actives</Link>
              </Button>
            </div>

            {/* Reassurance */}
            <p style={{ marginTop: '16px', fontSize: '12px', color: '#8A8070' }}>
              <span style={{ color: '#C9A84C' }}>✓</span> Sans commission à la publication{' '}
              <span style={{ color: '#C9A84C', marginLeft: '8px' }}>✓</span> Paiement sécurisé{' '}
              <span style={{ color: '#C9A84C', marginLeft: '8px' }}>✓</span> Communauté vérifiée
            </p>
          </div>

          {/* Right column — 40% */}
          <div className="w-full lg:w-[40%] flex flex-col items-center">
            {/* Mock card */}
            <div
              style={{
                transform: 'rotate(-2deg)',
                boxShadow: '0 12px 40px rgba(27,42,74,0.15)',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#FFFFFF',
                maxWidth: '340px',
                width: '100%',
              }}
            >
              {/* Image container */}
              <div style={{ position: 'relative' }}>
                <img
                  src="https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&q=80"
                  alt="Air Jordan 1 Chicago vintage sneakers"
                  style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
                />
                {/* Demande findr badge */}
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(27,42,74,0.92)',
                    color: '#C9A84C',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '5px 12px',
                    borderRadius: '20px',
                    letterSpacing: '0.03em',
                  }}
                >
                  Demande findr
                </span>
              </div>

              {/* Card body */}
              <div style={{ padding: '16px 18px 18px' }}>
                <h3
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#1B2A4A',
                    marginBottom: '10px',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  Air Jordan 1 Chicago — Années 90
                </h3>

                {/* Badges row */}
                <div className="flex flex-wrap gap-2">
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#FFFFFF',
                      backgroundColor: '#1B2A4A',
                      padding: '4px 10px',
                      borderRadius: '6px',
                    }}
                  >
                    150 – 400€
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#4A4035',
                      backgroundColor: '#F5F0E8',
                      padding: '4px 10px',
                      borderRadius: '6px',
                    }}
                  >
                    1 semaine
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#4A4035',
                      backgroundColor: '#F5F0E8',
                      padding: '4px 10px',
                      borderRadius: '6px',
                    }}
                  >
                    12/01/2026
                  </span>
                </div>
              </div>
            </div>

            {/* Caption below card */}
            <p
              style={{
                marginTop: '16px',
                fontSize: '12px',
                fontStyle: 'italic',
                color: '#8A8070',
                textAlign: 'center',
              }}
            >
              12 propositions reçues en 48h
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
