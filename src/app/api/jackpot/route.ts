import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "jackpot_pool")
      .maybeSingle();

    if (error) {
      throw error;
    }

    const amount = Number(data?.value ?? 0);

    return NextResponse.json({ amount: Number.isFinite(amount) ? amount : 0 });
  } catch (error) {
    console.error("Failed to fetch jackpot amount", error);
    return NextResponse.json({ amount: 0 }, { status: 200 });
  }
}
