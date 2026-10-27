import { beforeEach, describe, expect, it, vi } from "vitest";
import { authCallbackUrl, clearAuthDestination, readAuthDestination, rememberAuthDestination, safeAuthDestination } from "./authRedirect";

beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

describe("authentication destination", () => {
  it("preserves a transaction path", () => {
    rememberAuthDestination("/transaction/123");
    expect(readAuthDestination()).toBe("/transaction/123");
  });
  it("preserves Mon espace query and hash", () => {
    rememberAuthDestination("/mon-espace?onglet=gains#paiements");
    expect(readAuthDestination()).toBe("/mon-espace?onglet=gains#paiements");
  });
  it("carries the destination into the public callback without relying on browser storage", () => {
    rememberAuthDestination("/transaction/123");
    const url = new URL(authCallbackUrl());
    localStorage.clear();
    expect(url.pathname).toBe("/auth/callback");
    expect(safeAuthDestination(url.searchParams.get("next"))).toBe("/transaction/123");
  });
  it("rejects external and recursive destinations", () => {
    for (const path of ["https://evil.test", "//evil.test", "/\\evil.test", "/auth/callback?next=/auth/callback", "/reset-password", "/\n/evil.test"]) {
      expect(safeAuthDestination(path)).toBeNull();
    }
  });
  it("consumes the destination", () => {
    rememberAuthDestination("/mon-espace");
    clearAuthDestination();
    expect(readAuthDestination()).toBeNull();
  });
  it("expires old destinations", () => {
    rememberAuthDestination("/transaction/123");
    vi.spyOn(Date, "now").mockReturnValue(Date.now() + 24 * 60 * 60 * 1000 + 1);
    expect(readAuthDestination()).toBeNull();
  });
});