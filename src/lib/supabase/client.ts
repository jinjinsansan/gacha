import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types";

let browserClient: SupabaseClient<Database> | undefined;

const getSupabaseBrowserConfig = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase browser environment variables.");
  }

  return { supabaseUrl, supabaseAnonKey } as const;
};

export const getSupabaseBrowserClient = () => {
  if (!browserClient) {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseBrowserConfig();
    browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey) as unknown as SupabaseClient<Database>;
  }

  return browserClient;
};
