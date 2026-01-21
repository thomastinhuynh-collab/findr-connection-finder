import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on home page
  if (location.pathname === "/") {
    return null;
  }

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      onClick={() => navigate(-1)}
      className="fixed top-[88px] left-4 z-40 flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary bg-background/80 backdrop-blur-sm border border-border rounded-full shadow-sm hover:shadow-md transition-all"
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="hidden sm:inline">Retour</span>
    </motion.button>
  );
};

export default BackButton;