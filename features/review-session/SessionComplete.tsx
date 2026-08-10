import { ActionLink } from "@/components/ui/ActionLink";
import { copy } from "@/features/review-session/content";
import { routes } from "@/lib/routes";

type SessionCompleteProps = {
  gradedCount: number;
  pendingCount: number;
};

export function SessionComplete({ gradedCount, pendingCount }: SessionCompleteProps) {
  return (
    <div className="mt-page-content">
      <h2 className="text-xl font-semibold text-ink">{copy.completeTitle}</h2>
      <p className="mt-4 text-base text-muted">
        {gradedCount > 0 ? copy.completeBody(gradedCount) : copy.emptySession}
      </p>
      {pendingCount > 0 ? (
        <p className="mt-4 text-sm text-muted" aria-live="polite">
          {copy.syncing(pendingCount)}
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-3">
        <ActionLink href={routes.words} variant="primary">
          {copy.backToWords}
        </ActionLink>
        <ActionLink href={routes.methods} variant="secondary">
          {copy.backToMethods}
        </ActionLink>
      </div>
    </div>
  );
}
