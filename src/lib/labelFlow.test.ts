import { describe, expect, it } from "vitest";
import { LABEL_DOWNLOAD_TTL_SECONDS, LABEL_MAX_BYTES, canAttachLabel, checkLabelEligibility, validateLabelFile } from "../../supabase/functions/_shared/labelFlow";
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
