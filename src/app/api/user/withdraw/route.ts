import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type WithdrawPayload = {
  walletAddress?: string;
  playId?: string;
};

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const adminClient = getSupabaseAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as WithdrawPayload;
  const walletAddress = body.walletAddress?.trim();
  const playId = body.playId;

  if (!walletAddress || !playId) {
    return NextResponse.json({ error: "walletAddress and playId are required" }, { status: 400 });
  }

  const { data: rawPlay, error: playError } = await adminClient
    .from("gacha_history")
    .select("id, user_id, final_result, prize_amount")
    .eq("id", playId)
    .maybeSingle();

  const play = rawPlay as {
    id: string;
    user_id: string;
    final_result: boolean;
    prize_amount: string;
  } | null;

  if (playError || !play) {
    return NextResponse.json({ error: "Play not found" }, { status: 404 });
  }

  if (play.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!play.final_result || Number(play.prize_amount ?? 0) <= 0) {
    return NextResponse.json({ error: "This play is not eligible for withdrawal" }, { status: 400 });
  }

  const { data: existing } = await adminClient
    .from("transactions")
    .select("id")
    .eq("gacha_history_id", playId)
    .eq("type", "WITHDRAWAL")
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Withdrawal already requested" }, { status: 400 });
  }

  const prizeAmount = Number(play.prize_amount ?? 0) || 0;

  const { error: insertError } = await adminClient.from("transactions").insert({
    user_id: user.id,
    type: "WITHDRAWAL",
    amount: prizeAmount,
    status: "PENDING",
    wallet_address: walletAddress,
    gacha_history_id: playId,
  } as never);

  if (insertError) {
    console.error("Failed to create withdrawal", insertError);
    return NextResponse.json({ error: "Could not submit withdrawal" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
