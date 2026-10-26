export const needsStripeOnboarding = (profile: {
  stripe_onboarding_complete?: boolean | null;
}) => profile.stripe_onboarding_complete !== true;

// L'alerte « Mes gains » ne s'allume qu'une fois l'inscription Stripe incomplète
// ET au moins une proposition déjà envoyée ; la carte, elle, reste visible.
export const shouldShowStripeActionBadge = (
  profile: { stripe_onboarding_complete?: boolean | null },
  hasProposals: boolean
) => needsStripeOnboarding(profile) && hasProposals === true;