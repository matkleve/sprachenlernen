import { SubmitButton } from "@/components/ui/SubmitButton";
import { signInWithOAuthAction } from "@/features/auth/actions";
import { authContent } from "@/features/auth/content";

const providers = [
  { id: "google" as const, label: authContent.oauthGoogle },
  { id: "apple" as const, label: authContent.oauthApple },
];

/** OAuth entry points — contract: docs/specs/service/auth.md */
export function OAuthButtons() {
  return (
    <div className="mt-6">
      <p className="text-center text-sm text-muted">{authContent.oauthDivider}</p>
      <div className="mt-3 flex flex-col gap-2">
        {providers.map((provider) => (
          <form key={provider.id} action={signInWithOAuthAction}>
            <input type="hidden" name="provider" value={provider.id} />
            <SubmitButton variant="secondary" className="w-full">
              {provider.label}
            </SubmitButton>
          </form>
        ))}
      </div>
    </div>
  );
}
