'use server';

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const getSiteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const signInWithGoogle = async (redirectPath: string = "/play") => {
  const supabase = createSupabaseServerClient();

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
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
};
