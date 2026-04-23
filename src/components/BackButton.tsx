import { useLocation } from "react-router-dom";
import { useGoBack } from "@/hooks/useGoBack";
import { useState } from "react";

const BackButton = () => {
  const location = useLocation();
  const goBack = useGoBack("/");
  const [hover, setHover] = useState(false);

  // Only show on detail pages (/recherche/:id)
  const isDetailPage = location.pathname.startsWith("/recherche/");
  if (!isDetailPage) return null;

  return (
    <button
      onClick={goBack}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label="Retour"
      className="hidden lg:flex fixed items-center justify-center"
      style={{
        top: "50%",
        left: "16px",
        transform: "translateY(-50%) rotate(180deg)",
        writingMode: "vertical-rl",
        zIndex: 50,
        backgroundColor: hover ? "#243d6b" : "#1B2A4A",
        color: "#FFFFFF",
        fontFamily: "Inter, sans-serif",
        fontSize: "12px",
        fontWeight: 500,
        padding: "14px 10px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        transition: "background-color 0.15s ease",
      }}
    >
      ← Retour
    </button>
  );
};

export default BackButton;
