import Link from "next/link";

import { buttonVariants } from "@/components/ui/Button";
import { copy } from "@/features/review-session/content";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type SessionCompleteProps = {
  gradedCount: number;
};

export function SessionComplete({ gradedCount }: SessionCompleteProps) {
  return (
    <div className="mt-page-content">
      <h2 className="text-xl font-semibold text-ink">{copy.completeTitle}</h2>
      <p className="mt-4 text-base text-muted">
        {gradedCount > 0 ? copy.completeBody(gradedCount) : copy.emptySession}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={routes.words} className={cn(buttonVariants({ variant: "primary" }))}>
          {copy.backToWords}
        </Link>
        <Link href={routes.methods} className={cn(buttonVariants({ variant: "secondary" }))}>
          {copy.backToMethods}
        </Link>
      </div>
    </div>
  );
}
