import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FeatureFlags {
  subcategoriesPostEnabled: boolean;
  subcategoriesBrowseEnabled: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  subcategoriesPostEnabled: false,
  subcategoriesBrowseEnabled: false,
};

let cached: FeatureFlags | null = null;
let pending: Promise<FeatureFlags> | null = null;

const loadFlags = (): Promise<FeatureFlags> => {
  if (cached) return Promise.resolve(cached);
  if (!pending) {
    pending = (async () => {
      try {
        const { data, error } = await supabase
          .from("app_settings")
          .select("subcategories_post_enabled, subcategories_browse_enabled")
          .maybeSingle();
        if (error) throw error;
        cached = {
          subcategoriesPostEnabled: !!data?.subcategories_post_enabled,
          subcategoriesBrowseEnabled: !!data?.subcategories_browse_enabled,
        };
      } catch (err) {
        console.error("Failed to load feature flags", err);
        cached = DEFAULT_FLAGS;
      }
      return cached;
    })();
  }
  return pending;
};

/** Interrupteurs globaux lus une seule fois dans app_settings ; faux tant que la lecture n'est pas terminée. */
export const useFeatureFlags = (): FeatureFlags => {
  const [flags, setFlags] = useState<FeatureFlags>(cached ?? DEFAULT_FLAGS);
  useEffect(() => {
    if (cached) return;
    let active = true;
    loadFlags().then((f) => active && setFlags(f));
    return () => {
      active = false;
    };
  }, []);
  return flags;
};
