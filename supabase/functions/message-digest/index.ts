import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { authenticateCronRequest } from "../_shared/cron-auth.ts";
import { isAuthorizedCron } from "../_shared/cronAuth.ts";
import { sendEmailTo } from "../_shared/brevo.ts";
import { deliverMessageDigest, messageDigestKey, MESSAGE_DIGEST_SEND_ENABLED, type DigestMessage } from "../_shared/messageDigest.ts";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, "Content-Type": "application/json" },
});
const schema = z.object({ dryRun: z.boolean().default(true) }).strict();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  // Managed callbacks and the existing cron_secret are both server-only credentials.
  const managedError = authenticateCronRequest(req);
  if (managedError && !await isAuthorizedCron(req)) return json({ error: "Unauthorized" }, 401);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Invalid parameters" }, 400);
  const { dryRun } = parsed.data;
  // A deployment alone can never send production emails or mark existing messages.
  if (!dryRun && !MESSAGE_DIGEST_SEND_ENABLED) return json({ disabled: true, sent: 0 });

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return json({ error: "Server configuration error" }, 500);
    const admin = createClient(url, key);
    if (!dryRun) {
      const { error } = await admin.rpc("cleanup_message_email_markers");
      if (error) throw error;
    }
    let after: string | undefined;
    let sent = 0;
    let eligible = 0;
    // Stop well before the next five-minute invocation. Cursor pages have no global cap.
    const startedAt = Date.now();
    do {
      const { data: recipients, error } = await admin.rpc("message_digest_recipients", after ? { _after: after } : {});
      if (error) throw error;
      if (!recipients?.length) break;
      for (const recipient of recipients as string[]) {
        const { data: userData, error: userError } = dryRun
          ? { data: null, error: null }
          : await admin.auth.admin.getUserById(recipient);
        if (userError) throw userError;
        const user = userData?.user;
        const { data: profile, error: profileError } = dryRun
          ? { data: null, error: null }
          : await admin.from("profiles").select("full_name").eq("user_id", recipient).maybeSingle();
        if (profileError) throw profileError;
        const result = await deliverMessageDigest(recipient, {
          snapshot: async (id) => {
            const { data, error: failure } = await admin.rpc("message_digest_snapshot", { _recipient: id });
            if (failure) throw failure;
            return (data ?? []) as DigestMessage[];
          },
          send: async (_id, digest) => {
            if (!user?.email) return false;
            // Stable provider idempotency key for a retry of the same message snapshot.
            const idempotencyKey = await messageDigestKey(digest.messageIds);
            return sendEmailTo(user.email, "message_digest", {
              ...digest,
              firstName: profile?.full_name?.trim().split(/\s+/)[0] ?? "",
              locale: String(user.user_metadata?.language ?? user.user_metadata?.locale ?? "fr").startsWith("en") ? "en" : "fr",
            }, undefined, undefined, idempotencyKey);
          },
          mark: async (ids) => {
            // Acknowledge only these IDs: new messages arriving during sending stay pending.
            for (let offset = 0; offset < ids.length; offset += 200) {
              const { error: failure } = await admin.from("messages")
                .update({ email_notified_at: new Date().toISOString() })
                .eq("receiver_id", recipient).is("email_notified_at", null).in("id", ids.slice(offset, offset + 200));
              if (failure) throw failure;
            }
          },
        }, dryRun);
        eligible += result.count;
        if (result.sent) sent++;
        after = recipient;
        if (Date.now() - startedAt > 110_000) return json({ dryRun, sent, eligible, more: true });
      }
      if (recipients.length < 100) break;
    } while (true);
    // Never return recipient identities or previews from an operational callback.
    return json({ dryRun, sent, eligible });
  } catch {
    console.error("[message-digest] processing failed; unacknowledged messages remain retryable");
    return json({ error: "Processing failed" }, 500);
  }
});