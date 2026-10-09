// Inscription publique à la liste d'attente (appelée par les deux sites).
// Validation, anti-robots et limitation par IP côté serveur, puis envoi d'un
// email de confirmation. Aucun email de bienvenue avant confirmation.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { sendEmailTo } from "../_shared/brevo.ts";
import { CONTACT_SENDER } from "../_shared/emails.ts";
import { DISPOSABLE_DOMAINS } from "../_shared/disposable-domains.ts";

const WAITLIST_ROLES = ["buyr", "findr", "unknown"] as const;
type WaitlistRole = (typeof WAITLIST_ROLES)[number];

const BodySchema = z.object({
  email: z.string().trim().email().max(255),
  // Rôle tolérant : absent, vide, null ou en dehors de la liste => "unknown".
  role: z
    .unknown()
    .optional()
    .transform((r): WaitlistRole =>
      WAITLIST_ROLES.includes(r as WaitlistRole) ? (r as WaitlistRole) : "unknown",
    ),
  first_name: z.string().trim().max(120).optional().nullable(),
  website: z.string().max(500).optional().default(""),
  elapsed_ms: z.number().nonnegative().optional().default(0),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const HOUR = 3600_000;
const DAY = 24 * HOUR;

function normalize(email: string): { normalized: string; domain: string; local: string } {
  const lower = email.trim().toLowerCase();
  const at = lower.lastIndexOf("@");
  let local = lower.slice(0, at);
  let domain = lower.slice(at + 1);
  const rawLocal = local;
  local = local.split("+")[0];
  if (domain === "googlemail.com") domain = "gmail.com";
  if (domain === "gmail.com") local = local.replace(/\./g, "");
  return { normalized: `${local}@${domain}`, domain, local: rawLocal };
}

function looksLikeBot(local: string): boolean {
  const compact = local.replace(/\./g, "");
  const noVowels = compact.length >= 14 && !/[aeiouy]/.test(compact);
  const segments = local.split(".").filter(Boolean);
  const short = segments.filter((s) => s.length <= 2).length;
  return noVowels || (segments.length >= 6 && short >= 4);
}

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomToken(): string {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return json({ ok: false, error: "invalid_email" }, 400);
  const { email, role, first_name, website, elapsed_ms } = parsed.data;

  // Champ piège ou formulaire rempli trop vite : réponse neutre.
  if (website || elapsed_ms < 2000) return json({ ok: true });

  const { normalized, domain, local } = normalize(email);
  if (DISPOSABLE_DOMAINS.has(domain) || looksLikeBot(local)) return json({ ok: true });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    // Limitation par IP hachée.
    const ip =
      req.headers.get("cf-connecting-ip") ??
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const { data: saltRow } = await admin
      .from("webhook_secrets").select("secret").eq("name", "waitlist_ip_salt").maybeSingle();
    const ipHash = await sha256(ip + (saltRow?.secret ?? ""));
    const now = Date.now();

    await admin.from("waitlist_attempts").delete()
      .lt("created_at", new Date(now - 7 * DAY).toISOString());

    const [{ count: hourCount }, { count: dayCount }] = await Promise.all([
      admin.from("waitlist_attempts").select("id", { count: "exact", head: true })
        .eq("ip_hash", ipHash).gte("created_at", new Date(now - HOUR).toISOString()),
      admin.from("waitlist_attempts").select("id", { count: "exact", head: true })
        .eq("ip_hash", ipHash).gte("created_at", new Date(now - DAY).toISOString()),
    ]);
    if ((hourCount ?? 0) >= 3 || (dayCount ?? 0) >= 10) {
      return json({ ok: false, error: "rate_limited", message: "Trop de tentatives, réessaie plus tard." }, 429);
    }
    await admin.from("waitlist_attempts").insert({ ip_hash: ipHash });

    const confirmBase = `${Deno.env.get("SUPABASE_URL")}/functions/v1/confirm-waitlist?token=`;

    // Déjà inscrit ?
    const { data: existing } = await admin
      .from("waitlist")
      .select("id, confirmed_at, confirm_token, confirm_sent_at, first_name")
      .eq("email_normalized", normalized)
      .limit(1)
      .maybeSingle();

    if (existing) {
      const lastSent = existing.confirm_sent_at ? new Date(existing.confirm_sent_at).getTime() : 0;
      if (!existing.confirmed_at && existing.confirm_token && now - lastSent > HOUR) {
        await admin.from("waitlist").update({ confirm_sent_at: new Date().toISOString() }).eq("id", existing.id);
        await sendEmailTo(email, "waitlist_confirm", {
          firstName: existing.first_name ?? undefined,
          confirmUrl: confirmBase + existing.confirm_token,
        }, CONTACT_SENDER);
      }
      return json({ ok: true, already: true });
    }

    // Nettoyage des inscriptions non confirmées de plus de 7 jours (nouveau parcours uniquement).
    await admin.from("waitlist").delete()
      .not("confirm_token", "is", null)
      .is("confirmed_at", null)
      .lt("created_at", new Date(now - 7 * DAY).toISOString());

    const token = randomToken();
    const { error: insertError } = await admin.from("waitlist").insert({
      email: email.trim().toLowerCase(),
      email_normalized: normalized,
      role,
      first_name: first_name || null,
      consent_given: true,
      confirm_token: token,
      confirm_sent_at: new Date().toISOString(),
    });
    if (insertError) {
      if (insertError.code === "23505") return json({ ok: true, already: true });
      console.error("[join-waitlist] insert error:", insertError);
      return json({ ok: false, error: "server_error" }, 500);
    }

    await sendEmailTo(email, "waitlist_confirm", {
      firstName: first_name ?? undefined,
      confirmUrl: confirmBase + token,
    }, CONTACT_SENDER);

    return json({ ok: true });
  } catch (err) {
    console.error("[join-waitlist] error:", err);
    return json({ ok: false, error: "server_error" }, 500);
  }
});
