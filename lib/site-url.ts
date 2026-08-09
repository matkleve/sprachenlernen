/**
 * The origin this deployment considers itself. Used for auth email links —
 * Supabase falls back to the project Site URL when this is missing, which is
 * how confirmation mails end up pointing at localhost in production.
 *
 * Set `NEXT_PUBLIC_SITE_URL` explicitly in Vercel (Production + Preview).
 * `VERCEL_URL` is a server-only fallback for previews that have not been set
 * yet; it is never correct for local dev, where localhost is intentional.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;

  const vercel = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}
