"use client";

import { useCallback, useState } from "react";

import { GachaVideo } from "@/components/GachaVideo";

type DemoPlayResponse = {
  id: number;
  finalResult: boolean;
  prizeAmount: number;
  rtp: number;
  pattern: {
    id: number;
    currency: string;
    machineColor: string;
    effect1: string;
    effect2: string;
    videoUrl: string;
  };
};

type State = "idle" | "loading" | "playing" | "complete" | "error";

const PRIZE_BY_CURRENCY: Record<string, string> = {
  BTC: "$250",
  ETH: "$15",
  XRP: "$4",
  TRX: "$3",
};

export function DemoPlayClient() {
  const [state, setState] = useState<State>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [playData, setPlayData] = useState<DemoPlayResponse | null>(null);

  const startDemoPlay = useCallback(async () => {
    try {
      setState("loading");
      setErrorMessage(null);
      setPlayData(null);
      const response = await fetch("/api/demo/play", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Demo play failed");
      }
      setPlayData(data as DemoPlayResponse);
      setState("playing");
    } catch (error) {
      console.error("Demo play error", error);
      setErrorMessage(error instanceof Error ? error.message : "Unable to start demo play");
      setState("error");
    }
  }, []);

  const handleVideoEnded = () => {
    setState("complete");
  };

  const showVideo = playData && (state === "playing" || state === "complete");

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 shadow-[0_0_60px_rgba(0,0,0,0.45)]">
      <p className="text-xs uppercase tracking-[0.5em] text-white/60">Demo Chamber</p>
      <h2 className="mt-3 text-3xl font-black text-white">Try the reel without login</h2>
      <p className="mt-2 text-white/70">
        Click START DEMO to spin a random reel. This mode uses mock credits only—no blockchain or account
        required.
      </p>

      {errorMessage && <p className="mt-4 text-sm text-accent-jackpot">{errorMessage}</p>}

      <div className="mt-8">
        {showVideo ? (
          <div className="rounded-[32px] border border-white/15 bg-black/60 p-4">
            <div className="aspect-video overflow-hidden rounded-2xl bg-black">
              <GachaVideo src={playData.pattern.videoUrl} onEnded={handleVideoEnded} />
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
            {state === "complete" && (
              <p className="mt-4 text-base font-semibold text-white">
                {playData.finalResult ? "WIN!" : "LOSE"} — {playData.finalResult ? "Congratulations." : "Try again."}
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-white/20 bg-black/40 px-8 py-16 text-center">
            <p className="text-sm uppercase tracking-[0.5em] text-white/60">Demo Mode</p>
            <h3 className="mt-4 text-2xl font-semibold text-white">Experience the reel before logging in.</h3>
            <p className="mt-2 text-white/60">No wallet or deposit required.</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={startDemoPlay}
          disabled={state === "loading" || state === "playing"}
          className="inline-flex flex-1 items-center justify-center rounded-full bg-accent-primary px-6 py-3 text-base font-semibold text-black transition hover:bg-[#00d670] disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/60"
        >
          {state === "loading" ? "Spinning..." : state === "playing" ? "Playing" : "Start Demo"}
        </button>
        {showVideo && (
          <button
            type="button"
            onClick={startDemoPlay}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-white/30 px-6 py-3 text-base font-semibold text-white transition hover:border-white/70"
          >
            Play Again
          </button>
        )}
      </div>
    </div>
  );
}
