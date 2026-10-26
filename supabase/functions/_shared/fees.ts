// Keep in sync with src/lib/fees.ts
export const BUYR_FIXED_FEE = 0.5;
export const BUYR_RATE = 0.04;
export const FINDR_RATE = 0.04;

export const round2 = (n: number) => Math.round(n * 100) / 100;

export const computeFees = (price: number) => {
  const objectPrice = round2(price);
  const buyrFee = round2(BUYR_FIXED_FEE + objectPrice * BUYR_RATE);
  const findrFee = round2(objectPrice * FINDR_RATE);
  return {
    objectPrice,
    buyrFee,
    findrFee,
    total: round2(objectPrice + buyrFee),
    payout: round2(objectPrice - findrFee),
  };
};
