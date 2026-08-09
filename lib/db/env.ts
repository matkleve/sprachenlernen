/**
 * Supabase connection settings read from the environment. Shared by
 * `middleware.ts` and `lib/db/client.ts` — neither should duplicate the
 * names or the error text.
 *
 * Middleware runs on the Edge runtime and cannot import `next/headers`, so
 * this file must stay framework-free.
 */
export type SupabaseEnv = {
  url: string;
  publishableKey: string;
};

export function readSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return null;
  return { url, publishableKey };
}

/** For server code that cannot run without a configured project. */
export function requireSupabaseEnv(): SupabaseEnv {
  const env = readSupabaseEnv();
  if (!env) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be set — see .env.example",
    );
  }
  return env;
}
