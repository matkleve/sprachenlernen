# Reading surface (v1)

<!-- id: SPEC-feature-reading-surface -->
<!-- use-case: UC-007 -->
<!-- status: active -->

Tokenised text on **source detail** (`/content/[id]`) for text sources. Tap a
word for its pool gloss. Parent loop:
[`content-traceability.md`](content-traceability.md). Full runner (comprehension,
sentence translation, card capture) is **Out** until T-W10 remainder.

## Scope

- **In:** `lib/readable-text.ts`; `ReadableText` client component on source
  detail when `kind === "text"`; tap word → dialog with starter-pool gloss when
  the lemma resolves; punctuation preserved between tokens.
- **Out:** sentence-level translation; comprehension questions; FSRS from taps;
  learner uploads (T-W9); audio transcript runner.

**Reuse: `Button`, `Dialog`** — word taps and gloss dialog.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens a text source detail | Body appears below coverage in readable segments |
| 2 | Taps a word | Dialog shows the word and its gloss when known in the pool |
| 3 | Taps a word with no pool gloss | Dialog names the word; gloss line empty |
| 4 | Closes dialog | Reading text stays; dialog dismisses |

## Acceptance criteria

- [ ] Given a fixture text source, when detail renders, then the body text is
      visible with clickable words.
- [ ] Given a resolved lemma in the starter pool, when the learner taps that
      word, then the dialog shows the pool `back` gloss.
- [ ] Given an audio-only source, when detail renders, then no reading surface
      appears.

## Check

`npm test -- readable-text content`
