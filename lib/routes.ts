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

  /** The app's default route — signing in lands here (ADR-0010). */
  appHome: "/methods",
  /** The three destinations of ADR-0009, in the order they are shown. */
  methods: "/methods",
  words: "/words",
  progress: "/progress",
} as const;

/**
 * Everything in the app/(app)/ route group — the routes ADR-0006 puts behind
 * an account. Adding a destination means adding it here, and the middleware
 * test asserts this list and the three destinations stay the same set.
 */
export const protectedRoutes = [routes.methods, routes.words, routes.progress] as const;

/** Whether a pathname is inside the signed-in half. `/words/atlas` is. */
export function requiresAccount(pathname: string): boolean {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
