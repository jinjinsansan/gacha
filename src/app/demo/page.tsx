import Link from "next/link";

import { DemoPlayClient } from "./DemoPlayClient";

export const metadata = {
  title: "GACHAGACHA Demo",
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#030208] px-6 py-16 text-white sm:px-10">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="space-y-3 text-center sm:text-left">
          <p className="text-xs uppercase tracking-[0.6em] text-white/60">Interactive Demo</p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">Spin without logging in</h1>
          <p className="text-white/70">
            This sandbox showcases the real video assets, RTP logic, and win/lose cadence. It uses mock
            credits only, so wallets and deposits are not involved. Log in later to play for real prizes.
          </p>
        </div>

        <DemoPlayClient />

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">Next steps</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Ready for the real arcade? Authenticate with Google on the home page and head to /play.</li>
            <li>
              Want to inspect probability tables?
              <Link href="/" className="ml-1 underline decoration-dotted hover:text-white">
                View the specification from the hero section.
              </Link>
            </li>
            <li>Need to share the experience? Send this link to teammates—no wallet required.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
