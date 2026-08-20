# Reading surface (v1)

<!-- id: SPEC-feature-reading-surface -->
<!-- use-case: UC-007 -->
<!-- status: active -->

Tokenised text on **source detail** (`/content/[id]`) for text sources. Tap a
word for its pool gloss. Parent loop:
[`content-traceability.md`](content-traceability.md). Adapted catalogue bodies
show the honesty label from [`content-adaptation.md`](../service/content-adaptation.md)
above the readable text. Full runner (comprehension,
sentence translation, card capture) is **Out** until T-W10 remainder.

## Scope

- **In:** `lib/readable-text.ts`; `ReadableText` client component on source
  detail when `kind === "text"`; tap word → dialog with starter-pool gloss when
  the lemma resolves; punctuation preserved between tokens; adaptation label when
  `adaptedFromSourceId` or `targetLevel` is set.
- **Out:** sentence-level translation; comprehension questions; FSRS from taps;
  audio transcript runner.

**Reuse: `Button`, `Dialog`** — word taps and gloss dialog.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens a text source detail | Body appears below coverage in readable segments |
| 2 | Taps a word | Dialog shows the word and its gloss when known in the pool |
| 3 | Taps a word with no pool gloss | Dialog names the word; gloss line empty |
| 4 | Closes dialog | Reading text stays; dialog dismisses |
| 5 | Opens adapted catalogue text | Adaptation label visible above body; link to original when `sourceUrl` set |

## Acceptance criteria

- [ ] Given a fixture text source, when detail renders, then the body text is
      visible with clickable words.
- [ ] Given a resolved lemma in the starter pool, when the learner taps that
      word, then the dialog shows the pool `back` gloss.
- [ ] Given an audio-only source, when detail renders, then no reading surface
      appears.
- [ ] Given an adapted source with `targetLevel`, when detail renders, then the
      adaptation honesty line appears above the body.

## Check

`npm test -- readable-text content`
