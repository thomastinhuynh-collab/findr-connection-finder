import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import fs from "node:fs";
import DeleteExchangeMenu from "./DeleteExchangeMenu";
import { deleteErrorKey, isSaleOpen, nextAfterDelete } from "@/lib/deleteExchange";
import { exchangeCardState } from "@/lib/exchangeCard";
import { PROPOSALS_REDIRECT } from "@/lib/mySpaceSections";
import i18n from "@/i18n";

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc } }));

const openMenu = async () => {
  const trigger = screen.getByRole("button", { name: "Plus d'actions pour la conversation avec Léa" });
  trigger.focus(); fireEvent.keyDown(trigger, { key: "Enter" });
  return screen.findByRole("menuitem");
};

describe("suppression d'une conversation", () => {
  beforeEach(() => { vi.clearAllMocks(); i18n.changeLanguage("fr"); });

  it("désactive l'action pendant une vente, avec le texte visible", async () => {
    render(<DeleteExchangeMenu searchId="s" partnerId="p" partnerFirstName="Léa" canDelete={false} onDeleted={vi.fn()} />);
    const item = await openMenu();
    expect(item.getAttribute("aria-disabled")).toBe("true");
    expect(screen.getByText("Impossible tant que la vente est en cours.")).toBeTruthy();
    fireEvent.click(item);
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("confirme puis appelle hide_exchange", async () => {
    rpc.mockResolvedValue({ error: null });
    const done = vi.fn();
    render(<DeleteExchangeMenu searchId="s" partnerId="p" partnerFirstName="Léa" canDelete onDeleted={done} />);
    fireEvent.click(await openMenu());
    const dialog = await screen.findByRole("alertdialog");
    expect(screen.getByText("Supprimer cette conversation ?")).toBeTruthy();
    expect(dialog.textContent).toContain("Elle disparaît de ta messagerie. Léa la garde de son côté, et findr conserve les messages (litiges, obligations légales). Elle réapparaît si Léa t'écrit ou si une vente démarre.");
    fireEvent.click(screen.getByRole("button", { name: "Supprimer" }));
    await waitFor(() => expect(done).toHaveBeenCalledTimes(1));
    expect(rpc).toHaveBeenCalledWith("hide_exchange", { _search_id: "s", _partner_id: "p" });
  });

  it("« Garder » ferme sans rien supprimer", async () => {
    render(<DeleteExchangeMenu searchId="s" partnerId="p" partnerFirstName="Léa" canDelete onDeleted={vi.fn()} />);
    fireEvent.click(await openMenu());
    fireEvent.click(await screen.findByRole("button", { name: "Garder" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    expect(rpc).not.toHaveBeenCalled();
  });

  it("affiche le refus sale_in_progress", async () => {
    rpc.mockResolvedValue({ error: { message: "sale_in_progress" } });
    const done = vi.fn();
    render(<DeleteExchangeMenu searchId="s" partnerId="p" partnerFirstName="Léa" canDelete onDeleted={done} />);
    fireEvent.click(await openMenu());
    fireEvent.click(await screen.findByRole("button", { name: "Supprimer" }));
    expect((await screen.findByRole("alert")).textContent).toBe("Impossible tant que la vente est en cours.");
    expect(done).not.toHaveBeenCalled();
  });

  it("règles partagées", () => {
    expect(deleteErrorKey("sale_in_progress")).toBe("blocked");
    expect(deleteErrorKey("boom")).toBe("errorGeneric");
    expect(isSaleOpen("expedie")).toBe(true);
    expect(isSaleOpen("termine")).toBe(false);
    const k = (x: string) => x;
    expect(nextAfterDelete(["a", "b", "c"], "b", k)).toBe("c");
    expect(nextAfterDelete(["a", "b"], "b", k)).toBe("a");
    expect(nextAfterDelete(["a"], "a", k)).toBeNull();
    const sale = (payment_status: string) => exchangeCardState({ iAmBuyr: true, searchId: "s", proposals: [],
      reservations: [{ id: "r", status: "approved", payment_status, created_at: "2026-01-01" } as never] });
    expect(sale("paye_en_attente_reception")?.saleOpen).toBe(true);
    expect(sale("termine")?.saleOpen).toBe(false);
  });
});

describe("Messagerie sans filtres et anciens liens", () => {
  const src = fs.readFileSync("src/pages/MessagingList.tsx", "utf8");
  it("la liste n'a plus de filtres ni de compteurs", () => {
    expect(src).not.toContain("exchange_filter_counts");
    expect(src).not.toContain("EXCHANGE_FILTERS");
    expect(src).not.toContain('params.get("filtre")');
    expect(src).toContain('const LIST_FILTER = "toutes"');
  });
  it("les liens émis mènent à /messagerie", () => {
    expect(PROPOSALS_REDIRECT).toBe("/messagerie");
    for (const f of ["src/App.tsx", "src/components/ProposalList.tsx", "src/pages/EditProposal.tsx", "supabase/functions/stripe-webhook/index.ts"]) {
      expect(fs.readFileSync(f, "utf8")).not.toContain("filtre=en_attente");
    }
  });
});
