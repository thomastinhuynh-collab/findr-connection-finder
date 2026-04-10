import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: "#112150" }}
    >
      <div className="text-center max-w-lg">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo variant="light" />
        </div>

        {/* Magnifying glass illustration */}
        <div className="mb-8 flex justify-center">
          <div
            className="relative w-28 h-28 flex items-center justify-center"
            aria-hidden="true"
          >
            {/* Glass circle */}
            <svg
              width="112"
              height="112"
              viewBox="0 0 112 112"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer glow */}
              <circle cx="48" cy="48" r="36" fill="hsl(42 33% 94% / 0.04)" />
              {/* Glass ring */}
              <circle
                cx="48"
                cy="48"
                r="28"
                stroke="#D9BD8B"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                opacity="0.7"
              />
              {/* Inner shine */}
              <path
                d="M36 36 C38 32, 44 28, 50 30"
                stroke="#F5F0EA"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.3"
              />
              {/* Handle */}
              <line
                x1="68"
                y1="68"
                x2="96"
                y2="96"
                stroke="#D9BD8B"
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.7"
              />
              {/* Question mark */}
              <text
                x="48"
                y="56"
                textAnchor="middle"
                fontFamily="Poppins, sans-serif"
                fontWeight="700"
                fontSize="24"
                fill="#D9BD8B"
                opacity="0.5"
              >
                ?
              </text>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-poppins font-bold mb-4 text-cream">
          Oups, cette pépite est introuvable
        </h1>

        {/* Subtitle */}
        <p className="text-base md:text-lg mb-10 text-cream/70 max-w-md mx-auto">
          La page que tu cherches n'existe pas… mais nos findr peuvent trouver n'importe quoi d'autre.
        </p>

        {/* CTA */}
        <Button
          size="lg"
          className="cta-hover h-14 px-8 rounded-full text-base font-poppins font-semibold bg-accent text-accent-foreground hover:bg-accent/90"
          asChild
        >
          <Link to="/">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour à l'accueil
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
