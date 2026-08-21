/**
 * Security response headers for every route. Decision and trade-offs:
 * docs/adr/0013-security-response-headers.md
 *
 * Framework-free on purpose — `next.config.ts` imports it, and that file is
 * evaluated by Next's own loader before any alias or runtime exists. It is
 * also what makes the policy testable, which a literal inside the config
 * would not be.
 */

export type SecurityHeader = { key: string; value: string };

export type SecurityHeaderInput = {
  isProduction: boolean;
  /** `NEXT_PUBLIC_SUPABASE_URL`. Absent on a preview wired before its secrets. */
  supabaseUrl?: string;
};

/**
 * The app loads no external script, style, font or image — `next/font/google`
 * self-hosts at build time and the only runtime fetch is same-origin
 * (`/api/app-version`). That is what makes `default-src 'self'` a description
 * of the app rather than an aspiration, and it is the condition under which a
 * CSP can go on without re-checking every surface in a browser first.
 */
export function contentSecurityPolicy(input: SecurityHeaderInput): string {
  const { isProduction, supabaseUrl } = input;

  return [
    "default-src 'self'",
    // Not optional: the App Router streams hydration and Flight payloads as
    // inline <script> tags. Dropping it needs per-request nonces threaded
    // through middleware — a change of its own, not a line here. The policy
    // still blocks the commoner exfiltration shape: an injected `<script src>`
    // or a `fetch` to a foreign origin.
    `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    // Exercise audio is speechSynthesis (no network) plus local blobs; the
    // account-data export builds a blob: URL to hand the learner their JSON.
    "media-src 'self' data: blob:",
    ["connect-src 'self'", supabaseUrl, isProduction ? "" : "ws: wss:"]
      .filter(Boolean)
      .join(" "),
    "object-src 'none'",
    "base-uri 'self'",
    // Nothing embeds this app. Clickjacking the delete-account confirmation is
    // the concrete reason this line exists.
    "frame-ancestors 'none'",
    ...(isProduction ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

export function securityHeaders(input: SecurityHeaderInput): SecurityHeader[] {
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy(input) },
    // For the browsers that honour the header but not frame-ancestors.
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    // No feature asks for any of these. speechSynthesis is output only and
    // needs no microphone grant — checked before this line was written.
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=()",
    },
    // Preload-eligible, and only in production: sending HSTS from a local
    // http://localhost dev server pins the browser to https for localhost and
    // breaks every other local project on that port.
    ...(input.isProduction
      ? [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ]
      : []),
  ];
}
