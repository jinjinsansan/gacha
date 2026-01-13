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
    .select("deposit_address")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data?.deposit_address) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  return NextResponse.json({ depositAddress: data.deposit_address });
}
