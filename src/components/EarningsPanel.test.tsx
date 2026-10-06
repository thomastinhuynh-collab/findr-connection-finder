import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import fr from "@/i18n/locales/fr.json";
import en from "@/i18n/locales/en.json";
import EarningsPanel from "./EarningsPanel";

const mocks = vi.hoisted(() => ({
  reservations: [] as Record<string, unknown>[],
  invoke: vi.fn(),
  language: "fr",
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    i18n: { language: mocks.language },
    t: (key: string) => key.split(".").reduce<unknown>((value, part) =>
      value && typeof value === "object" ? (value as Record<string, unknown>)[part] : undefined,
      mocks.language === "fr" ? fr : en) ?? key,
  }),
}));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: { invoke: mocks.invoke },
    from: (table: string) => {
      const query = {
        select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(), range: vi.fn().mockReturnThis(), in: vi.fn().mockReturnThis(),
        then: (resolve: (value: unknown) => unknown) => Promise.resolve({
          data: table === "reservations" ? mocks.reservations : [],
        }).then(resolve),
      };
      return query;
    },
  },
}));

afterEach(() => { cleanup(); vi.restoreAllMocks(); mocks.language = "fr"; });

describe("EarningsPanel", () => {
  it.each(["fr", "en"])("distinguishes delivery choice from shipping in %s", async (language) => {
    mocks.language = language;
    mocks.reservations = [null, "", "home", "relay"].map((delivery_type, index) => ({
      id: String(index), delivery_type, payment_status: "paye_en_attente_reception",
      findr_payout_amount: 10, search_id: "search", proposal_id: null,
    }));
    render(<MemoryRouter><EarningsPanel userId="findr" paymentsConfigured /></MemoryRouter>);
    const steps = (language === "fr" ? fr : en).mySpace.earnings.step;
    expect(await screen.findAllByText(steps.awaitingDeliveryChoice)).toHaveLength(2);
    expect(screen.getAllByText(steps.paye_en_attente_reception)).toHaveLength(2);
  });

  it("severs the opener before navigating to Stripe", async () => {
    mocks.reservations = [{ id: "sale", delivery_type: "home", payment_status: "expedie", search_id: "search" }];
    const events: string[] = [];
    const win = {
      set opener(value: unknown) { expect(value).toBeNull(); events.push("opener"); },
      location: { set href(value: string) { expect(value).toBe("https://stripe.example/"); events.push("navigate"); } },
      close: vi.fn(),
    };
    vi.spyOn(window, "open").mockReturnValue(win as unknown as Window);
    mocks.invoke.mockResolvedValue({ data: { url: "https://stripe.example/" }, error: null });
    render(<MemoryRouter><EarningsPanel userId="findr" paymentsConfigured /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: fr.mySpace.earnings.viewStripe }));
    await screen.findByRole("button", { name: fr.mySpace.earnings.viewStripe });
    expect(events).toEqual(["opener", "navigate"]);
  });
});