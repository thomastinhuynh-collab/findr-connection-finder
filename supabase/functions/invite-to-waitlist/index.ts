// Invitation unique à la liste d'attente pour un compte connecté.
// JWT obligatoire, aucun paramètre : l'utilisateur et son email viennent du jeton.
// Répond toujours { ok: true } quand rien n'est à faire.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendEmailTo } from "../_shared/brevo.ts";
import { CONTACT_SENDER } from "../_shared/emails.ts";

const ADMIN_EMAIL = "thomas@findrapp.fr";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Même normalisation que join-waitlist.
function normalize(email: string): { normalized: string; domain: string } {
  const lower = email.trim().toLowerCase();
  const at = lower.lastIndexOf("@");
  let local = lower.slice(0, at);
  let domain = lower.slice(at + 1);
  local = local.split("+")[0];
  if (domain === "googlemail.com") domain = "gmail.com";
  if (domain === "gmail.com") local = local.replace(/\./g, "");
  return { normalized: `${local}@${domain}`, domain };
}

// Mêmes règles de prénom que join-waitlist.
function cleanFirstName(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t && t.length <= 40 && /^[\p{L}' -]+$/u.test(t) ? t : null;
}

function randomToken(): string {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userRes, error: userErr } = await userClient.auth.getUser(
    authHeader.replace("Bearer ", ""),
  );
  const user = userRes?.user;
  if (userErr || !user) return json({ error: "Unauthorized" }, 401);

  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
    auth: { persistSession: false },
  });

  try {
    const email = user.email?.trim().toLowerCase();
    if (!email || !user.email_confirmed_at) return json({ ok: true });

    const { normalized, domain } = normalize(email);
    if (domain === "findrapp.fr") return json({ ok: true });

    const { data: settings } = await admin
      .from("app_settings").select("beta_open, waitlist_invite_enabled").maybeSingle();
    if (!settings || settings.beta_open || !settings.waitlist_invite_enabled) return json({ ok: true });

    const { data: invited } = await admin
      .from("waitlist_invites").select("user_id").eq("user_id", user.id).maybeSingle();
    if (invited) return json({ ok: true });

    const { data: existing } = await admin
      .from("waitlist").select("id").eq("email_normalized", normalized).limit(1).maybeSingle();
    if (existing) return json({ ok: true });

    // Verrou : une seule invitation par compte, jamais renvoyée.
    const { error: lockErr } = await admin.from("waitlist_invites").insert({ user_id: user.id });
    if (lockErr) return json({ ok: true });

    const { data: profile } = await admin
      .from("profiles").select("full_name").eq("user_id", user.id).maybeSingle();
    const firstName = cleanFirstName(profile?.full_name?.trim().split(/\s+/)[0]);

    const token = randomToken();
    const { error: insertError } = await admin.from("waitlist").insert({
      email,
      email_normalized: normalized,
      role: "unknown",
      first_name: firstName,
      consent_given: false,
      source: "compte",
      confirm_token: token,
      confirm_sent_at: new Date().toISOString(),
    });
    if (insertError) {
      if (insertError.code !== "23505") console.error("[invite-to-waitlist] insert error:", insertError);
      return json({ ok: true });
    }

    await sendEmailTo(email, "waitlist_invite", {
      firstName: firstName ?? undefined,
      confirmUrl: `${url}/functions/v1/confirm-waitlist?token=${token}`,
    }, CONTACT_SENDER);

    await sendEmailTo(ADMIN_EMAIL, "waitlist_account_invite", { email }, CONTACT_SENDER);

    return json({ ok: true });
  } catch (err) {
    console.error("[invite-to-waitlist] error:", err);
    return json({ ok: false, error: "server_error" }, 500);
  }
});
