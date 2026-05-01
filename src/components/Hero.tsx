import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import heroBackground from "@/assets/hero-vintage-market.png";
import { trackAbClick } from "@/lib/abTest";

/**
 * Hero — Variante A (version originale, avant optimisation)
 * Conservée pour le test A/B vs HeroV2.
 */
const Hero = () => {
  return (
    <section className="relative flex items-center justify-center overflow-hidden pt-32 pb-14 md:pt-40 md:pb-14 bg-navy-primary">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.35]"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 40%, hsl(var(--gold) / 0.08) 0%, transparent 60%),
            linear-gradient(135deg, rgba(17, 33, 80, 0.55) 0%, rgba(17, 33, 80, 0.45) 100%)
          `,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at center, hsl(var(--cream)) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center mb-8 animate-fade-in">
            <span
              className="font-poppins"
              style={{
                fontSize: "12px",
                color: "#C9A84C",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(201,168,76,0.6)",
                borderRadius: "20px",
                padding: "6px 16px",
              }}
            >
              ✦ PREMIUM COMMUNITY
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-poppins font-extrabold mb-6 leading-tight text-cream animate-slide-up">
            Trouvez l'introuvable avec <span className="text-accent">findr</span>
          </h1>

          <p className="text-lg md:text-xl text-cream/85 max-w-2xl mx-auto mb-10 animate-slide-up">
            La communauté qui déniche pour vous les pièces rares, vintage et
            introuvables.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Button
              asChild
              size="lg"
              className="bg-accent text-navy-primary hover:bg-accent/90 font-poppins font-semibold w-full sm:w-auto"
              onClick={() => trackAbClick("hero_cta_primary")}
            >
              <Link to="/poster">
                <Search className="w-5 h-5 mr-2" />
                Poster une recherche
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-cream/40 text-cream hover:bg-cream/10 font-poppins w-full sm:w-auto"
              onClick={() => trackAbClick("hero_cta_secondary")}
            >
              <Link to="/recherches">Devenir findr</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
