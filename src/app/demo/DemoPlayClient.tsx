"use client";

import { useCallback, useMemo, useState } from "react";

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
type StepStatus = "pending" | "active" | "complete";

const PRIZE_BY_CURRENCY: Record<string, string> = {
  BTC: "$250",
  ETH: "$15",
  XRP: "$4",
  TRX: "$3",
};

const CAPSULE_GRADIENTS: Record<string, string> = {
  BTC: "linear-gradient(135deg,#F7931A,#ffb347,#ffe29f)",
  ETH: "linear-gradient(135deg,#506bff,#8fa7ff,#dfe8ff)",
  XRP: "linear-gradient(135deg,#1f1f26,#4e5567,#8f97ad)",
  TRX: "linear-gradient(135deg,#ff0038,#ff667d,#ffc7d2)",
  default: "linear-gradient(135deg,#5c5f79,#7c81a4,#b4b9d0)",
};

const CAPSULE_GLOW: Record<string, string> = {
  BTC: "0 0 30px rgba(247,147,26,0.45)",
  ETH: "0 0 30px rgba(98,126,234,0.45)",
  XRP: "0 0 30px rgba(35,41,47,0.45)",
  TRX: "0 0 30px rgba(255,0,19,0.45)",
  default: "0 0 30px rgba(140,140,173,0.4)",
};

const CURRENCY_BADGE_CLASSES: Record<string, string> = {
  BTC: "border-btc text-btc",
  ETH: "border-eth text-eth",
  XRP: "border-xrp text-xrp",
  TRX: "border-trx text-trx",
};

