# Reading surface (v1)

<!-- id: SPEC-feature-reading-surface -->
<!-- use-case: UC-007 -->
<!-- status: active -->

Tokenised text on **source detail** (`/content/[id]`) for text sources. Tap a
word for its pool gloss; second-tap a sentence for deduped word gloss hints.
Parent loop: [`content-traceability.md`](content-traceability.md). Adapted
catalogue bodies show the honesty label from
[`content-adaptation.md`](../service/content-adaptation.md) above the readable
text. Full runner (comprehension, sentence translation, card capture) is **Out**
until T-W10 remainder.

## Scope

- **In:** `lib/readable-text.ts`, `lib/readable-sentences.ts`; `ReadableText`
  client component on source detail when `kind === "text"`; tap word → dialog
  with starter-pool gloss when the lemma resolves; second-tap sentence → deduped
  gloss line from known pool words; punctuation preserved between tokens;
  adaptation label when shown body is adapted; `sourceUrl` link when lane B.
- **Out:** full sentence translation; comprehension questions; FSRS from taps;
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
| 6 | Taps a sentence once | Hint to tap again when glosses are available |
| 7 | Taps the same sentence again | Deduped gloss line from pool-known words in that sentence |

## Acceptance criteria

- [x] Given a fixture text source, when detail renders, then the body text is
      visible with clickable words.
- [x] Given a resolved lemma in the starter pool, when the learner taps that
      word, then the dialog shows the pool `back` gloss.
- [x] Given an audio-only source, when detail renders, then no reading surface
      appears.
- [x] Given an adapted source with `targetLevel`, when detail renders, then the
      adaptation honesty line appears above the body.
- [x] Given a sentence with pool glosses, when the learner taps the sentence
      twice, then deduped gloss hints appear below the sentence.

## Check

`npm test -- readable-text content readable-sentences`
