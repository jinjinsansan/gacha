import { NextResponse } from "next/server";

import { demoPatterns, type DemoPattern } from "@/data/demoPatterns";

const currencyWeights: Record<DemoPattern["currency"], number> = {
  BTC: 2,
  ETH: 20,
  XRP: 30,
  TRX: 48,
};

const totalCurrencyWeight = Object.values(currencyWeights).reduce((sum, weight) => sum + weight, 0);

const RTP_PERCENT = 90;

const randomInt = (max: number) => Math.floor(Math.random() * max);

const pickCurrency = (): DemoPattern["currency"] => {
  const roll = randomInt(totalCurrencyWeight);
  let cumulative = 0;
  for (const [currency, weight] of Object.entries(currencyWeights)) {
    cumulative += weight;
    if (roll < cumulative) {
      return currency as DemoPattern["currency"];
    }
  }
  return "TRX";
};

const pickPattern = (): DemoPattern => {
  if (!demoPatterns.length) {
    throw new Error("Demo patterns not configured");
  }

  const currency = pickCurrency();
  const candidates = demoPatterns.filter((pattern) => pattern.currency === currency);
  if (!candidates.length) {
    return demoPatterns[randomInt(demoPatterns.length)];
  }

  const totalWeight = candidates.reduce((sum, item) => sum + (item.weight ?? 1), 0);
  const roll = randomInt(totalWeight);
  let cumulative = 0;
  for (const pattern of candidates) {
    cumulative += pattern.weight ?? 1;
    if (roll < cumulative) {
      return pattern;
    }
  }

  return candidates[0];
};

const applyRTP = (pattern: DemoPattern) => {
  if (!pattern.base_result) {
    return { pattern, finalResult: false };
  }

  const roll = randomInt(100);
  if (roll < RTP_PERCENT) {
    return { pattern, finalResult: true };
  }

  const loseCandidates = demoPatterns.filter(
    (candidate) => candidate.currency === pattern.currency && candidate.base_result === false
  );
  if (loseCandidates.length) {
    return { pattern: loseCandidates[randomInt(loseCandidates.length)], finalResult: false };
  }

  return { pattern, finalResult: false };
};

export async function GET() {
  try {
    const selectedPattern = pickPattern();
    const { pattern, finalResult } = applyRTP(selectedPattern);
    const prizeAmount = finalResult ? pattern.prize_amount : 0;

    return NextResponse.json({
      id: pattern.id,
      finalResult,
      prizeAmount,
      rtp: RTP_PERCENT,
      pattern: {
        id: pattern.id,
        currency: pattern.currency,
        machineColor: pattern.machine_color,
        effect1: pattern.effect_1,
        effect2: pattern.effect_2,
        videoUrl: pattern.video_url,
      },
    });
  } catch (error) {
    console.error("Demo play failed", error);
    return NextResponse.json({ error: "Demo mode temporarily unavailable" }, { status: 500 });
  }
}
