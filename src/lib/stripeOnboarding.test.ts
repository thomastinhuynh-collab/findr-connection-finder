import { describe, expect, it } from "vitest";
import { needsStripeOnboarding } from "./stripeOnboarding";

describe("Stripe onboarding access", () => {
  it("allows a newly created profile without findr status or proposals", () => {
    const newProfile = { is_findr: false, stripe_onboarding_complete: false };
    expect(needsStripeOnboarding(newProfile)).toBe(true);
  });

  it("allows profiles whose onboarding status is not yet set", () => {
    expect(needsStripeOnboarding({ stripe_onboarding_complete: null })).toBe(true);
  });

  it("hides setup only after onboarding is complete", () => {
    expect(needsStripeOnboarding({ stripe_onboarding_complete: true })).toBe(false);
  });
});