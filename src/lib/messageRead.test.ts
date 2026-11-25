import { describe, it, expect } from "vitest";
import { unreadIdsFromPartner } from "./messageRead";

const me = "buyr";
const msgs = [
  { id: "a1", sender_id: "findrA", receiver_id: me, is_read: false },
  { id: "b1", sender_id: "findrB", receiver_id: me, is_read: false },
  { id: "a2", sender_id: "findrA", receiver_id: me, is_read: true },
  { id: "m1", sender_id: me, receiver_id: "findrA", is_read: false },
];

describe("unreadIdsFromPartner", () => {
  it("ne marque que les messages de l'interlocuteur affiché", () => {
    expect(unreadIdsFromPartner(msgs, me, "findrA")).toEqual(["a1"]);
  });
  it("ne touche pas les non lus d'un autre findr sur la même recherche", () => {
    expect(unreadIdsFromPartner(msgs, me, "findrA")).not.toContain("b1");
    expect(unreadIdsFromPartner(msgs, me, "findrB")).toEqual(["b1"]);
  });
});
