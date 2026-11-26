import { describe, expect, it } from "vitest";
import { conversationScrollTop } from "./conversationScroll";

describe("conversation scrolling", () => {
  it("opens at the latest message in a long history", () => {
    expect(conversationScrollTop(6000, 200, null)).toBe(5800);
  });
  it("preserves the reading position when loading older messages", () => {
    expect(conversationScrollTop(8000, 200, { height: 6000, top: 30 })).toBe(2030);
  });
  it("does not scroll an empty or short history", () => {
    expect(conversationScrollTop(100, 200, null)).toBe(0);
  });
});