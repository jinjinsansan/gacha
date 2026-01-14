import { redirect } from "next/navigation";

import { PlayStartClient } from "./PlayStartClient";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PlayStartPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#040308] px-6 py-16 text-white sm:px-10">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="space-y-3 text-center sm:text-left">
          <p className="text-xs uppercase tracking-[0.6em] text-white/60">Gacha Roll</p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">Spin the Capsule</h1>
          <p className="text-white/70">
            This sequence cannot be skipped. Once spinning starts, the result will be recorded on our
            secure ledger and linked to your account.
          </p>
        </div>

        <PlayStartClient />
      </div>
    </div>
  );
}
