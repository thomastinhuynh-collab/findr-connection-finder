# Architecture rules

- Use `needsStripeOnboarding` for payment setup card visibility and `shouldShowStripeActionBadge` for its action badge, so both follow the same onboarding rule while the badge stays limited to accounts that already sent a proposal.

- Role-conviction pages share `RoleLandingPage`; keep their structure synchronized while content remains locale-driven.- The `app_settings.beta_open` switch disables the account-to-waitlist invitation flow; any future signup restriction must also respect it, and normal sign-in/sign-up must never depend on that flow.
- Fee rates and calculations live only in `src/lib/fees.ts` and its mirror `supabase/functions/_shared/fees.ts` (kept identical, both covered by `src/lib/fees.test.ts`), so client display and Stripe checkout never diverge.
- Each paid purchase/sale has a dedicated page at `/transaction/:reservationId` (`src/pages/Transaction.tsx`); access is enforced by the existing `reservations` RLS (buyr/findr only — no row means the NotFound page), and its progress steps derive from `payment_status`, `delivery_type`, `shipped_at` and `delivered_at`, never from a single raw field alone.
