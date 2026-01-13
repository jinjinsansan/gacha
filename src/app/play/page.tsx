import { redirect } from "next/navigation";

import { PlayPortal } from "./PlayPortal";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PlayPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("deposit_address, balance")
    .eq("id", user!.id)
    .maybeSingle();

  if (error || !profile?.deposit_address) {
    throw new Error("User profile is missing a deposit address.");
  }

  const initialBalance = Number(profile.balance ?? 0) || 0;

  return (
    <div className="min-h-screen bg-[#05030a] px-6 py-16 text-white sm:px-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="space-y-3 text-center sm:text-left">
          <p className="text-xs uppercase tracking-[0.6em] text-white/60">Deposit</p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">Fuel the Gacha Machine</h1>
          <p className="text-white/70">
            Send $10 USDT (ERC-20) to unlock a single pull. We auto-detect confirmations and light up the
            START button once your balance is ready.
          </p>
        </div>

        <PlayPortal
          depositAddress={profile.deposit_address}
          initialBalance={initialBalance}
          email={user?.email ?? undefined}
        />
      </div>
    </div>
  );
}
