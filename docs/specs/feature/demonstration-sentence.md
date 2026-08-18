# Demonstration sentence

<!-- id: SPEC-feature-demonstration-sentence -->
<!-- use-case: UC-050 -->
<!-- status: active -->

One sentence on **Methods** (`/methods`), slightly above the learner's current
vocabulary coverage, checked with a small flip card — not by self-report alone.
Study/24 S2; tier C honesty: **no CEFR label** until level-labelled sentences
exist ([`language-status.md`](../page/language-status.md)).

## Scope

- **In:** curated sentence bank per shipped language (`data/demonstration-sentences/`);
  picker in `lib/demonstration-sentence.ts`; `DemonstrationSentence` client
  component on the method menu below current standing; flip card (target sentence
  front, English translation back); **Hard / Good / Easy** grade row (same labels
  and tokens as Words review, without **Again**); plain feedback without level
  claims.
- **Out:** CEFR labels on the sentence; FSRS scheduling from this grade;
  feeding the level model (UC-004 v2); capture to cards (UC-012); daily streak
  or score; placement test.

**Reuse: `PressableCard`, `GradeButton`** — flip surface and grade row match
Words review affordances.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/methods` with a language that has sentences | One flip card appears below standing when data loads |
| 2 | Taps the card | Card flips; English translation appears on the back |
| 3 | Taps **Hard**, **Good**, or **Easy** after flipping | Brief feedback names how the read felt; card and grades lock |
| 4 | Ignores the block | Rest of the menu works; block is not a gate |

Grade buttons appear only after the card is flipped — the learner reads first,
checks the translation, then rates difficulty.

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
| Front | Target sentence + flip hint |
| Back | Translation + grade prompt + three grade buttons |
| Graded | Feedback line; card and grades disabled |

## Data

| Field | Source |
| --- | --- |
| `sentences[]` | `data/demonstration-sentences/{code}.json` |
| `text` | Target-language sentence on card front |
| `translation` | English sentence on card back — migrates to `sentence.{id}.translation` via [`gloss-resolver.md`](../service/gloss-resolver.md) |
| `lemmaIds` | Pool `wordId`s used for coverage scoring only |

## Acceptance criteria

- [ ] Given Spanish with review history, when `/methods` renders, then one
      sentence card appears below standing — not on Words or Progress.
- [ ] Given the card, when the learner flips and grades, then feedback does not
      claim a CEFR level.
- [ ] Given a grade, when feedback renders, then it reflects Hard / Good / Easy
      without scheduling any task.
- [ ] Given the sentence block, when the learner never interacts, then filters
      and method cards still work.
- [ ] Given tier C languages, when the sentence renders, then no level label
      appears on or below the sentence.
- [ ] The rendered component has no axe-core violations in isolation.

## Check

`npm test -- demonstration-sentence method-menu`
