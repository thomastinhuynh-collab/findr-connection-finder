import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ConversationView from "./ConversationView";
import i18n from "@/i18n";

const { insert, upload, auth } = vi.hoisted(() => ({ insert: vi.fn(), upload: vi.fn(), auth: { user: { id: "buyr" }, loading: false } }));
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => auth }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("./ExchangeCard", () => ({ default: () => null }));
vi.mock("./DeleteExchangeMenu", () => ({ default: () => null }));
vi.mock("./ReportMessageDialog", () => ({ default: () => null }));
vi.mock("@/lib/fileValidation", () => ({ compressAndValidate: async (files: File[]) => ({ valid: files, oversized: [] }), oversizedDescription: () => "" }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  from: (table: string) => {
    const data = table === "searches" ? { id: "search", title: "Livre", user_id: "buyr" } : table === "profiles" ? { full_name: "Olga" } : [];
    const query: Record<string, unknown> = {};
    for (const method of ["select", "eq", "order", "range", "limit", "lt", "update", "in"]) query[method] = () => query;
    query.maybeSingle = async () => ({ data, error: null });
    query.then = (resolve: (value: unknown) => unknown) => Promise.resolve({ data, error: null }).then(resolve);
    query.insert = (value: unknown) => { insert(value); return { select: () => ({ single: async () => ({ error: null }) }) }; };
    return query;
  },
  channel: () => { const channel = { on: () => channel, subscribe: () => channel }; return channel; },
  removeChannel: vi.fn(),
  storage: { from: () => ({ upload, getPublicUrl: () => ({ data: { publicUrl: "photo" } }) }) },
} }));

const open = async () => {
  render(<MemoryRouter><ConversationView searchId="search" withUserId="findr" embedded /></MemoryRouter>);
  return screen.findByRole("textbox");
};

describe("conversation sending rules remain unchanged", () => {
  beforeEach(() => {
    vi.clearAllMocks(); i18n.changeLanguage("fr");
    vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
    URL.createObjectURL = vi.fn(() => "blob:photo"); URL.revokeObjectURL = vi.fn();
    upload.mockResolvedValue({ error: null });
  });
  it("accepts 240 characters and rejects a 241st", async () => {
    const input = await open();
    fireEvent.change(input, { target: { value: "a".repeat(240) } });
    fireEvent.change(input, { target: { value: "a".repeat(241) } });
    expect(input).toHaveValue("a".repeat(240));
  });
  it("limits attached photos to five even when six are selected", async () => {
    await open();
    const input = document.querySelector('input[type="file"]');
    if (!input) throw new Error("Missing file input");
    fireEvent.change(input, { target: { files: Array.from({ length: 6 }, (_, i) => new File(["photo"], `${i}.png`, { type: "image/png" })) } });
    await waitFor(() => expect(screen.getAllByAltText(/preview-/)).toHaveLength(5));
  });
  it("warns before sending off-platform contact, and sends only after confirmation", async () => {
    const input = await open();
    fireEvent.change(input, { target: { value: "Appelle-moi au 06 12 34 56 78" } });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer le message" }));
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(insert).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Envoyer quand même" }));
    await waitFor(() => expect(insert).toHaveBeenCalledWith({ search_id: "search", sender_id: "buyr", receiver_id: "findr", content: "Appelle-moi au 06 12 34 56 78", images: [] }));
    await waitFor(() => expect(input).toHaveValue(""));
  });
});