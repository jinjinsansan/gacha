import { redirect } from "next/navigation";

import { PlayPortal } from "./PlayPortal";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const parseBooleanEnv = (value?: string | null) => {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on";
};

const getDemoModeEnabled = () =>
  parseBooleanEnv(process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE ?? process.env.ENABLE_DEMO_MODE);

const getDemoCreditAmount = () => {
  const raw = Number(process.env.NEXT_PUBLIC_DEMO_CREDIT_AMOUNT ?? process.env.DEMO_CREDIT_AMOUNT ?? 5);
  return Number.isFinite(raw) && raw > 0 ? raw : 5;
};

export default async function PlayPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: rawProfile, error } = await supabase
    .from("users")
    .select("deposit_address, balance")
    .eq("id", user!.id)
    .maybeSingle();

  const profile = rawProfile as { deposit_address: string; balance: string } | null;
  if (error || !profile?.deposit_address) {
    throw new Error("User profile is missing a deposit address.");
  }

  const initialBalance = Number(profile.balance ?? 0) || 0;
  const demoModeEnabled = getDemoModeEnabled();
  const demoCreditAmount = getDemoCreditAmount();

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
          demoModeEnabled={demoModeEnabled}
          demoCreditAmount={demoCreditAmount}
        />
      </div>
    </div>
  );
}
