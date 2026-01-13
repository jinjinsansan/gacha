import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const DEFAULT_REDIRECT_PATH = "/play";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = requestUrl.searchParams.get("next") ?? DEFAULT_REDIRECT_PATH;

  if (!code) {
    requestUrl.searchParams.set("auth_error", "missing_code");
    requestUrl.pathname = "/";
    return NextResponse.redirect(requestUrl);
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    requestUrl.searchParams.set("auth_error", error.message);
    requestUrl.pathname = "/";
    return NextResponse.redirect(requestUrl);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await ensureUserProfile(user);
  }

  const targetUrl = new URL(nextPath, requestUrl.origin);
  return NextResponse.redirect(targetUrl);
}

async function ensureUserProfile(user: User) {
  const adminClient = getSupabaseAdminClient();

  const { data: existingProfile } = await adminClient
    .from("users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile) {
    return;
  }

  await adminClient.from("users").insert({
    id: user.id,
    email: user.email ?? "unknown",
    deposit_address: generatePlaceholderDepositAddress(user.id),
  });
}

function generatePlaceholderDepositAddress(userId: string) {
  return `GACHA-${userId.slice(0, 8)}-${randomUUID().split("-")[0]}`;
}
