import { describe, expect, it, vi } from "vitest";
vi.mock("../../supabase/functions/_shared/brevo.ts", () => ({ sendEmailToUser: vi.fn() }));
import { releaseFundsForReservation } from "../../supabase/functions/_shared/payout";

describe("automatic payout tracking safety", () => {
  it.each([
    { tracking_review_notified_at: "2026-10-27T17:00:00Z", tracking_recognized: true, shipped_at: "2026-10-01T00:00:00Z", delivered_at: null },
    { tracking_review_notified_at: null, tracking_recognized: false, shipped_at: "2026-10-01T00:00:00Z", delivered_at: null },
  ])("does not call Stripe for tracking held in review", async current => {
    const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: { ...current, payment_status: "versement_en_revue" }, error: null }) };
    const admin = { from: vi.fn(() => query) };
    const stripe = { transfers: { create: vi.fn() } };
    const result = await releaseFundsForReservation(admin, stripe as never, { id: "reservation" }, true);
    expect(result).toMatchObject({ ok: false, held: true });
    expect(stripe.transfers.create).not.toHaveBeenCalled();
    expect(admin.from).toHaveBeenCalledTimes(1);
    expect(admin.from).toHaveBeenCalledWith("reservations");
  });
});