import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: rawData, error } = await supabase
    .from("users")
    .select("deposit_address")
    .eq("id", user.id)
    .maybeSingle();

  const data = rawData as { deposit_address: string } | null;
  if (error || !data?.deposit_address) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  return NextResponse.json({ depositAddress: data.deposit_address });
}
