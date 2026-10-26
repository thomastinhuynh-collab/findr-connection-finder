import { describe, expect, it } from "vitest";
import { needsStripeOnboarding, shouldShowStripeActionBadge } from "./stripeOnboarding";

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

describe("Stripe action badge", () => {
  it("lights up only when onboarding is missing and a proposal exists", () => {
    expect(shouldShowStripeActionBadge({ stripe_onboarding_complete: false }, true)).toBe(true);
    expect(shouldShowStripeActionBadge({ stripe_onboarding_complete: null }, true)).toBe(true);
  });

  it("stays off for accounts that never sent a proposal", () => {
    expect(shouldShowStripeActionBadge({ stripe_onboarding_complete: false }, false)).toBe(false);
  });

  it("stays off once onboarding is complete", () => {
    expect(shouldShowStripeActionBadge({ stripe_onboarding_complete: true }, true)).toBe(false);
  });
});