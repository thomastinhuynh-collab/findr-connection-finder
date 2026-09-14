import { Languages, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const TranslationNotice = ({ translated, loading, error, showingOriginal, onToggle }: {
  translated: boolean;
  loading?: boolean;
  error?: string | null;
  showingOriginal?: boolean;
  onToggle?: () => void;
}) => {
  const { t } = useTranslation();
  if (loading) return <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" />{t("translation.loading")}</span>;
  if (error) return <span className="text-xs text-muted-foreground" title={error}>{t("translation.fallback")}</span>;
  if (!translated && !showingOriginal) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1"><Languages className="h-3 w-3" />{showingOriginal ? t("translation.originalShown") : t("translation.automatic")}</span>
      {onToggle && <button type="button" onClick={onToggle} className="underline underline-offset-2 hover:text-foreground">{showingOriginal ? t("translation.seeTranslation") : t("translation.seeOriginal")}</button>}
    </span>
  );
};

export default TranslationNotice;