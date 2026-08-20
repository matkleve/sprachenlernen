import { describe, expect, it } from "vitest";

import {
  contentSecurityPolicy,
  securityHeaders,
  type SecurityHeaderInput,
} from "@/lib/security-headers";

/** Contract: docs/adr/0013-security-response-headers.md */

const prod: SecurityHeaderInput = {
  isProduction: true,
  supabaseUrl: "https://abc.supabase.co",
};
const dev: SecurityHeaderInput = { isProduction: false };

const valueOf = (input: SecurityHeaderInput, key: string) =>
  securityHeaders(input).find((header) => header.key === key)?.value;

describe("contentSecurityPolicy", () => {
  it("refuses to be framed — the clickjacking guard on delete-account", () => {
    expect(contentSecurityPolicy(prod)).toContain("frame-ancestors 'none'");
    expect(valueOf(prod, "X-Frame-Options")).toBe("DENY");
  });

  it("defaults to same-origin and forbids plugins and base-tag rewriting", () => {
    const csp = contentSecurityPolicy(prod);
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
  });

  it("lets the browser reach Supabase and nothing else it was not told about", () => {
    expect(contentSecurityPolicy(prod)).toContain(
      "connect-src 'self' https://abc.supabase.co",
    );
  });

  it("omits the Supabase origin when the env is unset, rather than emitting an empty token", () => {
    const csp = contentSecurityPolicy({ isProduction: true });
    expect(csp).toContain("connect-src 'self';");
    expect(csp).not.toMatch(/connect-src 'self' {2}/);
  });

  it("allows eval and websockets in development only — React Refresh needs both", () => {
    expect(contentSecurityPolicy(dev)).toContain("'unsafe-eval'");
    expect(contentSecurityPolicy(dev)).toContain("ws: wss:");
    expect(contentSecurityPolicy(prod)).not.toContain("'unsafe-eval'");
    expect(contentSecurityPolicy(prod)).not.toContain("ws: wss:");
  });

  it("upgrades insecure requests in production only", () => {
    expect(contentSecurityPolicy(prod)).toContain("upgrade-insecure-requests");
    expect(contentSecurityPolicy(dev)).not.toContain("upgrade-insecure-requests");
  });

  it("does not set form-action — OAuth redirects would break (ADR-0013)", () => {
    expect(contentSecurityPolicy(prod)).not.toContain("form-action");
  });
});

describe("securityHeaders", () => {
  it("sends HSTS in production only, so localhost is never pinned to https", () => {
    expect(valueOf(prod, "Strict-Transport-Security")).toContain("max-age=63072000");
    expect(valueOf(dev, "Strict-Transport-Security")).toBeUndefined();
  });

  it("sets nosniff, a referrer policy, and denies the sensor permissions", () => {
    expect(valueOf(prod, "X-Content-Type-Options")).toBe("nosniff");
    expect(valueOf(prod, "Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(valueOf(prod, "Permissions-Policy")).toContain("microphone=()");
  });
});
