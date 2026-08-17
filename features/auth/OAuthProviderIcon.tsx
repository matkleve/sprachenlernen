import { cn } from "@/lib/utils";

type OAuthProviderIconProps = {
  className?: string;
};

/** Monochrome Apple mark — `currentColor` tracks `text-ink` in light and dark. */
export function AppleIcon({ className }: OAuthProviderIconProps) {
  return (
    <svg className={cn("size-5", className)} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M17.05 20.28c-.98.95-2.05.88-3.08.04-1.09-.86-2.08-.88-3.24 0-1.44 1.07-2.22.89-3.06-.04-1.78-1.73-3.04-4.89-1.26-9.29 1.03-2.5 2.87-4.18 4.9-4.22 1.21-.02 2.35.87 3.08.87.71 0 2.05-1.08 3.46-.92.59.02 2.24.24 3.3 1.82-2.89 1.77-2.42 5.69.91 6.86-.56 1.47-1.35 2.93-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.74-3.74 4.25z"
      />
    </svg>
  );
}

/** Google "G" — official palette; multicolor mark cannot use design tokens. */
export function GoogleIcon({ className }: OAuthProviderIconProps) {
  return (
    <svg className={cn("size-5", className)} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4" // token-check-ignore — Google brand mark
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853" // token-check-ignore — Google brand mark
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05" // token-check-ignore — Google brand mark
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335" // token-check-ignore — Google brand mark
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
