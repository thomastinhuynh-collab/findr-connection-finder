import { useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";

const BackButton = () => {
  const location = useLocation();
  const goBack = useGoBack("/");

  // Don't show on home page
  if (location.pathname === "/") {
    return null;
  }

  return (
    <button
      onClick={goBack}
      className="fixed z-40 flex items-center gap-2 bg-transparent border-none outline-none focus:outline-none"
      style={{
        top: "88px",
        left: "40px",
        padding: "24px 0 0 0",
        fontFamily: "Inter, sans-serif",
        fontWeight: 500,
        fontSize: "14px",
        color: "#112150",
        cursor: "pointer",
      }}
    >
      <ArrowLeft className="w-4 h-4" style={{ color: "#112150" }} />
      <span>Retour</span>
    </button>
  );
};

export default BackButton;