// Legacy English copy — use next-intl messages instead. Kept for reference during migration.

/** Copy for signup and sign-in. Contract: docs/specs/service/auth.md */
export const authContent = {
  emailLabel: "Email",
  passwordLabel: "Password",
  passwordHint: "At least 6 characters.",
  signUp: {
    heading: "Create your account",
    submit: "Create account",
    confirmationSent: "Check your email for a confirmation link, then come back and sign in.",
    switchPrompt: "Already have an account?",
    switchLinkLabel: "Sign in",
  },
  signIn: {
    heading: "Sign in",
    submit: "Sign in",
    switchPrompt: "Don't have an account?",
    switchLinkLabel: "Create one",
  },
  oauthDivider: "or continue with",
  oauthGoogle: "Google",
  oauthApple: "Apple",
} as const;
