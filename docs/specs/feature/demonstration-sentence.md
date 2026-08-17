# Demonstration sentence

<!-- id: SPEC-feature-demonstration-sentence -->
<!-- use-case: UC-050 -->
<!-- status: active -->

One sentence on **Methods** (`/methods`), slightly above the learner's current
vocabulary coverage, checked by tapping unsure words — not by self-report.
Study/24 S2; tier C honesty: **no CEFR label** until level-labelled sentences
exist ([`language-status.md`](../page/language-status.md)).

## Scope

- **In:** curated sentence bank per shipped language (`data/demonstration-sentences/`);
  picker in `lib/demonstration-sentence.ts`; `DemonstrationSentence` client
  component on the method menu below current standing; tap-to-mark unsure tokens;
  **I've got this** confirmation; plain feedback without level claims.
- **Out:** CEFR labels on the sentence; feeding the level model (UC-004 v2);
  capture tapped words to cards (UC-012); daily streak or score; placement test.

**Reuse: `Button`** — token taps and confirm action.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/methods` with a language that has sentences | One sentence appears below standing when data loads |
| 2 | Taps a word token | Token toggles marked/unmarked (unsure) |
| 3 | Taps **I've got this** with no marks | Feedback: read without marking anything unsure |
| 4 | Taps **I've got this** with marks | Feedback names how many words were marked |
| 5 | Ignores the block | Rest of the menu works; block is not a gate |

## Selection

- Picker scores each sentence by how many `lemmaIds` are **not** held in the
  active pool (meaning-recall, `isTaskHeld`).
- Prefer **1–2** unknown lemmas (slightly above). When none qualify, pick the
  closest count. Stable per calendar day via `dayKey`.
- When review history is empty, all lemmas count as unknown — earliest sentence
  in the bank still appears.

## States

| State | Surface |
| --- | --- |
| Default | Sentence + hint + confirm |
| Token marked | Visual distinction on tapped token |
| Confirmed | Feedback line replaces hint; confirm disabled |

## Data

| Field | Source |
| --- | --- |
| `sentences[]` | `data/demonstration-sentences/{code}.json` |
| `tokens` | Display split; one tap target per entry |
| `lemmaIds` | Pool `wordId`s used for coverage scoring only |

## Acceptance criteria

- [ ] Given Spanish with review history, when `/methods` renders, then one
      sentence appears below standing — not on Words or Progress.
- [ ] Given a sentence, when the learner taps tokens and confirms with none
      marked, then feedback does not claim a CEFR level.
- [ ] Given marked tokens, when the learner confirms, then feedback references
      the count of marked words.
- [ ] Given the sentence block, when the learner never interacts, then filters
      and method cards still work.
- [ ] Given tier C languages, when the sentence renders, then no level label
      appears on or below the sentence.
- [ ] The rendered component has no axe-core violations in isolation.

## Check

`npm test -- demonstration-sentence method-menu`
