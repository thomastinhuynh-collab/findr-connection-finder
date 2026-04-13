import { useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useGoBack } from "@/hooks/useGoBack";

const BackButton = () => {
  const location = useLocation();
  const goBack = useGoBack("/");

  // Don't show on home page
  if (location.pathname === "/") {
    return null;
  }

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      onClick={goBack}
      className="fixed top-[88px] left-4 z-40 flex items-center gap-2 transition-all"
      style={{
        padding: '6px 10px',
        fontSize: '13px',
        fontWeight: 500,
        color: '#1B2A4A',
        borderRadius: '8px',
        transition: 'background-color 0.15s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F0E8')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Retour aux annonces</span>
    </motion.button>
  );
};

export default BackButton;