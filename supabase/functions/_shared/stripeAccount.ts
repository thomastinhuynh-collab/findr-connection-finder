// Comptes Express créés avec la seule capacité « transfers » : charges_enabled
// reste faux, donc l'inscription est terminée quand les infos sont soumises,
// les versements activés et la capacité transfers active.
export const isStripeAccountComplete = (account: {
  details_submitted?: boolean | null;
  payouts_enabled?: boolean | null;
  capabilities?: { transfers?: string | null } | null;
}): boolean =>
  !!account.details_submitted &&
  !!account.payouts_enabled &&
  account.capabilities?.transfers === "active";
