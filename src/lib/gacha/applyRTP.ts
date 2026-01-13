import crypto from "crypto";

import type { Database } from "@/types";
import { pickWeightedPattern } from "./patternWeight";

type Pattern = Database["public"]["Tables"]["gacha_patterns"]["Row"];

const secureRandomInt = (max: number) => crypto.randomInt(0, max);

export type RTPResult = {
  pattern: Pattern;
  finalResult: boolean;
};

export function applyRTP(
  selectedPattern: Pattern,
  currencyPatterns: Pattern[],
  currentRTP: number
): RTPResult {
  if (!selectedPattern.base_result) {
    return { pattern: selectedPattern, finalResult: false };
  }

  const normalizedRTP = Math.min(Math.max(currentRTP, 0), 100);
  const randomValue = secureRandomInt(100);

  if (randomValue < normalizedRTP) {
    return { pattern: selectedPattern, finalResult: true };
  }

  const loseVariants = currencyPatterns.filter((pattern) => pattern.base_result === false);
  if (loseVariants.length > 0) {
    const weighted = pickWeightedPattern(loseVariants, secureRandomInt);
    if (weighted) {
      return { pattern: weighted, finalResult: false };
    }
    return { pattern: loseVariants[secureRandomInt(loseVariants.length)], finalResult: false };
  }

  return { pattern: selectedPattern, finalResult: false };
}
