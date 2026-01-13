"use client";

import Image from "next/image";
import { useState } from "react";

type DepositQRProps = {
  address: string;
  amountLabel?: string;
};

export function DepositQR({ address, amountLabel = "$10 USDT" }: DepositQRProps) {
  const [copied, setCopied] = useState(false);
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    address
  )}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      console.error("Failed to copy address", error);
    }
  };

  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-center shadow-glow">
      <p className="text-xs uppercase tracking-[0.4em] text-white/60">Send</p>
      <p className="text-lg font-semibold text-white">{amountLabel}</p>
      <div className="mx-auto mt-4 w-40 rounded-2xl border border-white/20 bg-black/40 p-3">
        <Image
          src={qrSrc}
          alt="USDT deposit QR"
          width={200}
          height={200}
          className="h-auto w-full rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">Deposit Address</p>
        <code className="block truncate rounded-xl bg-black/50 px-4 py-2 text-sm text-accent-primary">
          {address}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex w-full items-center justify-center rounded-full border border-accent-primary/30 px-4 py-2 text-sm font-medium text-accent-primary transition hover:bg-accent-primary/10"
        >
          {copied ? "Copied!" : "Copy Address"}
        </button>
      </div>
    </div>
  );
}
