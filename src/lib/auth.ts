'use server';

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const getSiteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type SignInInput = string | FormData | undefined;

export const signInWithGoogle = async (input?: SignInInput) => {
  let redirectPath = "/play";

  if (input instanceof FormData) {
    redirectPath = input.get("redirectPath")?.toString() ?? "/play";
  } else if (typeof input === "string") {
    redirectPath = input;
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data?.url) {
    redirect(data.url);
  }
};

export const signOut = async () => {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
};
