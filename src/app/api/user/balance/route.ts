import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("users")
    .select("balance")
    .eq("id", user.id)
    .maybeSingle();

  if (error || data?.balance == null) {
    return NextResponse.json({ error: "Balance not found" }, { status: 404 });
  }

  const balance = Number(data.balance);
  return NextResponse.json({ balance: Number.isFinite(balance) ? balance : 0 });
}
