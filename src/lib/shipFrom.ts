export type ShipFromFields = {
  first_name: string;
  last_name: string;
  street: string;
  postal_code: string;
  city: string;
};

export type ShipFromErrorKey = keyof ShipFromFields;

// Même règle que le destinataire : 2 à 60 caractères, lettres, espaces, tirets, apostrophes.
const NAME_RE = /^[\p{L}][\p{L}\s'’-]{1,59}$/u;

export const validateShipFrom = (f: ShipFromFields): Partial<Record<ShipFromErrorKey, true>> => {
  const errors: Partial<Record<ShipFromErrorKey, true>> = {};
  if (!NAME_RE.test(f.first_name.trim())) errors.first_name = true;
  if (!NAME_RE.test(f.last_name.trim())) errors.last_name = true;
  const street = f.street.trim().length;
  if (street < 3 || street > 120) errors.street = true;
  if (!/^\d{5}$/.test(f.postal_code.trim())) errors.postal_code = true;
  const city = f.city.trim().length;
  if (city < 2 || city > 80) errors.city = true;
  return errors;
};

export const hasShipFrom = (profile: {
  ship_from_street?: string | null;
  ship_from_postal_code?: string | null;
  ship_from_city?: string | null;
} | null | undefined) =>
  !!(profile?.ship_from_street && profile.ship_from_postal_code && profile.ship_from_city);

// Pastille d'action : seulement si l'adresse manque ET qu'une proposition a déjà été faite.
export const shouldShowShipFromActionBadge = (
  profile: Parameters<typeof hasShipFrom>[0],
  hasProposals: boolean
) => !hasShipFrom(profile) && hasProposals === true;
