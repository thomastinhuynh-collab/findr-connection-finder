import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import fr from "@/i18n/locales/fr.json";
import en from "@/i18n/locales/en.json";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProposalList from "./ProposalList";

const mocks = vi.hoisted(() => ({ language: "fr" }));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    i18n: { language: mocks.language },
    t: (key: string, options?: Record<string, unknown>) => {
      const value = key.split(".").reduce<unknown>((acc, part) =>
        acc && typeof acc === "object" ? (acc as Record<string, unknown>)[part] : undefined,
        mocks.language === "fr" ? fr : en);
      if (typeof value !== "string") return key;
      return options
        ? Object.entries(options).reduce((text, [k, v]) => text.split(`{{${k}}}`).join(String(v)), value)
        : value;
    },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "buyr-1" } }) }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }), toast: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: { invoke: vi.fn() },
    from: () => ({
      select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(),
      then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data: [] }).then(resolve),
    }),
  },
}));
vi.mock("@/components/ui/carousel", () => ({
  Carousel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CarouselContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CarouselItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CarouselNext: () => null,
  CarouselPrevious: () => null,
}));
vi.mock("@/components/DisputeBanner", () => ({ default: () => null }));
vi.mock("@/components/DisputeDialog", () => ({ default: () => null }));
vi.mock("@/components/BuyrLabelActionBox", () => ({ default: () => null }));
vi.mock("@/components/TrackingRecognition", () => ({ default: () => null }));
vi.mock("@/components/ShippingEstimate", () => ({ default: () => null }));
vi.mock("@/components/TranslatedContent", () => ({
  default: ({ children }: { children: (v: { title: string; description: string | null }) => React.ReactNode }) =>
    <>{children({ title: "", description: null })}</>,
}));
vi.mock("@/components/DeliveryChoicePicker", () => ({ default: () => null }));

afterEach(() => { cleanup(); vi.restoreAllMocks(); mocks.language = "fr"; });

const proposalWithLink = {
  id: "prop-1",
  title: "Marque - Neuf avec étiquette",
  description: null,
  proposed_price: 50,
  image_urls: [],
  product_link: "https://www.vinted.fr/items/123456",
  status: "pending",
  created_at: "2026-11-10T10:00:00Z",
  findr_id: "findr-1",
  findr_profile: { full_name: "Olga", avatar_url: null, is_premium: false },
};

describe("ProposalList product link", () => {
  it.each(["fr", "en"])("never renders a stored product link in %s", (language) => {
    mocks.language = language;
    render(
      <MemoryRouter>
        <TooltipProvider>
        <ProposalList
          proposals={[proposalWithLink]}
          isOwner
          searchId="search-1"
          searchOwnerId="buyr-1"
          isPremium={false}
          onProposalUpdate={() => {}}
        />
        </TooltipProvider>
      </MemoryRouter>,
    );
    expect(screen.queryByRole("link", { name: /annonce|listing/i })).toBeNull();
    expect(document.querySelector('a[href*="vinted.fr"]')).toBeNull();
  });
});
