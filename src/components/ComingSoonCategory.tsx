import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";

interface ComingSoonCategoryProps {
  categoryName: string;
}

/**
 * Page plein écran affichée pour les catégories "à venir".
 * Fond navy #070E42, logo findr centré, message Space Grotesk 700.
 */
const ComingSoonCategory = ({ categoryName }: ComingSoonCategoryProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#070E42" }}
    >
      <Logo variant="cream" size={56} />

      <h1
        className="mt-12 uppercase"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: "clamp(28px, 5vw, 48px)",
          letterSpacing: "0.04em",
          color: "#F5F0EA",
          lineHeight: 1.15,
        }}
      >
        Bientôt disponible
      </h1>

      <p
        className="mt-4"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: "clamp(16px, 2.5vw, 22px)",
          color: "#D9BB87",
          letterSpacing: "0.01em",
        }}
      >
        {categoryName} arrive bientôt sur findr
      </p>

      <button
        onClick={() => navigate("/recherches")}
        className="mt-12 transition-opacity hover:opacity-90"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: "15px",
          letterSpacing: "0.02em",
          backgroundColor: "#D9BB87",
          color: "#070E42",
          padding: "14px 32px",
          borderRadius: "999px",
          border: "none",
          cursor: "pointer",
        }}
      >
        Retour aux recherches actives
      </button>
    </div>
  );
};

export default ComingSoonCategory;
