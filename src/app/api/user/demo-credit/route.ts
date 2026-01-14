import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const parseBooleanEnv = (value?: string | null) => {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on";
};

const resolveDemoModeEnabled = () =>
  parseBooleanEnv(process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE ?? process.env.ENABLE_DEMO_MODE);

const resolveDemoCreditAmount = () => {
  const raw = Number(process.env.NEXT_PUBLIC_DEMO_CREDIT_AMOUNT ?? process.env.DEMO_CREDIT_AMOUNT ?? 5);
  return Number.isFinite(raw) && raw > 0 ? raw : 5;
};

const DEMO_MODE_ENABLED = resolveDemoModeEnabled();
const DEMO_CREDIT_AMOUNT = resolveDemoCreditAmount();

export async function POST() {
  if (!DEMO_MODE_ENABLED) {
    return NextResponse.json({ error: "Demo mode is disabled" }, { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profileData, error: profileError } = await supabase
    .from("users")
    .select("balance")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profileData) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const profile = profileData as { balance: string };
  const currentBalance = Number(profile.balance ?? 0) || 0;
  const addedAmount = DEMO_CREDIT_AMOUNT;
  const newBalance = currentBalance + addedAmount;

  const { error: updateError } = await supabase
    .from("users")
    .update({ balance: newBalance } as never)
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update balance" }, { status: 500 });
  }

  const adminClient = getSupabaseAdminClient();
  const { error: txError } = await adminClient.from("transactions").insert({
    user_id: user.id,
    type: "DEMO_CREDIT",
    amount: addedAmount,
    status: "CONFIRMED",
  } as never);

  if (txError) {
    return NextResponse.json({ error: "Failed to record demo credit" }, { status: 500 });
  }

  return NextResponse.json({ balance: newBalance, added: addedAmount });
}
