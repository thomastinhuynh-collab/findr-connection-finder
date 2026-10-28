// Contrôle du secret partagé des tâches planifiées (en-tête x-cron-secret).
// Doit être appelé avant tout appel à 17TRACK, Stripe ou Brevo.
import { createClient } from "npm:@supabase/supabase-js@2";

function timingSafeEqual(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  const len = Math.max(ea.length, eb.length);
  let diff = ea.length ^ eb.length;
  for (let i = 0; i < len; i++) diff |= (ea[i] ?? 0) ^ (eb[i] ?? 0);
  return diff === 0;
}

export async function isAuthorizedCron(req: Request): Promise<boolean> {
  const provided = req.headers.get("x-cron-secret");
  if (!provided) return false;
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data, error } = await admin
    .from("webhook_secrets").select("secret").eq("name", "cron_secret").maybeSingle();
  if (error || !data?.secret) return false;
  return timingSafeEqual(provided, data.secret);
}
