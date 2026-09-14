import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface FavoriteButtonProps {
  searchId: string;
  className?: string;
}

const FavoriteButton = ({ searchId, className = "" }: FavoriteButtonProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) checkFavorite();
  }, [user, searchId]);

  const checkFavorite = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("search_id", searchId)
      .maybeSingle();
    setIsFavorited(!!data);
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      toast.error(t("favorites.loginRequired"));
      return;
    }

    setLoading(true);

    if (isFavorited) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("search_id", searchId);

      if (!error) {
        setIsFavorited(false);
        toast.success(t("favorites.removed"));
      }
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: user.id, search_id: searchId });

      if (!error) {
        setIsFavorited(true);
        toast.success(t("favorites.added"));
      }
    }

    setLoading(false);
  };

  return (
    <button
      className={`w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-card transition-colors ${className}`}
      onClick={toggleFavorite}
      disabled={loading}
      aria-label={isFavorited ? t("favorites.remove") : t("favorites.add")}
    >
      <Heart
        className={`w-5 h-5 transition-colors ${
          isFavorited ? "text-destructive fill-destructive" : "text-primary"
        }`}
      />
    </button>
  );
};

export default FavoriteButton;
