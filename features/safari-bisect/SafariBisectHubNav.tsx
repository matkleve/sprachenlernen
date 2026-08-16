import { TextLink } from "@/components/ui/TextLink";
import { ShellPageContent } from "@/features/app-shell/ShellPageContent";
import { copy } from "@/features/safari-bisect/content";
import { routes } from "@/lib/routes";

type SafariBisectHubNavProps = {
  bisectWordsHref: string;
  bisectProgressHref: string;
};

/**
 * Hub body: bisect entry + direct-route navigation A/B (study/31).
 */
export function SafariBisectHubNav({ bisectWordsHref, bisectProgressHref }: SafariBisectHubNavProps) {
  return (
    <ShellPageContent width="wide">
      <h1 className="text-2xl font-semibold text-ink">{copy.hubTitle}</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{copy.hubIntro}</p>

      <section className="mt-page-content">
        <h2 className="text-lg font-semibold text-ink">{copy.hubBisectHeading}</h2>
        <ul className="mt-4 space-y-3 text-base">
          <li>
            <TextLink href={bisectWordsHref}>{copy.hubWords} — level 0</TextLink>
          </li>
          <li>
            <TextLink href={bisectProgressHref}>{copy.hubProgress} — level 0</TextLink>
          </li>
        </ul>
      </section>

      <section className="mt-page-content rounded-card border border-line bg-surface-raised p-4 shadow-soft">
        <h2 className="text-lg font-semibold text-ink">{copy.hubNavAbHeading}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{copy.hubNavAbIntro}</p>
        <ul className="mt-4 space-y-3 text-base">
          <li>
            <TextLink href={routes.methods}>{copy.hubDirectMethods}</TextLink>
          </li>
          <li>
            <TextLink href={routes.words}>{copy.hubDirectWords}</TextLink>
          </li>
          <li>
            <TextLink href={routes.progress}>{copy.hubDirectProgress}</TextLink>
          </li>
        </ul>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{copy.hubNavAbSteps}</p>
      </section>
    </ShellPageContent>
  );
}
