import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import MessageEmailPreference from "./MessageEmailPreference";
import "@/i18n";

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc } }));

describe("message email preference", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it("saves the disabled preference through the owner-only RPC and refreshes it", async () => {
    rpc.mockResolvedValue({ data: false, error: null });
    const saved = vi.fn();
    render(<MessageEmailPreference enabled onSaved={saved} />);
    fireEvent.click(screen.getByRole("switch"));
    await waitFor(() => expect(saved).toHaveBeenCalledTimes(1));
    expect(rpc).toHaveBeenCalledWith("update_message_email_preference", { _enabled: false });
  });
  it("keeps the previously saved preference on failure", async () => {
    rpc.mockResolvedValue({ error: { message: "forbidden" } });
    const saved = vi.fn();
    render(<MessageEmailPreference enabled onSaved={saved} />);
    fireEvent.click(screen.getByRole("switch"));
    await screen.findByRole("alert");
    expect(saved).not.toHaveBeenCalled();
    expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe("true");
  });
});