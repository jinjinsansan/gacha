"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { GachaVideo } from "@/components/GachaVideo";

type PlayResponse = {
  playId: string;
  finalResult: boolean;
  prizeAmount: number;
  pattern: {
    id: number;
    currency: string;
    machineColor: string;
    effect1: string;
    effect2: string;
    videoUrl: string;
  };
  balance: number;
  jackpotPool: number;
  rtp: number;
};

const PRIZE_BY_CURRENCY: Record<string, string> = {
  BTC: "$250",
  ETH: "$15",
  XRP: "$4",
  TRX: "$3",
};

export function PlayStartClient() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "error" | "playing">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [playData, setPlayData] = useState<PlayResponse | null>(null);

  const startPlay = useCallback(async () => {
    try {
      setState("loading");
      setErrorMessage(null);
      const response = await fetch("/api/gacha/play", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Play failed");
      }
      setPlayData(data as PlayResponse);
      setState("playing");
    } catch (error) {
      console.error("Start play error", error);
      setErrorMessage(error instanceof Error ? error.message : "Unable to start gacha");
      setState("error");
    }
  }, []);

  const handleVideoEnd = useCallback(() => {
    if (playData?.playId) {
      router.replace(`/result/${playData.playId}`);
    }
  }, [playData?.playId, router]);

  useEffect(() => {
    if (state === "idle") {
      startPlay();
    }
  }, [state, startPlay]);

  const showVideo = state === "playing" && playData?.pattern;

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 shadow-[0_0_60px_rgba(0,0,0,0.45)]">
      <p className="text-xs uppercase tracking-[0.5em] text-white/60">Gacha Chamber</p>
      <h2 className="mt-3 text-3xl font-black text-white">Ready to roll?</h2>
      <p className="mt-2 text-white/70">
        Hit START to consume 1 play credit. A random reel will spin based on live RTP control. No skips,
        no rewinds.
      </p>

      {errorMessage && <p className="mt-4 text-sm text-accent-jackpot">{errorMessage}</p>}

      <div className="mt-8">
        {showVideo ? (
          <div className="rounded-[32px] border border-white/15 bg-black/60 p-4">
            <div className="aspect-video overflow-hidden rounded-2xl bg-black">
              <GachaVideo src={playData.pattern.videoUrl} onEnded={handleVideoEnd} />
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/70">
              <span>
                Currency: <strong>{playData.pattern.currency}</strong>
              </span>
              <span>
                Prize: <strong>{PRIZE_BY_CURRENCY[playData.pattern.currency] ?? `$${playData.prizeAmount}`}</strong>
              </span>
              <span>
                RTP: <strong>{playData.rtp}%</strong>
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-white/20 bg-black/40 px-8 py-16 text-center">
            <p className="text-sm uppercase tracking-[0.5em] text-white/60">Awaiting play</p>
            <h3 className="mt-4 text-2xl font-semibold text-white">Insert credits to unleash the reel.</h3>
            <p className="mt-2 text-white/60">Balance will be deducted automatically.</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={startPlay}
          disabled={state === "loading" || state === "playing"}
          className="inline-flex flex-1 items-center justify-center rounded-full bg-accent-primary px-6 py-3 text-base font-semibold text-black transition hover:bg-[#00d670] disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/60"
        >
          {state === "loading" ? "Spinning..." : state === "playing" ? "Playing" : "Start Play"}
        </button>
        <button
          type="button"
          onClick={() => router.replace("/play")}
          className="inline-flex flex-1 items-center justify-center rounded-full border border-white/30 px-6 py-3 text-base font-semibold text-white transition hover:border-white/70"
        >
          Back to Deposit
        </button>
      </div>
    </div>
  );
}
