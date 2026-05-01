import { supabase } from "@/integrations/supabase/client";

export const EXPERIMENT_HERO = "hero_v1_vs_v2";
export type Variant = "A" | "B";

const VARIANT_KEY = `ab_${EXPERIMENT_HERO}_variant`;
const SESSION_KEY = `ab_session_id`;
const VIEW_KEY = `ab_${EXPERIMENT_HERO}_viewed`;

function getOrCreate(key: string, factory: () => string, storage: Storage) {
  let v = storage.getItem(key);
  if (!v) {
    v = factory();
    storage.setItem(key, v);
  }
  return v;
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  return getOrCreate(
    SESSION_KEY,
    () =>
      (crypto.randomUUID?.() ??
        `${Date.now()}-${Math.random().toString(36).slice(2)}`),
    localStorage,
  );
}

/** Assigne (et persiste) la variante 50/50. */
export function getHeroVariant(): Variant {
  if (typeof window === "undefined") return "A";
  // override via ?ab=A ou ?ab=B (utile pour QA)
  const params = new URLSearchParams(window.location.search);
  const forced = params.get("ab");
  if (forced === "A" || forced === "B") {
    localStorage.setItem(VARIANT_KEY, forced);
    return forced;
  }
  return getOrCreate(
    VARIANT_KEY,
    () => (Math.random() < 0.5 ? "A" : "B"),
    localStorage,
  ) as Variant;
}

async function logEvent(payload: {
  event_type: "view" | "click";
  cta?: string;
}) {
  try {
    const variant = getHeroVariant();
    const session_id = getSessionId();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("ab_events").insert({
      experiment: EXPERIMENT_HERO,
      variant,
      session_id,
      user_id: user?.id ?? null,
      ...payload,
    });
  } catch (e) {
    console.warn("[ab] log failed", e);
  }
}

/** À appeler une fois par session quand le hero est monté. */
export function trackAbViewOnce() {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem(VIEW_KEY)) return;
  sessionStorage.setItem(VIEW_KEY, "1");
  logEvent({ event_type: "view" });
}

export function trackAbClick(cta: string) {
  logEvent({ event_type: "click", cta });
}
