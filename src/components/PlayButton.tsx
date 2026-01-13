import Link from "next/link";

import { signInWithGoogle } from "@/lib/auth";

type PlayButtonProps = {
  isAuthenticated: boolean;
};

export function PlayButton({ isAuthenticated }: PlayButtonProps) {
  if (isAuthenticated) {
    return (
      <Link
        href="/play"
        className="group inline-flex items-center justify-center rounded-full bg-accent-primary px-10 py-4 text-base font-semibold text-black shadow-glow transition hover:bg-[#00d670]"
      >
        Start Playing
        <span className="ml-2 text-lg transition group-hover:translate-x-1">→</span>
      </Link>
    );
  }

  return (
    <form action={signInWithGoogle} className="inline-flex">
      <input type="hidden" name="redirectPath" value="/play" />
      <button
        type="submit"
        className="group inline-flex items-center justify-center rounded-full bg-accent-primary px-10 py-4 text-base font-semibold text-black shadow-glow transition hover:bg-[#00d670]"
      >
        Play with Google
        <span className="ml-2 text-lg transition group-hover:translate-x-1">→</span>
      </button>
    </form>
  );
}
