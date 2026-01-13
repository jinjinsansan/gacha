import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, context: Params) {
  const { params } = context;
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("gacha_history")
    .select(
      `
        id,
        user_id,
        pattern_id,
        final_result,
        rtp_at_play,
        prize_amount,
        played_at,
        pattern:gacha_patterns (
          id,
          currency,
          machine_color,
          effect_1,
          effect_2,
          video_url,
          prize_amount
        )
      `
    )
    .eq("id", params.id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Result not found" }, { status: 404 });
  }

  if (data.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ result: data });
}
