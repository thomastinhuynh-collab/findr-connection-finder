import { describe, it, expect } from "vitest";
import { sortTodos, splitTodos, daysLeft, daysAgo, type TodoItem } from "./todoActions";

const item = (key: string, kind: TodoItem["kind"], deadline: number | null): TodoItem => ({ key, kind, deadline });

describe("À faire maintenant", () => {
  it("met l'échéance la plus proche d'abord, puis les actions sans échéance", () => {
    const out = sortTodos([item("a", "message", null), item("b", "label", 300), item("c", "dropoff", 100)]);
    expect(out.map((i) => i.key)).toEqual(["c", "b", "a"]);
  });

  it("à égalité, « Finalise ton paiement » passe en premier", () => {
    const out = sortTodos([item("m", "message", null), item("p", "pay", null), item("r", "review", null)]);
    expect(out[0].key).toBe("p");
  });

  it("affiche 4 lignes et compte les autres", () => {
    const items = Array.from({ length: 6 }, (_, i) => item(String(i), "message", null));
    const s = splitTodos(items, false);
    expect(s.visible).toHaveLength(4);
    expect(s.hiddenCount).toBe(2);
    expect(splitTodos(items, true).visible).toHaveLength(6);
  });

  it("calcule les jours restants et écoulés", () => {
    const now = new Date("2026-11-16T12:00:00").getTime();
    expect(daysLeft(now + 2 * 86_400_000, now)).toBe(2);
    expect(daysLeft(now - 1000, now)).toBe(0);
    expect(daysAgo("2026-11-15T20:00:00", now)).toBe(1);
  });
});
