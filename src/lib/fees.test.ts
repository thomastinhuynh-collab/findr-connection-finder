import { describe, expect, it } from "vitest";
import { computeFees } from "./fees";
import * as shared from "../../supabase/functions/_shared/fees";

const cases = [
  { price: 1, buyrFee: 0.54, total: 1.54, findrFee: 0.04, payout: 0.96 },
  { price: 5, buyrFee: 0.7, total: 5.7, findrFee: 0.2, payout: 4.8 },
  { price: 33.33, buyrFee: 1.83, total: 35.16, findrFee: 1.33, payout: 32 },
  { price: 50, buyrFee: 2.5, total: 52.5, findrFee: 2, payout: 48 },
  { price: 100, buyrFee: 4.5, total: 104.5, findrFee: 4, payout: 96 },
];

describe("computeFees", () => {
  it.each(cases)("price $price €", ({ price, ...expected }) => {
    expect(computeFees(price)).toEqual({ objectPrice: price, ...expected });
    expect(shared.computeFees(price)).toEqual({ objectPrice: price, ...expected });
  });
});
