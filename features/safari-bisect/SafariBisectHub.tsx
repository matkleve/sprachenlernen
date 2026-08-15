import { InsetReadout } from "@/features/safari-bisect/InsetReadout";
import { copy } from "@/features/safari-bisect/content";
import { bisectLevelHref } from "@/lib/safari-bisect";
import { routes } from "@/lib/routes";

import { SafariBisectHubNav } from "./SafariBisectHubNav";

/**
 * Hub for Safari / PWA bisect — inset readout + body bisect + navigation A/B.
 */
export function SafariBisectHub() {
  return (
    <>
      <div className="border-b border-line bg-accent-soft px-4 py-3 text-center text-xs leading-relaxed text-muted">
        <p className="font-medium text-ink">{copy.hubTitle}</p>
        <InsetReadout />
      </div>
      <SafariBisectHubNav
        bisectWordsHref={bisectLevelHref(routes.wordsBisect, 0)}
        bisectProgressHref={bisectLevelHref(routes.progressBisect, 0)}
      />
    </>
  );
}
