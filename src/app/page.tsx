import Image from "next/image";
import Link from "next/link";

import { JackpotCounter } from "@/components/JackpotCounter";
import { PlayButton } from "@/components/PlayButton";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const HERO_IMAGES = [
  {
    src: "/hero/hp_eth_silver_v2.png",
    alt: "Futuristic silver gacha machine",
  },
  {
    src: "/hero/hp_btc_gold.png",
    alt: "Gold BTC jackpot machine",
  },
];

const SPEC_URL =
  "https://github.com/jinjinsansan/gacha/blob/main/GACHAGACHA_SPEC.md";

async function getJackpotAmount() {
  try {
    const supabase = getSupabaseAdminClient();
    const { data } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "jackpot_pool")
      .maybeSingle();

    const parsed = Number(data?.value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch (error) {
    console.error("Unable to load jackpot pool", error);
    return 0;
  }
}

export default async function Home() {
  const supabase = createSupabaseServerClient();
  const [
    {
      data: { user },
    },
    jackpotAmount,
  ] = await Promise.all([supabase.auth.getUser(), getJackpotAmount()]);

  const heroImage = HERO_IMAGES[0];
  const accentImage = HERO_IMAGES[1];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040308] text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,255,136,0.18),_transparent_60%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-48 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[#9945FF]/20 blur-[140px]"
        aria-hidden
      />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-20 lg:flex-row lg:items-center lg:px-10">
        <section className="flex-1 space-y-8">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.6em] text-white/70">
              Crypto Gacha Arcade
            </p>
            <h1 className="text-5xl font-black leading-tight text-white sm:text-6xl">
              GACHAGACHA
            </h1>
            <p className="max-w-xl text-lg text-white/70">
              $10 USDT per pull. 50 cinematic reels. BTC / ETH / XRP / TRX prizes
              tuned by a live RTP engine. Step into the neon vault.
            </p>
          </div>

          <JackpotCounter initialAmount={jackpotAmount} />

          <div className="flex flex-col gap-4 pt-4 sm:flex-row">
            <PlayButton isAuthenticated={Boolean(user)} />
            <Link
              href={SPEC_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-10 py-4 text-base font-semibold text-white/80 transition hover:border-accent-secondary hover:text-white"
            >
              View Probability Table
            </Link>
          </div>

          <div className="mt-8 grid gap-4 text-sm text-white/65 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                RTP Range
              </p>
              <p className="mt-2 text-xl font-semibold">50% – 99%</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                Video Reels
              </p>
              <p className="mt-2 text-xl font-semibold">50 Patterns</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                Prize Tiers
              </p>
              <p className="mt-2 text-xl font-semibold">BTC · ETH · XRP · TRX</p>
            </div>
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center">
          <div className="relative w-full max-w-[440px]">
            <div className="absolute -top-8 -right-10 h-20 w-20 rounded-full border border-accent-primary/40" aria-hidden />
            <div className="absolute bottom-4 -left-6 h-16 w-16 rounded-full border border-accent-secondary/30" aria-hidden />
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[40px] border border-white/15 bg-gradient-to-br from-white/10 via-white/5 to-white/0 p-4 shadow-[0_0_80px_rgba(0,0,0,0.45)] backdrop-blur">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,255,136,0.15),_transparent_70%)]" aria-hidden />
              <div className="relative flex h-full w-full items-center justify-center">
                <Image
                  src={heroImage.src}
                  alt={heroImage.alt}
                  fill
                  priority
                  sizes="(max-width: 768px) 90vw, 420px"
                  className="object-contain drop-shadow-[0_10px_40px_rgba(0,0,0,0.45)]"
                />
              </div>
              <div className="pointer-events-none absolute bottom-6 left-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
                Live Video Reels
              </div>
            </div>
            <div className="relative -mt-6 ml-auto w-40 rounded-3xl border border-white/15 bg-white/10 p-4 text-xs text-white/85 shadow-glow">
              <p className="uppercase tracking-[0.4em] text-white/60">Legendary</p>
              <p className="mt-3 text-base font-semibold text-accent-win">BTC $250</p>
              <Image
                src={accentImage.src}
                alt={accentImage.alt}
                width={120}
                height={120}
                className="mt-2 object-contain"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
