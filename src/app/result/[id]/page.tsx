import Link from "next/link";
import { redirect } from "next/navigation";

import { ResultWinActions } from "./ResultWinActions";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type ResultPageProps = {
  params: {
    id: string;
  };
};

export default async function ResultPage({ params }: ResultPageProps) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data, error } = await supabase
    .from("gacha_history")
    .select(
      `
        id,
        user_id,
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

  if (error || !data || data.user_id !== user.id) {
    redirect("/");
  }

  const isWin = data.final_result;
  const prizeAmount = Number(data.prize_amount ?? 0);
  const pattern = data.pattern;

  return (
    <div className="min-h-screen bg-[#030208] px-6 py-16 text-white sm:px-10">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="space-y-3 text-center sm:text-left">
          <p className="text-xs uppercase tracking-[0.6em] text-white/60">Play Result</p>
          <h1 className={`text-4xl font-black leading-tight sm:text-5xl ${isWin ? "text-accent-win" : "text-white"}`}>
            {isWin ? "Jackpot secured" : "Better luck next spin"}
          </h1>
          <p className="text-white/70">
            Reel recorded at RTP {data.rtp_at_play}% on {new Date(data.played_at).toLocaleString()}.
          </p>
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/5 p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">Currency</p>
              <p className="mt-2 text-2xl font-semibold text-white">{pattern?.currency}</p>
              <p className="text-sm text-white/60">{pattern?.machine_color} machine</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">Outcome</p>
              <p className={`mt-2 text-2xl font-semibold ${isWin ? "text-accent-win" : "text-white"}`}>
                {isWin ? `WIN +$${prizeAmount.toFixed(2)}` : "LOSE"}
              </p>
              <p className="text-sm text-white/60">
                {pattern?.effect_1} → {pattern?.effect_2}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/play"
              className="inline-flex flex-1 items-center justify-center rounded-full bg-accent-primary px-6 py-3 text-base font-semibold text-black transition hover:bg-[#00d670]"
            >
              Play Again
            </Link>
            <Link
              href="/"
              className="inline-flex flex-1 items-center justify-center rounded-full border border-white/30 px-6 py-3 text-base font-semibold text-white transition hover:border-white/70"
            >
              Back to Home
            </Link>
          </div>

          {isWin ? (
            <div className="mt-8">
              <ResultWinActions playId={params.id} prizeAmount={prizeAmount} />
            </div>
          ) : (
            <p className="mt-8 text-center text-sm text-white/60">
              The jackpot grows by $1 every play. Recharge and try again to chase the neon dream.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
