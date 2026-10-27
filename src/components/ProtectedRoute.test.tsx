import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute, { AuthCallback, AuthContinuation } from "./ProtectedRoute";
import { readAuthDestination } from "@/lib/authRedirect";

const auth = vi.hoisted(() => ({ user: null as { id: string } | null, loading: false }));
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => auth }));
vi.mock("@/components/AuthModal", () => ({ default: () => null }));

let requestedPath = "";
let mounts = 0;
function Destination() {
  const location = useLocation();
  requestedPath = `${location.pathname}${location.search}${location.hash}`;
  useState(() => { mounts += 1; });
  return null;
}
function Flow({ start }: { start: string }) {
  return <MemoryRouter initialEntries={[start]}><AuthContinuation /><Routes>
    <Route path="/transaction/:id" element={<ProtectedRoute><Destination /></ProtectedRoute>} />
    <Route path="/auth/callback" element={<AuthCallback />} />
  </Routes></MemoryRouter>;
}
beforeEach(() => { localStorage.clear(); auth.user = null; auth.loading = false; mounts = 0; requestedPath = ""; });
afterEach(cleanup);

describe("protected transaction authentication", () => {
  it("does not load transaction data without a session and resumes the exact requested path", async () => {
    const view = render(<Flow start="/transaction/123?source=email#suivi" />);
    expect(mounts).toBe(0);
    expect(readAuthDestination()).toBe("/transaction/123?source=email#suivi");
    auth.user = { id: "buyr" };
    view.rerender(<Flow start="/transaction/123?source=email#suivi" />);
    await waitFor(() => expect(requestedPath).toBe("/transaction/123?source=email#suivi"));
    expect(readAuthDestination()).toBeNull();
  });
  it("waits for session hydration without replacing a saved destination", () => {
    auth.loading = true;
    render(<Flow start="/transaction/123" />);
    expect(mounts).toBe(0);
    expect(readAuthDestination()).toBeNull();
  });
  it("resumes email confirmation or OAuth in a fresh browser from the callback URL", async () => {
    const view = render(<Flow start="/auth/callback?next=%2Ftransaction%2F456" />);
    expect(readAuthDestination()).toBe("/transaction/456");
    auth.user = { id: "buyr" };
    view.rerender(<Flow start="/auth/callback?next=%2Ftransaction%2F456" />);
    await waitFor(() => expect(requestedPath).toBe("/transaction/456"));
  });
});