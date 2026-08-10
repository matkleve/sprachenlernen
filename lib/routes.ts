/**
 * The route model of ADR-0010, in one place.
 *
 * These are addresses, not copy — they exist here rather than as literals
 * because "where signing in lands" is a decision three files act on, and three
 * literals is how the address in one of them silently stops matching the ADR.
 * The names say the role, so a future move is an edit here rather than a grep.
 */
export const routes = {
  /** Public. The landing page; its argument is T-B7. */
  landing: "/",
  /** Public. What the app claims per shipped language, and why. */
  languages: "/languages",
  signIn: "/login",
  signUp: "/signup",
  /** Where Supabase sends users after they confirm email. */
  authCallback: "/auth/callback",
  /** Public. Retired — redirects to /languages (T-B5). */
  primitives: "/primitives",
  /** Public. Design-direction comparison — dev tooling, no account. */
  designExplorer: "/dev/design",
  privacy: "/privacy",

  /** The app's default route — signing in lands here (ADR-0010). */
  appHome: "/methods",
  /** The three destinations of ADR-0009, in the order they are shown. */
  methods: "/methods",
  method: (id: string) => `/methods/${id}`,
  words: "/words",
  wordsReview: "/words/review",
  progress: "/progress",
  account: "/account",
} as const;

/**
 * The public half of the site — everything in `app/(marketing)/`. The gate is
 * inverted on purpose: anything not listed here requires an account, so a page
 * added under `app/(app)/` is protected even when nobody remembered to extend a
 * hand-maintained allowlist. The shell still shows exactly three destinations;
 * that list is `protectedRoutes`, not this one.
 */
export const publicRoutes = [
  routes.landing,
  routes.languages,
  routes.signIn,
  routes.signUp,
  routes.authCallback,
  routes.primitives,
  routes.designExplorer,
  routes.privacy,
] as const;

/** The three destinations the shell renders — a subset of the gated half. */
export const protectedRoutes = [routes.methods, routes.words, routes.progress] as const;

export function isPublicRoute(pathname: string): boolean {
  // Everything under app/(marketing)/dev/ is tooling — same rule as /primitives.
  if (pathname.startsWith("/dev/")) return true;
  return publicRoutes.some((route) => pathname === route);
}

/** Whether a pathname is inside the signed-in half. `/words/atlas` is. */
export function requiresAccount(pathname: string): boolean {
  return !isPublicRoute(pathname);
}
