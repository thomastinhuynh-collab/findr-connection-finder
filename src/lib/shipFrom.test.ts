import { describe, it, expect } from "vitest";
import { validateShipFrom, hasShipFrom, shouldShowShipFromActionBadge } from "./shipFrom";

const ok = { first_name: "Marie-José", last_name: "de l'Étoile", street: "12 rue de la Paix", postal_code: "75002", city: "Paris" };

describe("ship-from address", () => {
  it("accepts a valid French address", () => {
    expect(validateShipFrom(ok)).toEqual({});
  });
  it("requires a 5-digit postal code", () => {
    expect(validateShipFrom({ ...ok, postal_code: "7500" }).postal_code).toBe(true);
    expect(validateShipFrom({ ...ok, postal_code: "75A02" }).postal_code).toBe(true);
  });
  it("requires street of 3 to 120 characters", () => {
    expect(validateShipFrom({ ...ok, street: "ab" }).street).toBe(true);
    expect(validateShipFrom({ ...ok, street: "a".repeat(121) }).street).toBe(true);
    expect(validateShipFrom({ ...ok, street: "a".repeat(120) }).street).toBeUndefined();
  });
  it("requires city of 2 to 80 characters", () => {
    expect(validateShipFrom({ ...ok, city: "P" }).city).toBe(true);
    expect(validateShipFrom({ ...ok, city: "a".repeat(81) }).city).toBe(true);
  });
  it("rejects names with digits or a single letter", () => {
    expect(validateShipFrom({ ...ok, first_name: "J" }).first_name).toBe(true);
    expect(validateShipFrom({ ...ok, last_name: "Doe2" }).last_name).toBe(true);
  });
  it("shows the badge only without address and after a proposal", () => {
    expect(shouldShowShipFromActionBadge({}, false)).toBe(false);
    expect(shouldShowShipFromActionBadge({}, true)).toBe(true);
    expect(shouldShowShipFromActionBadge({ ship_from_street: "1 rue", ship_from_postal_code: "75001", ship_from_city: "Paris" }, true)).toBe(false);
    expect(hasShipFrom(null)).toBe(false);
  });
});
