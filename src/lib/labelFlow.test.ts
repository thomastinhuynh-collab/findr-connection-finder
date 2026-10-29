import { describe, expect, it } from "vitest";
import { LABEL_DOWNLOAD_TTL_SECONDS, LABEL_MAX_BYTES, canAttachLabel, checkLabelEligibility, isLabelPurgeable, validateLabelFile } from "../../supabase/functions/_shared/labelFlow";
import { validateTrackingNumber } from "../../supabase/functions/_shared/trackingValidation";

const enc = (s: string) => new TextEncoder().encode(s);
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10]);
const PDF = enc("%PDF-1.7\n1 0 obj << /Type /Catalog >> endobj\n%%EOF");

describe("label file", () => {
  it("accepts PDF, PNG and JPEG", () => {
    expect(validateLabelFile(PDF)).toEqual({ kind: "pdf" });
    expect(validateLabelFile(PNG)).toEqual({ kind: "png" });
    expect(validateLabelFile(JPEG)).toEqual({ kind: "jpeg" });
  });
  it("rejects a wrong signature", () => {
    expect(validateLabelFile(enc("GIF89a....."))).toEqual({ error: "signature" });
    expect(validateLabelFile(enc("<html>%PDF-"))).toEqual({ error: "signature" });
  });
  it("rejects files over 1.5 MB and accepts exactly 1.5 MB", () => {
    const big = new Uint8Array(LABEL_MAX_BYTES + 1); big.set(PNG);
    expect(validateLabelFile(big)).toEqual({ error: "too_large" });
    const max = new Uint8Array(LABEL_MAX_BYTES); max.set(PNG);
    expect(validateLabelFile(max)).toEqual({ kind: "png" });
  });
  it.each(["/JavaScript", "/JS", "/Launch", "/EmbeddedFile", "/OpenAction"])("rejects a PDF with %s", (k) => {
    expect(validateLabelFile(enc(`%PDF-1.4\n<< ${k} (x) >>`))).toEqual({ error: "pdf_active_content" });
  });
  it("rejects an empty file", () => {
    expect(validateLabelFile(new Uint8Array())).toEqual({ error: "empty" });
  });
});

describe("label tracking number", () => {
  it("rejects bad numbers per carrier", () => {
    expect(validateTrackingNumber("8402917", "Mondial Relay")).toBe("mondial");
    expect(validateTrackingNumber("ABC", "Colissimo")).toBe("postal");
    expect(validateTrackingNumber("1111111111", "Chronopost")).toBe("sequence");
    expect(validateTrackingNumber("", "Colissimo")).toBe("required");
  });
  it("accepts a valid number", () => {
    expect(validateTrackingNumber("6A12345678901", "Colissimo")).toBeNull();
  });
});

describe("label eligibility", () => {
  const r = { buyr_id: "buyr", payment_status: "paye_attente_etiquette" };
  it("refuses when the switch is off", () => {
    expect(checkLabelEligibility(false, r, "buyr")).toBe("flow_disabled");
  });
  it("refuses a caller who is not the buyr", () => {
    expect(checkLabelEligibility(true, r, "findr")).toBe("forbidden");
  });
  it("refuses a wrong status", () => {
    expect(checkLabelEligibility(true, { ...r, payment_status: "paye_en_attente_reception" }, "buyr")).toBe("status");
  });
  it("refuses a missing reservation", () => {
    expect(checkLabelEligibility(true, null, "buyr")).toBe("not_found");
  });
  it("accepts awaiting-label and rejected-label statuses", () => {
    expect(checkLabelEligibility(true, r, "buyr")).toBeNull();
    expect(checkLabelEligibility(true, { ...r, payment_status: "etiquette_refusee" }, "buyr")).toBeNull();
  });
});

describe("hardened PDF checks", () => {
  it.each(["/AA", "/URI", "/SubmitForm", "/GoToR", "/GoToE", "/RichMedia", "/XFA", "/Encrypt"])("refuses a PDF with %s", (k) => {
    expect(validateLabelFile(enc(`%PDF-1.4\n<< ${k} 1 0 R >>`))).toEqual({ error: "pdf_refused" });
  });
  it("refuses a name with a hex escape", () => {
    expect(validateLabelFile(enc("%PDF-1.4\n<< /Java#53cript (x) >>"))).toEqual({ error: "pdf_refused" });
    expect(validateLabelFile(enc("%PDF-1.4\n<< /Type /Cat#61log >>"))).toEqual({ error: "pdf_refused" });
  });
  it("does not confuse similar names", () => {
    expect(validateLabelFile(enc("%PDF-1.4\n<< /AAPL /URIx /Encrypted2 >>"))).toEqual({ kind: "pdf" });
  });
});

describe("email attachment rule", () => {
  it("does not attach a PDF with /ObjStm but accepts it", () => {
    const b = enc("%PDF-1.5\n<< /Type /ObjStm /N 3 >>");
    expect(validateLabelFile(b)).toEqual({ kind: "pdf" });
    expect(canAttachLabel("pdf", b)).toBe(false);
  });
  it("attaches a PDF without /ObjStm, PNG and JPEG", () => {
    expect(canAttachLabel("pdf", PDF)).toBe(true);
    expect(canAttachLabel("png", PNG)).toBe(true);
    expect(canAttachLabel("jpeg", JPEG)).toBe(true);
  });
  it("uses a short-lived download link", () => {
    expect(LABEL_DOWNLOAD_TTL_SECONDS).toBeLessThanOrEqual(300);
  });
});

describe("label file purge", () => {
  const NOW = Date.parse("2026-12-01T00:00:00Z");
  const days = (n: number) => new Date(NOW - n * 86_400_000).toISOString();
  const base = { label_path: "r/x.pdf", dispute_open: false, updated_at: days(31) };
  it("purges 30 days after a finished, cancelled or refunded sale", () => {
    for (const s of ["termine", "annule", "rembourse"]) {
      expect(isLabelPurgeable({ ...base, payment_status: s }, NOW)).toBe(true);
      expect(isLabelPurgeable({ ...base, payment_status: s, updated_at: days(29) }, NOW)).toBe(false);
    }
  });
  it("uses the dispute resolution date as end of sale", () => {
    expect(isLabelPurgeable({ ...base, payment_status: "rembourse", dispute_resolved_at: days(10) }, NOW)).toBe(false);
  });
  it("purges 7 days after delivery", () => {
    expect(isLabelPurgeable({ ...base, payment_status: "livre", delivered_at: days(7) }, NOW)).toBe(true);
    expect(isLabelPurgeable({ ...base, payment_status: "livre", delivered_at: days(6) }, NOW)).toBe(false);
  });
  it("never purges a sale in progress", () => {
    for (const s of ["paye_attente_etiquette", "etiquette_refusee", "paye_en_attente_reception", "expedie", "versement_en_revue"]) {
      expect(isLabelPurgeable({ ...base, payment_status: s, updated_at: days(400), delivered_at: days(400) }, NOW)).toBe(false);
    }
  });
  it("never purges with an open dispute", () => {
    expect(isLabelPurgeable({ ...base, payment_status: "termine", dispute_open: true }, NOW)).toBe(false);
    expect(isLabelPurgeable({ ...base, payment_status: "livre", delivered_at: days(30), dispute_status: "ouvert" }, NOW)).toBe(false);
  });
  it("skips reservations without a file", () => {
    expect(isLabelPurgeable({ ...base, label_path: null, payment_status: "termine" }, NOW)).toBe(false);
  });
});
