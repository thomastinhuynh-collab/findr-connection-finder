import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

type ContentType = "search" | "proposal";

export const useTranslatedContent = ({
  type,
  id,
  title,
  description,
  sourceLang = "fr",
}: {
  type: ContentType;
  id?: string;
  title: string;
  description?: string | null;
  sourceLang?: string | null;
}) => {
  const { i18n, t } = useTranslation();
  const targetLang = i18n.resolvedLanguage?.startsWith("en") ? "en" : "fr";
  const needsTranslation = !!id && sourceLang !== targetLang;
  const [translated, setTranslated] = useState<{ title: string; description: string | null } | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setShowOriginal(false);
    setTranslated(null);
    setError(null);
    if (!needsTranslation || !id) return () => { active = false; };
    setLoading(true);
    supabase.functions.invoke("translate-content", { body: { type, id, targetLang } })
      .then(({ data, error: invokeError }) => {
        if (!active) return;
        if (invokeError || data?.error) setError(data?.error ?? invokeError?.message ?? t("translation.unavailable"));
        else setTranslated({ title: data.title, description: data.description ?? null });
      })
      .catch(() => active && setError(t("translation.unavailable")))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id, needsTranslation, targetLang, title, description, type, t]);

  return useMemo(() => ({
    title: translated && !showOriginal ? translated.title : title,
    description: translated && !showOriginal ? translated.description : description ?? null,
    isTranslated: !!translated && !showOriginal,
    canToggle: !!translated,
    showOriginal,
    loading,
    error,
    toggle: () => setShowOriginal((value) => !value),
  }), [translated, showOriginal, title, description, loading, error]);
};