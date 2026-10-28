import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import fr from "@/i18n/locales/fr.json";
import en from "@/i18n/locales/en.json";
import AdminShippingRates from "./AdminShippingRates";

const mocks = vi.hoisted(() => ({ isAdmin: false, loading: false, language: "fr" }));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    i18n: { language: mocks.language },
    t: (key: string) => key.split(".").reduce<unknown>((value, part) =>
      value && typeof value === "object" ? (value as Record<string, unknown>)[part] : undefined,
      mocks.language === "fr" ? fr : en) ?? key,
  }),
}));
vi.mock("@/hooks/useIsAdmin", () => ({
  useIsAdmin: () => ({ isAdmin: mocks.isAdmin, loading: mocks.loading }),
}));
vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => {
      const query = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockResolvedValue({ error: null }),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
        then: (resolve: (value: unknown) => unknown) =>
          Promise.resolve({ data: [], error: null }).then(resolve),
      };
      return query;
    },
  },
}));

afterEach(() => { cleanup(); vi.restoreAllMocks(); mocks.isAdmin = false; mocks.loading = false; mocks.language = "fr"; });

describe("shipping rates page access", () => {
  it.each(["fr", "en"])("shows only the administrators-only message to non-admins in %s", async (language) => {
    mocks.language = language;
    const copy = (language === "fr" ? fr : en).adminShipping;
    render(<MemoryRouter><AdminShippingRates /></MemoryRouter>);
    expect(await screen.findByRole("heading", { name: copy.accessTitle })).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByRole("button", { name: copy.add })).toBeNull();
    expect(screen.queryByText(copy.empty)).toBeNull();
  });

  it("shows the rates form to an administrator", async () => {
    mocks.isAdmin = true;
    render(<MemoryRouter><AdminShippingRates /></MemoryRouter>);
    expect(await screen.findByText(fr.adminShipping.empty)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: fr.adminShipping.add })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: fr.adminShipping.accessTitle })).toBeNull();
  });
});
