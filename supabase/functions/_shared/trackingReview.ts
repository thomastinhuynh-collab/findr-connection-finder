import { sendEmailTo, sendEmailToUser } from "./brevo.ts";
import { CONTACT_EMAIL } from "./emails.ts";

// deno-lint-ignore no-explicit-any
export async function putTrackingInReview(admin: any, reservation: { id: string; buyr_id: string; findr_id: string }, reason = "unknown") {
  const { data, error } = await admin.from("reservations").update({
    payment_status: "versement_en_revue", tracking_review_notified_at: new Date().toISOString(),
  }).eq("id", reservation.id).is("tracking_review_notified_at", null)
    .in("payment_status", ["paye_en_attente_reception", "expedie", "versement_en_revue"])
    .select("id").maybeSingle();
  if (error) throw error;
  if (!data) return;
  const { data: admins } = await admin.from("user_roles").select("user_id").eq("role", "admin");
  const message = reason === "old" ? "Le suivi correspond à un envoi antérieur au paiement. Le versement est en revue." : "Le transporteur ne reconnaît pas le numéro de suivi. Le versement est en revue.";
  await admin.from("notifications").insert([
    ...[reservation.buyr_id, reservation.findr_id].map(user_id => ({ user_id, type: "tracking_review", title: "Suivi à vérifier", message, link: `/transaction/${reservation.id}` })),
    ...(admins ?? []).map((a: { user_id: string }) => ({ user_id: a.user_id, type: "tracking_review_admin", title: "Suivi à examiner — versement en revue", message: `${message} Transaction ${reservation.id}.`, link: "/admin/litiges" })),
  ]);
  await Promise.all([
    sendEmailToUser(admin, reservation.buyr_id, "tracking_review", { reservationId: reservation.id, role: "buyr", reason }),
    sendEmailToUser(admin, reservation.findr_id, "tracking_review", { reservationId: reservation.id, role: "findr", reason }),
    sendEmailTo(CONTACT_EMAIL, "tracking_review", { reservationId: reservation.id, role: "team", reason }),
  ]);
}