import { Chip } from "@/components/ui/Chip";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { copy } from "@/features/language-picker/content";
import { languageLabel } from "@/lib/languages";

/**
 * The picker. Contract: docs/specs/page/language-picker.md
 *
 * A Server Component — choosing is a server action, so nothing here needs
 * state. The unavailable tile renders **no control at all** rather than a
 * disabled one: a disabled button still announces itself as an action that
 * exists, and there is no action here to be had (spec behaviour 3).
 */

export type LanguageTile = {
  code: string;
  /** Null when no pool ships for this language. */
  poolSize: number | null;
  /** Null when the learner has never reviewed in it. */
  heldCount: number | null;
  alreadyLearning: boolean;
  /** The language currently in focus for the interface. */
  isActive: boolean;
};

export type LanguagePickerProps = {
  tiles: readonly LanguageTile[];
  /** Rendered when adding failed — the picker stays usable regardless. */
  error?: string | null;
  choose: (code: string) => Promise<void>;
};

function statusLine(tile: LanguageTile): string {
  if (tile.poolSize === null) {
    return copy.unavailable(languageLabel(tile.code).english);
  }
  if (tile.heldCount === null) {
    return copy.notStarted(tile.poolSize);
  }
  return copy.held(tile.heldCount, tile.poolSize);
}

export function LanguagePicker({ tiles, error, choose }: LanguagePickerProps) {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-page-top pb-page-bottom">
      <p className="max-w-2xl text-base leading-relaxed text-muted">{copy.intro}</p>

      {error ? (
        <p role="alert" className="mt-6 text-base leading-relaxed text-danger">
          {error}
        </p>
      ) : null}

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {tiles.map((tile) => {
          const names = languageLabel(tile.code);
          const available = tile.poolSize !== null;

          return (
            <li
              key={tile.code}
              className="rounded-card border border-line bg-surface p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xl font-semibold text-ink">{names.endonym}</p>
                  <p className="mt-1 text-base text-muted">{names.english}</p>
                </div>

                {tile.isActive ? (
                  <Chip
                    tone="accent"
                    className="shrink-0 border border-accent"
                    aria-current="true"
                  >
                    {copy.active}
                  </Chip>
                ) : null}
              </div>

              <p className="mt-4 text-base leading-relaxed text-muted">{statusLine(tile)}</p>

              {available && !tile.alreadyLearning ? (
                <form
                  action={async () => {
                    "use server";
                    await choose(tile.code);
                  }}
                  className="mt-6"
                >
                  <SubmitButton>{copy.choose}</SubmitButton>
                </form>
              ) : null}

              {tile.alreadyLearning && !tile.isActive ? (
                <p className="mt-6 text-base font-medium text-ink">{copy.alreadyLearning}</p>
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted">{copy.footnote}</p>
    </div>
  );
}
