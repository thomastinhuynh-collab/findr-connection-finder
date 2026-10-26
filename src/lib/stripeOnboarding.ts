export const needsStripeOnboarding = (profile: {
  stripe_onboarding_complete?: boolean | null;
}) => profile.stripe_onboarding_complete !== true;