const TOTAL_PATTERNS = 50;

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
  const capsuleKey = playData?.pattern.currency ?? "default";
  const capsuleGradient = CAPSULE_GRADIENTS[capsuleKey];
  const capsuleGlow = CAPSULE_GLOW[capsuleKey];
  const currencyBadgeClass = playData ? CURRENCY_BADGE_CLASSES[playData.pattern.currency] : null;

  const telemetryItems = useMemo(
    () => [
      { label: "Currency lane", value: playData?.pattern.currency ?? "—" },
      { label: "Machine shell", value: playData?.pattern.machineColor ?? "—" },
      {
        label: "Effects",
        value: playData ? `${playData.pattern.effect1} → ${playData.pattern.effect2}` : "—",
      },
      {
        label: "Prize weight",
        value: playData
          ? playData.finalResult
            ? PRIZE_BY_CURRENCY[playData.pattern.currency] ?? `$${playData.prizeAmount}`
            : "$0"
          : "—",
      },
      { label: "RTP governor", value: `${playData?.rtp ?? 90}%` },
      { label: "Capsule ID", value: playData ? `#${playData.pattern.id.toString().padStart(3, "0")}` : "—" },
    ],
    [playData]
  );

  const progressSteps = useMemo(() => {
    const statuses: StepStatus[] = [
      state === "idle" ? "pending" : state === "loading" ? "active" : state === "error" ? "pending" : "complete",
      state === "playing" ? "active" : state === "complete" ? "complete" : "pending",
      state === "complete" ? "complete" : "pending",
    ];

    return [
      {
        title: "Charge capsule",
        description: "Mock credit beams in and selects a BTC/ETH/XRP/TRX lane.",
        status: statuses[0],
      },
      {
        title: "Spin drum",
        description: "Machine shell + effect stack lock while the video reel plays.",
        status: statuses[1],
      },
      {
        title: "Capsule drop",
        description: playData
          ? playData.finalResult
            ? "WIN capsule dispatched. Prize lights are armed."
            : "LOSE capsule recorded. Jackpot meter gets the $1 drip."
          : "Awaiting verdict from the RTP governor.",
        status: statuses[2],
      },
    ];
  }, [state, playData]);

  const capsuleReadout = useMemo(() => {
    if (state === "complete" && playData) {
      return {
        headline: playData.finalResult ? "WIN capsule dispatched" : "LOSE capsule recorded",
        detail: playData.finalResult
          ? `Prize wired: ${PRIZE_BY_CURRENCY[playData.pattern.currency] ?? `$${playData.prizeAmount}`}`
          : "Balance unchanged. Jackpot pool increments by $1.",
        badge: playData.finalResult ? "WIN" : "LOSE",
      };
    }
    if (state === "playing" && playData) {
      return {
        headline: "Reel in progress",
        detail: `${playData.pattern.machineColor} machine · ${playData.pattern.effect1} → ${playData.pattern.effect2}`,
        badge: "SPIN",
      };
    }
    if (state === "loading") {
      return {
        headline: "Scanning pattern library",
        detail: "Aligning capsule lanes with real RTP tables (90%).",
        badge: "SYNC",
      };
    }
    if (state === "error") {
      return {
        headline: "Demo unavailable",
        detail: errorMessage ?? "Network hiccup. Try again in a few seconds.",
        badge: "ERROR",
      };
    }
    return {
      headline: "Idle chamber",
      detail: "Press the lever to inject a mock credit and sample the reel.",
      badge: "IDLE",
    };
  }, [state, playData, errorMessage]);

  const capsuleBadgeTone =
    capsuleReadout.badge === "WIN"
      ? "bg-accent-win/20 text-accent-win"
      : capsuleReadout.badge === "LOSE"
        ? "bg-accent-jackpot/20 text-accent-jackpot"
        : capsuleReadout.badge === "ERROR"
          ? "bg-accent-jackpot/10 text-accent-jackpot"
          : capsuleReadout.badge === "SPIN" || capsuleReadout.badge === "SYNC"
            ? "bg-accent-primary/15 text-accent-primary"
            : "bg-white/10 text-white/70";

  return (
    <div className="rounded-[40px] border border-white/10 bg-[radial-gradient(circle_at_top,#1a0f27_0%,#05030a_55%,#010104_100%)] p-8 shadow-[0_25px_120px_rgba(0,0,0,0.75)]">
      <div className="grid gap-8 lg:grid-cols-[320px,minmax(0,1fr)]">
        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.5em] text-white/60">Capsule meter</p>
            <div className="mt-6 space-y-6">
              {progressSteps.map((step, index) => (
                <div key={step.title} className="flex items-start gap-4">
                  <div
                    className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${
                      step.status === "complete"
                        ? "border-accent-primary bg-accent-primary/10 text-white"
                        : step.status === "active"
                          ? "border-accent-primary text-accent-primary"
                          : "border-white/15 text-white/40"
                    }`}
                  >
                    {step.status === "complete" ? <span className="text-lg">✓</span> : index + 1}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-white/50">{step.title}</p>
                    <p className="mt-1 text-sm text-white/80">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Capsule telemetry</p>
            <dl className="mt-4 space-y-3 text-sm text-white/80">
              {telemetryItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 border-b border-white/5 pb-3 last:border-b-0 last:pb-0">
                  <dt className="text-[0.65rem] uppercase tracking-[0.35em] text-white/40">{item.label}</dt>
                  <dd className="text-base font-semibold text-white">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-3xl border border-dashed border-accent-primary/40 bg-accent-primary/5 p-6 text-sm text-white/80">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Arcade instructions</p>
            <ul className="mt-3 space-y-3">
              <li>1. Pull the neon lever to send 1 mock credit.</li>
              <li>2. Watch the capsule drum showcase a real recorded reel.</li>
              <li>3. Capsule verdict mirrors the live RTP governor (90%).</li>
            </ul>
          </div>
        </aside>

        <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-[#0b0414] via-[#05030b] to-[#010104] p-6">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.5em] text-white/60">
            <span>Capsule chamber</span>
            <span>Demo credits ∞</span>
          </div>

          <div className="mt-6 rounded-[30px] border border-white/10 bg-black/40 p-5">
            <div className="relative aspect-video overflow-hidden rounded-[24px] border border-white/10 bg-[#010103]">
              <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-white/10 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {showVideo ? (
                <GachaVideo
                  src={playData.pattern.videoUrl}
                  onEnded={handleVideoEnded}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-sm text-white/60">
                  <div className="flex gap-2">
                    <span className="h-3 w-3 animate-ping rounded-full bg-accent-primary" />
                    <span className="h-3 w-3 animate-ping rounded-full bg-accent-primary" style={{ animationDelay: "100ms" }} />
                    <span className="h-3 w-3 animate-ping rounded-full bg-accent-primary" style={{ animationDelay: "200ms" }} />
                  </div>
                  <p>{state === "loading" ? "Aligning reels..." : "Pull the lever to preview a reel."}</p>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
              <span className={`inline-flex items-center rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] ${currencyBadgeClass ?? "border-white/30 text-white/70"}`}>
                {playData?.pattern.currency ?? "----"}
              </span>
              <span className="text-white/70">
                Prize window: {playData ? (playData.finalResult ? PRIZE_BY_CURRENCY[playData.pattern.currency] ?? `$${playData.prizeAmount}` : "$0") : "—"}
              </span>
              <span className="text-white/50">RTP {playData?.rtp ?? 90}%</span>
            </div>

            <div className="mt-5 flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4">
              <div
                className="h-16 w-16 rounded-full border border-white/20"
                style={{ backgroundImage: capsuleGradient, boxShadow: capsuleGlow }}
              />
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">Capsule readout</p>
                <p className="text-lg font-semibold text-white">{capsuleReadout.headline}</p>
                <p className="text-sm text-white/60">{capsuleReadout.detail}</p>
              </div>
              <span className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold ${capsuleBadgeTone}`}>
                {capsuleReadout.badge}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 lg:flex-row">
            <button
              type="button"
              onClick={startDemoPlay}
              disabled={state === "loading" || state === "playing"}
              className="group inline-flex flex-1 items-center justify-center gap-3 rounded-full bg-accent-primary px-6 py-4 text-base font-semibold text-black shadow-glow transition hover:bg-[#00d670] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/50"
            >
              <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-black/20">
                <span className="h-4 w-1 rounded-full bg-black" />
                <span className="absolute bottom-1 h-3 w-3 rounded-full bg-black/40" />
              </span>
              {state === "loading" ? "Charging capsule..." : state === "playing" ? "Reel in progress" : "Pull neon lever"}
            </button>
            {playData && (
              <button
                type="button"
                onClick={startDemoPlay}
                disabled={state === "loading" || state === "playing"}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-white/30 px-6 py-4 text-base font-semibold text-white transition hover:border-white/70 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/40"
              >
                Run another spin
              </button>
            )}
          </div>
          {errorMessage && state === "error" && (
            <p className="mt-3 text-sm text-accent-jackpot">{errorMessage}</p>
          )}
        </section>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Capsule library",
            body: `${TOTAL_PATTERNS} recorded reels spanning BTC/ETH/XRP/TRX machines. Each pull is authentic footage.`,
          },
          {
            title: "RTP governor",
            body: `${playData?.rtp ?? 90}% real-time return profile identically matches the production brain.`,
          },
          {
            title: "Wallet safe",
            body: "Demo uses synthetic credits only. For payouts, authenticate and head to /play.",
          },
        ].map((card) => (
          <div key={card.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">{card.title}</p>
            <p className="mt-2 text-white/80">{card.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
