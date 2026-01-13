import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types";

let adminClient: SupabaseClient<Database> | undefined;

const getSupabaseAdminConfig = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase admin environment variables.");
  }

  return { supabaseUrl, serviceRoleKey } as const;
};

export const getSupabaseAdminClient = () => {
  if (!adminClient) {
    const { supabaseUrl, serviceRoleKey } = getSupabaseAdminConfig();
    adminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
};
