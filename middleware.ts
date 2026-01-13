import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "./src/types";

const PROTECTED_PREFIXES = ["/play", "/admin"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Parameters<typeof res.cookies.set>[0] = {}) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: Parameters<typeof res.cookies.set>[0] = {}) {
          res.cookies.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;
  const requiresAuth = PROTECTED_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!session && requiresAuth) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (session && pathname.startsWith("/admin")) {
    const { data: adminRecord, error } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (error) {
      console.error("Failed to verify admin role", error.message);
    }

    if (!adminRecord) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/play";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: ["/play/:path*", "/admin/:path*"],
};
