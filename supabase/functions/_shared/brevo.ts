// Envoi d'emails transactionnels via l'API Brevo.
// Toutes les erreurs sont loguées et jamais propagées : un échec d'email
// ne doit jamais interrompre l'action métier en cours.
import { buildEmail, SENDER, type EmailType } from "./emails.ts";

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/brevo/smtp/email";

// deno-lint-ignore no-explicit-any
type Admin = any;
// deno-lint-ignore no-explicit-any
type Data = Record<string, any>;

/** Envoi brut à une adresse connue. Retourne true si Brevo a accepté l'email. */
export async function sendEmailTo(
  to: string,
  type: EmailType,
  data: Data = {},
): Promise<boolean> {
  const key = Deno.env.get("BREVO_API_KEY");
  if (!key) {
    console.error("[email] BREVO_API_KEY manquante — envoi ignoré");
    return false;
  }
  if (!to) {
    console.error("[email] destinataire vide — envoi ignoré", type);
    return false;
  }

  const { subject, html } = buildEmail(type, data);
  const payload = {
    sender: SENDER,
    to: [{ email: to, ...(data.firstName ? { name: String(data.firstName) } : {}) }],
    subject,
    htmlContent: html,
    tags: [type],
  };

  const attempt = async (url: string, headers: Record<string, string>) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(payload),
    });
    const body = await res.text();
    if (!res.ok) {
      console.error(`[email] ${type} -> ${to} échec ${res.status}: ${body}`);
      return false;
    }
    console.log(`[email] ${type} -> ${to} envoyé`);
    return true;
  };

  try {
    // Appel direct à Brevo avec la clé du projet.
    if (key.startsWith("xkeysib-")) {
      return await attempt(BREVO_URL, { "api-key": key });
    }
    // Clé de connexion Lovable (lovc_…) : passage par la passerelle connecteur.
    const lovableKey = Deno.env.get("LOVABLE_API_KEY") ?? "";
    return await attempt(GATEWAY_URL, {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": key,
    });
  } catch (e) {
    console.error(`[email] ${type} -> ${to} exception:`, e);
    return false;
  }
}

/**
 * Résout l'email et le prénom d'un utilisateur puis envoie l'email.
 * Ne lève jamais d'exception.
 */
export async function sendEmailToUser(
  admin: Admin,
  userId: string,
  type: EmailType,
  data: Data = {},
): Promise<boolean> {
  try {
    if (!userId) return false;
    const { data: userRes, error } = await admin.auth.admin.getUserById(userId);
    const email = userRes?.user?.email;
    if (error || !email) {
      console.error(`[email] utilisateur ${userId} sans email`, error?.message);
      return false;
    }

    let firstName = data.firstName as string | undefined;
    if (!firstName) {
      const { data: profile } = await admin
        .from("profiles")
        .select("full_name")
        .eq("user_id", userId)
        .maybeSingle();
      firstName =
        (userRes.user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
        profile?.full_name?.split(" ")[0] ??
        undefined;
    }

    return await sendEmailTo(email, type, { ...data, firstName });
  } catch (e) {
    console.error(`[email] sendEmailToUser ${type} exception:`, e);
    return false;
  }
}
