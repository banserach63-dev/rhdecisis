import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Note: the Supabase generic Database type is intentionally not passed here.
// This schema's typed postgrest generics (Relationships metadata, strict
// insert/update payload checks) don't play well with embedded (`select`)
// queries used throughout this app; domain types from lib/database.types.ts
// are instead applied manually at each call site.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component: safe to ignore because the
            // proxy already refreshes the session on every request.
          }
        },
      },
    }
  );
}
