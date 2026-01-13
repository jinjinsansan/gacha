"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ResultWinActionsProps = {
  playId: string;
  prizeAmount: number;
};

export function ResultWinActions({ playId, prizeAmount }: ResultWinActionsProps) {
  const router = useRouter();
  const [wallet, setWallet] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!wallet.trim()) {
      setMessage("Enter a wallet address");
      setStatus("error");
      return;
    }

    setStatus("pending");
    setMessage(null);

    try {
      const response = await fetch("/api/user/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playId, walletAddress: wallet }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to submit withdrawal");
      }
      setStatus("success");
      setMessage("Withdrawal request submitted. We'll notify you when processed.");
      setWallet("");
      router.refresh();
    } catch (error) {
      console.error("Withdraw error", error);
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not submit withdrawal.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-white/15 bg-white/5 p-6">
      <p className="text-xs uppercase tracking-[0.4em] text-white/60">Claim Prize</p>
      <p className="text-sm text-white/70">
        Enter your ERC-20 compatible wallet for USDT payout (${prizeAmount.toFixed(2)}).
      </p>
      <input
        type="text"
        value={wallet}
        onChange={(event) => setWallet(event.target.value)}
        placeholder="0x..."
        className="w-full rounded-2xl border border-white/20 bg-black/40 px-4 py-3 text-sm text-white focus:border-accent-primary focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "pending"}
        className="inline-flex w-full items-center justify-center rounded-full bg-accent-primary px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#00d670] disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/60"
      >
        {status === "pending" ? "Submitting..." : "Submit Withdrawal"}
      </button>
      {message && (
        <p className={`text-sm ${status === "error" ? "text-accent-jackpot" : "text-accent-primary"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
