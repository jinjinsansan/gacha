import { NextResponse } from "next/server";

import { applyRTP } from "@/lib/gacha/applyRTP";
import { selectPattern } from "@/lib/gacha/selectPattern";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const PLAY_COST = 1;

export async function POST() {
  const supabase = createSupabaseServerClient();
  const adminClient = getSupabaseAdminClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("balance")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.balance == null) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const currentBalance = Number(profile.balance) || 0;
  if (currentBalance < PLAY_COST) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 402 });
  }

  try {
    const [{ data: patterns, error: patternError }, { data: rtpSetting }, { data: jackpotSetting }] =
      await Promise.all([
        adminClient.from("gacha_patterns").select("*"),
        adminClient.from("system_settings").select("value").eq("key", "current_rtp").maybeSingle(),
        adminClient.from("system_settings").select("value").eq("key", "jackpot_pool").maybeSingle(),
      ]);

    if (patternError || !patterns?.length) {
      throw new Error(patternError?.message ?? "Missing gacha patterns");
    }

    const selectedPattern = selectPattern(patterns);
    const currencyPatterns = patterns.filter((pattern) => pattern.currency === selectedPattern.currency);
    const currentRTP = Number(rtpSetting?.value ?? 90) || 90;
    const { pattern: finalPattern, finalResult } = applyRTP(selectedPattern, currencyPatterns, currentRTP);

    const prizeAmount = finalResult ? Number(finalPattern.prize_amount ?? 0) : 0;
    const newBalance = currentBalance - PLAY_COST;
    const jackpotPool = Number(jackpotSetting?.value ?? 0) || 0;
    const newJackpotValue = jackpotPool + 1;

    const historyPayload = {
      user_id: user.id,
      pattern_id: finalPattern.id,
      final_result: finalResult,
      rtp_at_play: Math.round(currentRTP),
      prize_amount: prizeAmount,
    };

    const historyResult = await adminClient
      .from("gacha_history")
      .insert(historyPayload)
      .select("id")
      .single();

    if (historyResult.error || !historyResult.data?.id) {
      throw new Error(historyResult.error?.message ?? "Failed to record gacha history");
    }

    const playId = historyResult.data.id as string;

    const [balanceResult, jackpotResult, playTxResult, winTxResult] = await Promise.all([
      supabase.from("users").update({ balance: newBalance }).eq("id", user.id),
      adminClient
        .from("system_settings")
        .update({ value: newJackpotValue.toString() })
        .eq("key", "jackpot_pool"),
      adminClient.from("transactions").insert({
        user_id: user.id,
        type: "PLAY",
        amount: PLAY_COST,
        status: "CONFIRMED",
        gacha_history_id: playId,
      }),
      finalResult
        ? adminClient.from("transactions").insert({
            user_id: user.id,
            type: "WIN",
            amount: prizeAmount,
            status: "PENDING",
            gacha_history_id: playId,
          })
        : Promise.resolve({ error: null }),
    ]);

    if (
      balanceResult.error ||
      jackpotResult.error ||
      playTxResult.error ||
      (finalResult && winTxResult && "error" in winTxResult && winTxResult.error)
    ) {
      throw new Error(
        balanceResult.error?.message ||
          jackpotResult.error?.message ||
          playTxResult.error?.message ||
          (winTxResult as { error?: { message: string } }).error?.message ||
          "Failed to record play"
      );
    }

    return NextResponse.json({
      playId,
      finalResult,
      prizeAmount,
      pattern: {
        id: finalPattern.id,
        currency: finalPattern.currency,
        machineColor: finalPattern.machine_color,
        effect1: finalPattern.effect_1,
        effect2: finalPattern.effect_2,
        videoUrl: finalPattern.video_url,
      },
      balance: newBalance,
      jackpotPool: newJackpotValue,
      rtp: currentRTP,
    });
  } catch (error) {
    console.error("Gacha play failed", error);
    return NextResponse.json({ error: "Failed to process play" }, { status: 500 });
  }
}
