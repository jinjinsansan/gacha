import type { Database } from "@/types";

type Pattern = Database["public"]["Tables"]["gacha_patterns"]["Row"];

const DEFAULT_WEIGHT = 1;

export function resolvePatternWeight(pattern: Pattern): number {
  const raw = Number(pattern.weight ?? DEFAULT_WEIGHT);
  if (!Number.isFinite(raw) || raw <= 0) {
    return DEFAULT_WEIGHT;
  }
  return Math.max(DEFAULT_WEIGHT, Math.floor(raw));
}

export function pickWeightedPattern(
  patterns: Pattern[],
  randomInt: (max: number) => number
): Pattern | null {
  if (!patterns.length) {
    return null;
  }

  const totalWeight = patterns.reduce((sum, pattern) => sum + resolvePatternWeight(pattern), 0);
  if (totalWeight <= 0) {
    return null;
  }

  const target = randomInt(totalWeight);
  let cumulative = 0;
  for (const pattern of patterns) {
    cumulative += resolvePatternWeight(pattern);
    if (target < cumulative) {
      return pattern;
    }
  }

  return patterns[patterns.length - 1];
}
