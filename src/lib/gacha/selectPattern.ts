import crypto from "crypto";

import type { Database } from "@/types";

type Pattern = Database["public"]["Tables"]["gacha_patterns"]["Row"];

const currencyWeights: { currency: Pattern["currency"]; weight: number }[] = [
  { currency: "BTC", weight: 2 },
  { currency: "ETH", weight: 20 },
  { currency: "XRP", weight: 30 },
  { currency: "TRX", weight: 48 },
];

const totalWeight = currencyWeights.reduce((sum, curr) => sum + curr.weight, 0);

const secureRandomInt = (max: number) => crypto.randomInt(0, max);

export function selectPattern(patterns: Pattern[]): Pattern {
  if (patterns.length === 0) {
    throw new Error("No gacha patterns available");
  }

  const randomValue = secureRandomInt(totalWeight);
  let cumulative = 0;
  let selectedCurrency = currencyWeights[0].currency;

  for (const entry of currencyWeights) {
    cumulative += entry.weight;
    if (randomValue < cumulative) {
      selectedCurrency = entry.currency;
      break;
    }
  }

  const candidates = patterns.filter((pattern) => pattern.currency === selectedCurrency);

  if (candidates.length === 0) {
    return patterns[secureRandomInt(patterns.length)];
  }

  return candidates[secureRandomInt(candidates.length)];
}
