"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { DepositQR } from "@/components/DepositQR";

type PlayPortalProps = {
  depositAddress: string;
  initialBalance: number;
  email?: string;
};

type Phase = "deposit" | "waiting" | "ready";

const PLAY_COST = 1;

export function PlayPortal({ depositAddress, initialBalance, email }: PlayPortalProps) {
  const router = useRouter();
  const [balance, setBalance] = useState(initialBalance);
  const [phase, setPhase] = useState<Phase>(initialBalance >= PLAY_COST ? "ready" : "deposit");
  const [isPolling, setIsPolling] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const [codeInput, setCodeInput] = useState("");
  const [codeStatus, setCodeStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [codeMessage, setCodeMessage] = useState<string | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const fetchBalance = useCallback(async () => {
    try {
      const response = await fetch("/api/user/balance", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to fetch balance");
      const data = await response.json();
      const nextBalance = Number(data.balance ?? 0);
      if (!Number.isNaN(nextBalance)) {
        setBalance(nextBalance);
        if (nextBalance >= PLAY_COST) {
          setPhase("ready");
          setIsPolling(false);
          stopPolling();
          return true;
        }
      }
    } catch (error) {
      console.error("Balance refresh failed", error);
      setBalanceError("Could not refresh balance. Please try again shortly.");
    }
    return false;
  }, [stopPolling]);

  const handleCheckPayment = useCallback(async () => {
    setBalanceError(null);
    setPhase((prev) => (prev === "ready" ? "ready" : "waiting"));
    setIsPolling(true);
    stopPolling();

    const completed = await fetchBalance();
    if (completed) {
      return;
    }

    pollRef.current = setInterval(fetchBalance, 10000);
  }, [fetchBalance, stopPolling]);

  const handleRedeemCode = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!codeInput.trim()) {
        setCodeMessage("Enter a campaign code first.");
        setCodeStatus("error");
        return;
      }

      setCodeStatus("pending");
      setCodeMessage(null);

      try {
        const response = await fetch("/api/user/redeem-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: codeInput }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to redeem code");
        }

        const updatedBalance = Number(data.balance ?? 0);
        setBalance(updatedBalance);
        if (updatedBalance >= PLAY_COST) {
          setPhase("ready");
        }
        setCodeStatus("success");
        setCodeMessage(`Added ${data.playsGranted ?? "bonus"} play(s) to your balance.`);
        setCodeInput("");
      } catch (error) {
        console.error("Redeem code error", error);
        setCodeStatus("error");
        setCodeMessage(error instanceof Error ? error.message : "Failed to redeem code.");
      }
    },
    [codeInput]
  );

  const statusCopy = {
    deposit: {
      title: "Send $10 USDT",
      description: "Scan the QR code or copy the address below to load one play.",
    },
    waiting: {
      title: "Confirming on-chain",
      description: "We refresh every 10 seconds. You can stay on this screen while we detect your payment.",
    },
    ready: {
      title: "Deposit confirmed",
      description: "Your balance is ready. Hit START to enter the gacha chamber.",
    },
  }[phase];

  return (
    <div className="grid gap-8 lg:grid-cols-[360px,1fr]">
      <div className="space-y-6">
        <DepositQR address={depositAddress} amountLabel="$10 USDT" />

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">Campaign Code</p>
          <p className="mt-2 text-sm text-white/70">Redeem bonus plays from promotions.</p>
          <form onSubmit={handleRedeemCode} className="mt-4 space-y-3">
            <input
              type="text"
              value={codeInput}
              onChange={(event) => setCodeInput(event.target.value.toUpperCase())}
              placeholder="ENTER CODE"
              className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm uppercase tracking-[0.2em] text-white focus:border-accent-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={codeStatus === "pending"}
              className="inline-flex w-full items-center justify-center rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-black transition hover:bg-white disabled:cursor-not-allowed disabled:bg-white/40"
            >
              {codeStatus === "pending" ? "Redeeming..." : "Redeem"}
            </button>
            {codeMessage && (
              <p
                className={`text-xs ${codeStatus === "error" ? "text-accent-jackpot" : "text-accent-primary"}`}
              >
                {codeMessage}
              </p>
            )}
          </form>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 shadow-[0_0_60px_rgba(0,0,0,0.45)]">
          <p className="text-xs uppercase tracking-[0.5em] text-white/60">Play Status</p>
          <h2 className="mt-3 text-3xl font-black text-white">{statusCopy.title}</h2>
          <p className="mt-2 text-white/70">{statusCopy.description}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">Balance</p>
              <p className="mt-2 text-3xl font-semibold text-accent-primary">{balance.toFixed(2)}</p>
              <p className="text-xs text-white/50">Each play consumes 1.00</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">Account</p>
              <p className="mt-2 truncate text-sm text-white/80">{email ?? "Supabase User"}</p>
              <p className="text-xs text-white/50">USDT | ERC-20</p>
            </div>
          </div>

          {balanceError && (
            <p className="mt-3 text-sm text-accent-jackpot">{balanceError}</p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={phase === "ready"}
              onClick={handleCheckPayment}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/60 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/40"
            >
              {phase === "ready" ? "Deposit confirmed" : isPolling ? "Checking..." : "Check Payment"}
            </button>
            <button
              type="button"
              disabled={phase !== "ready"}
              onClick={() => router.push("/play/start")}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-accent-primary px-5 py-3 text-sm font-semibold text-black shadow-glow transition hover:bg-[#00d670] disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/60"
            >
              Start Gacha
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Send $10",
              body: "Use the QR or copy the address. Only ERC-20 USDT is accepted.",
            },
            {
              title: "Wait for 1 conf",
              body: "We monitor Ethereum mainnet and update as soon as your tx finalizes.",
            },
            {
              title: "Start the reel",
              body: "Once confirmed, the START button glows neon. Smash it to roll.",
            },
          ].map((card) => (
            <div key={card.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">{card.title}</p>
              <p className="mt-2 text-white/80">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
