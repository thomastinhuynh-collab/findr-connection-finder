// Confirmation d'inscription à la liste d'attente via le lien de l'email.
// Publique (verify_jwt = false). Redirige toujours vers le site.
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendEmailTo } from "../_shared/brevo.ts";
import { CONTACT_SENDER } from "../_shared/emails.ts";

const SITE = "https://findrapp.fr";
const ADMIN_EMAIL = "thomas@findrapp.fr";
const redirect = (ok: boolean) =>
  new Response(null, { status: 302, headers: { Location: `${SITE}/?confirmed=${ok ? 1 : 0}` } });

Deno.serve(async (req) => {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  if (!/^[a-f0-9]{64}$/.test(token)) return redirect(false);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    const since = new Date(Date.now() - 7 * 24 * 3600_000).toISOString();
    const { data: row } = await admin
      .from("waitlist")
      .select("id, email, first_name, role, confirmed_at")
      .eq("confirm_token", token)
      .gte("created_at", since)
      .maybeSingle();
    if (!row) return redirect(false);

    if (row.confirmed_at) return redirect(true); // idempotent

    await admin.from("waitlist").update({ confirmed_at: new Date().toISOString() }).eq("id", row.id);

    // Email de bienvenue avec verrou d'idempotence.
    const email = row.email.toLowerCase();
    const { error: claimError } = await admin
      .from("waitlist_welcome_emails").insert({ email, waitlist_id: row.id });
    if (!claimError) {
      const sent = await sendEmailTo(email, "waitlist_welcome", { firstName: row.first_name ?? undefined }, CONTACT_SENDER);
      if (!sent) await admin.from("waitlist_welcome_emails").delete().eq("email", email);
    }

    await sendEmailTo(ADMIN_EMAIL, "waitlist_signup", { email }, CONTACT_SENDER);

    return redirect(true);
  } catch (err) {
    console.error("[confirm-waitlist] error:", err);
    return redirect(false);
  }
});
