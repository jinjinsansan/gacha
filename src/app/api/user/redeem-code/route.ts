import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type RedeemPayload = {
  code?: string;
};

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as RedeemPayload;
  const code = body.code?.trim().toUpperCase();

  if (!code) {
    return NextResponse.json({ error: "Campaign code is required" }, { status: 400 });
  }

  const { data: campaign, error: codeError } = await supabase
    .from("campaign_codes")
    .select("id, plays_granted, max_uses, current_uses, expires_at, is_active")
    .eq("code", code)
    .maybeSingle();

  if (codeError || !campaign) {
    return NextResponse.json({ error: "Code not found" }, { status: 404 });
  }

  const now = new Date();
  if (!campaign.is_active) {
    return NextResponse.json({ error: "Code is inactive" }, { status: 400 });
  }
  if (campaign.expires_at && new Date(campaign.expires_at) < now) {
    return NextResponse.json({ error: "Code expired" }, { status: 400 });
  }
  if (campaign.current_uses >= campaign.max_uses) {
    return NextResponse.json({ error: "Code has reached max uses" }, { status: 400 });
  }

  const { data: alreadyRedeemed } = await supabase
    .from("code_redemptions")
    .select("id")
    .eq("user_id", user.id)
    .eq("code_id", campaign.id)
    .maybeSingle();

  if (alreadyRedeemed) {
    return NextResponse.json({ error: "Code already redeemed" }, { status: 400 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("balance")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.balance == null) {
    return NextResponse.json({ error: "User profile missing" }, { status: 400 });
  }

  const currentBalance = Number(profile.balance) || 0;
  const updatedBalance = currentBalance + campaign.plays_granted;

  const [redeemResult, codeUpdateResult, balanceResult] = await Promise.all([
    supabase.from("code_redemptions").insert({ user_id: user.id, code_id: campaign.id }),
    supabase
      .from("campaign_codes")
      .update({ current_uses: campaign.current_uses + 1 })
      .eq("id", campaign.id),
    supabase.from("users").update({ balance: updatedBalance }).eq("id", user.id),
  ]);

  if (redeemResult.error || codeUpdateResult.error || balanceResult.error) {
    console.error("Redeem code errors", {
      redeem: redeemResult.error?.message,
      codeUpdate: codeUpdateResult.error?.message,
      balanceUpdate: balanceResult.error?.message,
    });
    return NextResponse.json({ error: "Failed to redeem code" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    balance: updatedBalance,
    playsGranted: campaign.plays_granted,
  });
}
