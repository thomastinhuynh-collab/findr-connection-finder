import { normalizeCarrier, normalizeTrackingNumber } from "./trackingValidation.ts";

/**
 * Lien de suivi du colis, numéro déjà rempli et encodé pour une adresse.
 * Transporteur normalisé comme tracking_carrier_key (normalizeCarrier) :
 * Colissimo et Chronopost → La Poste ; Mondial Relay, autre ou inconnu → 17TRACK.
 */
export function trackingUrl(
  carrier?: string | null,
  trackingNumber?: string | null,
): string | null {
  const number = normalizeTrackingNumber(trackingNumber ?? "");
  if (!number) return null;
  const n = encodeURIComponent(number);
  const c = normalizeCarrier(carrier ?? "");
  if (c === "colissimo" || c === "chronopost") return `https://www.laposte.fr/outils/suivre-vos-envois?code=${n}`;
  return `https://t.17track.net/fr#nums=${n}`;
}
