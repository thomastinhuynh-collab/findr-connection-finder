import { describe, expect, it } from "vitest";
import { trackingUrl } from "./tracking";
import { parseTrackingEvents, simulatedTrackingEvent } from "../../supabase/functions/_shared/trackingEvidence";

describe("trackingUrl", () => {
  it("sends Colissimo and Chronopost to La Poste with the number filled in", () => {
    expect(trackingUrl("Colissimo", "6a 1234-5678")).toBe("https://www.laposte.fr/outils/suivre-vos-envois?code=6A12345678");
    expect(trackingUrl("  CHRONOPOST ", "XY123456789FR")).toBe("https://www.laposte.fr/outils/suivre-vos-envois?code=XY123456789FR");
    expect(trackingUrl("la poste", "AB123")).toBe("https://www.laposte.fr/outils/suivre-vos-envois?code=AB123");
  });
  it("sends Mondial Relay, other and unknown carriers to 17TRACK", () => {
    expect(trackingUrl("Mondial Relay", "12345678")).toBe("https://t.17track.net/fr#nums=12345678");
    expect(trackingUrl("UPS", "1Z999")).toBe("https://t.17track.net/fr#nums=1Z999");
    expect(trackingUrl(null, "ABC")).toBe("https://t.17track.net/fr#nums=ABC");
  });
  it("encodes the number for a web address", () => {
    expect(trackingUrl("Autre", "AB#1&2")).toBe("https://t.17track.net/fr#nums=AB%231%262");
  });
  it("returns nothing without a number", () => {
    expect(trackingUrl("Colissimo", "  ")).toBeNull();
    expect(trackingUrl("Colissimo", null)).toBeNull();
  });
});

describe("parseTrackingEvents", () => {
  const info = {
    track_info: {
      latest_event: { time_utc: "2026-11-02T10:00:00Z", description: "Livré", location: "Lyon", stage: "Delivered" },
      tracking: { providers: [{ events: [
        { time_utc: "2026-11-01T08:00:00Z", description: "Pris en charge", location: "Paris", stage: "InTransit" },
        { time_utc: "2026-11-02T10:00:00Z", description: "Livré", location: "Lyon", stage: "Delivered" },
        { time_utc: "pas une date", description: "Ignoré" },
      ] }] },
    },
  };
  it("keeps valid events once, most recent first", () => {
    const rows = parseTrackingEvents(info);
    expect(rows.map(r => r.description)).toEqual(["Livré", "Pris en charge"]);
    expect(rows[0]).toEqual({ occurred_at: "2026-11-02T10:00:00.000Z", status: "Delivered", description: "Livré", location: "Lyon" });
  });
  it("simulated first scan is marked as a test", () => {
    const e = simulatedTrackingEvent(Date.parse("2026-11-03T18:00:00Z"));
    expect(e).toMatchObject({ description: "Colis pris en charge par le transporteur", is_test: true, occurred_at: "2026-11-03T18:00:00.000Z" });
  });
});
