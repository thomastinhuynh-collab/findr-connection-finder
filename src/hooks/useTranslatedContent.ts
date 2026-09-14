import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

type ContentType = "search" | "proposal";

type Translation = { title: string; description: string | null };
const translationCache = new Map<string, Translation>();
const pendingTranslations = new Map<string, Promise<Translation>>();

const requestTranslation = (type: ContentType, id: string, targetLang: string) => {
  const key = `${type}:${id}:${targetLang}`;
  const cached = translationCache.get(key);
  if (cached) return Promise.resolve(cached);
  const pending = pendingTranslations.get(key);
  if (pending) return pending;
  const request = supabase.functions.invoke("translate-content", { body: { type, id, targetLang } })
    .then(({ data, error }) => {
      if (error || data?.error) throw new Error(data?.error ?? error?.message);
      const result = { title: data.title, description: data.description ?? null };
      translationCache.set(key, result);
      return result;
    })
    .finally(() => pendingTranslations.delete(key));
  pendingTranslations.set(key, request);
  return request;
};

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
  const cacheKey = id ? `${type}:${id}:${targetLang}` : null;
  const [translated, setTranslated] = useState<Translation | null>(() => cacheKey ? translationCache.get(cacheKey) ?? null : null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setShowOriginal(false);
    setTranslated(cacheKey ? translationCache.get(cacheKey) ?? null : null);
    setError(null);
    if (!needsTranslation || !id) return () => { active = false; };
    if (cacheKey && translationCache.has(cacheKey)) return () => { active = false; };
    setLoading(true);
    requestTranslation(type, id, targetLang)
      .then((data) => {
        if (!active) return;
        setTranslated(data);
      })
      .catch(() => active && setError(t("translation.unavailable")))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id, needsTranslation, targetLang, title, description, type, t, cacheKey]);

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