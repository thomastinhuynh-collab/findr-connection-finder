import { describe, it, expect } from "vitest";
import { parcelSummary } from "./parcelSummary";

const ev = (status: string, at: string, location: string | null = null) => ({ status, occurred_at: at, description: status, location });

describe("résumé du suivi dans la conversation", () => {
  it("aucun scan physique : en attente de prise en charge", () => {
    expect(parcelSummary([])).toEqual({ key: "awaiting", latest: null });
    expect(parcelSummary([ev("InfoReceived", "2026-11-10T08:00:00Z")]).key).toBe("awaiting");
  });
  it("dernier événement par date, avec son lieu", () => {
    const s = parcelSummary([ev("InTransit", "2026-11-11T08:00:00Z"), ev("AvailableForPickup", "2026-11-12T14:32:00Z", "Lyon")]);
    expect(s.key).toBe("AvailableForPickup");
    expect(s.latest?.location).toBe("Lyon");
  });
  it("livré", () => {
    expect(parcelSummary([ev("InTransit", "2026-11-11T08:00:00Z"), ev("Delivered", "2026-11-13T09:00:00Z")]).key).toBe("Delivered");
  });
});
