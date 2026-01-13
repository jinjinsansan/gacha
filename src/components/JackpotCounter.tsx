"use client";

import { useEffect, useRef, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type JackpotCounterProps = {
  initialAmount: number;
};

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function JackpotCounter({ initialAmount }: JackpotCounterProps) {
  const [targetAmount, setTargetAmount] = useState(initialAmount);
  const [displayAmount, setDisplayAmount] = useState(initialAmount);
  const displayRef = useRef(initialAmount);

  useEffect(() => {
    setTargetAmount(initialAmount);
    setDisplayAmount(initialAmount);
    displayRef.current = initialAmount;
  }, [initialAmount]);

  useEffect(() => {
    async function refreshLatest() {
      try {
        const response = await fetch("/api/jackpot", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to fetch jackpot amount");
        }
        const data = await response.json();
        if (typeof data.amount === "number") {
          setTargetAmount(data.amount);
        }
      } catch (error) {
        console.error("Jackpot counter refresh failed", error);
      }
    }

    refreshLatest();
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel("jackpot-counter")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "system_settings",
          filter: "key=eq.jackpot_pool",
        },
        (payload) => {
          const value = Number((payload.new as { value?: string })?.value ?? 0);
          if (!Number.isNaN(value)) {
            setTargetAmount(value);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const startValue = displayRef.current;
    const diff = targetAmount - startValue;
    if (diff === 0) {
      return;
    }

    const steps = 30;
    const interval = 28;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep += 1;
      if (currentStep >= steps) {
        setDisplayAmount(targetAmount);
        displayRef.current = targetAmount;
        clearInterval(timer);
        return;
      }

      const nextValue = startValue + (diff * currentStep) / steps;
      displayRef.current = nextValue;
      setDisplayAmount(nextValue);
    }, interval);

    return () => {
      clearInterval(timer);
    };
  }, [targetAmount]);

  return (
    <section
      className="w-full rounded-[32px] border border-white/10 bg-white/5 px-6 py-5 shadow-glow backdrop-blur"
      aria-live="polite"
    >
      <p className="text-[0.65rem] uppercase tracking-[0.5em] text-white/60">
        Jackpot Pool
      </p>
      <div className="mt-3 flex items-baseline gap-3">
        <span className="text-4xl font-black text-accent-jackpot">
          {formatter.format(displayAmount)}
        </span>
        <span className="text-sm text-white/60">USDT</span>
      </div>
      <p className="mt-2 text-xs text-white/55">
        $1 enters every play. Updates in real-time across the arcade.
      </p>
    </section>
  );
}
