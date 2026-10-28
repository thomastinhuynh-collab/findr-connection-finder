# Architecture rules

- Tracking validation is shared from `supabase/functions/_shared/trackingValidation.ts`; recognition comes only from official 17TRACK evidence and is server-owned. The existing lifecycle job performs per-parcel checks at 24 h, 48 h and daily thereafter, and a persistent tracking-review marker prevents automatic payout retries from bypassing manual review.

- Guard authenticated pages with `ProtectedRoute` and resume only validated same-origin destinations through the public `/auth/callback`; include the destination in callback URLs so email confirmation survives a different browser, without bypassing reservation RLS.
- Transaction lifecycle emails carry `reservationId` and notifications store `/transaction/:id` in their existing link field; keep unpaid exclusivity and admin dispute links separate because the transaction page is participant-only.

- Use `needsStripeOnboarding` for payment setup card visibility and `shouldShowStripeActionBadge` for its action badge, so both follow the same onboarding rule while the badge stays limited to accounts that already sent a proposal.

- Role-conviction pages share `RoleLandingPage`; keep their structure synchronized while content remains locale-driven.- The `app_settings.beta_open` switch disables the account-to-waitlist invitation flow; any future signup restriction must also respect it, and normal sign-in/sign-up must never depend on that flow.
- Fee rates and calculations live only in `src/lib/fees.ts` and its mirror `supabase/functions/_shared/fees.ts` (kept identical, both covered by `src/lib/fees.test.ts`), so client display and Stripe checkout never diverge.
- Each paid purchase/sale has a dedicated page at `/transaction/:reservationId` (`src/pages/Transaction.tsx`); access is enforced by the existing `reservations` RLS (buyr/findr only — no row means the NotFound page), and its progress steps derive from `payment_status`, `delivery_type`, `shipped_at` and `delivered_at`, never from a single raw field alone.
- The findr ship-from address lives in private `profiles.ship_from_*` columns (never in column-level SELECT grants), read via `get_my_profile()` and written only via `update_ship_from()`; it is snapshotted to `reservations.ship_from` by stripe-webhook at payment, server-only, and purged daily by `purge_reservation_ship_from()`.
