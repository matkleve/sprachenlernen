# Card example sentence

<!-- id: SPEC-feature-card-example-sentence -->
<!-- use-case: UC-076 -->
<!-- use-case: UC-019 -->
<!-- status: draft -->

One **target-language example sentence** on each review card, chosen so the
learner understands roughly **90–95%** of it (comfort band from
[`coverage.md`](../service/coverage.md)). Translation of that sentence uses the
same spoken-language pipeline as card glosses ([`gloss-resolver.md`](../service/gloss-resolver.md)).

Study/20 S1; distinct from [`demonstration-sentence.md`](demonstration-sentence.md)
(methods menu only, no FSRS).

## Scope

- **In:** `exampleSentenceKey` on pool cards (optional); sentence bank in
  `data/example-sentences/{lang}.json` or curated rows in `app_texts`; picker
  in `lib/card-example-sentence.ts`; display on
  [`review-session.md`](review-session.md) below the lemma (front, before flip).
- **Out:** scheduling from sentence difficulty; FSRS on sentences; generating
  sentences at runtime; example sentences on form-recall cards in v1.

**Reuse: `PressableCard`** — sentence is part of the existing flip surface, not
a second card.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Review session loads | Each card may show one sentence containing the lemma |
| 2 | Lemma has no qualifying sentence | Card shows lemma only — no placeholder, no error |
| 3 | Flips card | Sentence stays visible; gloss appears as today |
| 4 | `spoken_language` `de` | Sentence translation (if shown) is German via gloss resolver |

### Selection (per card, per session)

1. Candidates: sentences tagged with the card's `wordId` (or lemma) in the bank.
2. When `activeWorld ≠ general`, prefer candidates whose bank row `world`
   equals `activeWorld` or is omitted (neutral glue). Weighted pick among ties
   — not 100% in-world ([`study/56`](../../study/56-lernwelt-single-choice.md)).
3. Score each remaining candidate with [`coverage.md`](../service/coverage.md)
   over the learner's held-lemma set.
4. Prefer **comfortable** band (95–98% coverage). If none: closest to 95% from
   above (slightly challenging) or below (known fallback).
5. Stable random among ties via `sessionId` + `taskId` salt — not a new card
   every flip within one session.
6. Hard cap: sentence length ≤ **20** tokens (subtitle register).

Sentence **text** is target language (stored under `sentence.{id}.text` or bank
`text` field). **Translation** key: `sentence.{id}.translation` in app texts.

## States

| State | Surface |
| --- | --- |
| `lemma-only` | No qualifying sentence — front shows lemma as today |
| `with-sentence` | Lemma + one sentence line below |
| `flipped` | Sentence + gloss on back |

## Data

| Field | Source |
| --- | --- |
| `exampleSentenceKey` | pool JSON — optional; may be omitted when picker chooses from bank |
| `sentences[]` | `data/example-sentences/{code}.json` or DB later |
| `world` | optional on bank row — same ids as [`learner-world.md`](../service/learner-world.md) |
| `activeWorld` | [`learner-world.md`](../service/learner-world.md) for the session |
| `lemmaIds` | for coverage scoring |
| Held set | review log + [`vocabulary-snapshot.md`](../service/vocabulary-snapshot.md) |

## Acceptance criteria

See [`card-example-sentence.acceptance-criteria.md`](card-example-sentence.acceptance-criteria.md).

## Check

`npm test -- card-example-sentence`

## Open

- ⚠ **Bank source v1** — extend `data/demonstration-sentences/` vs new
  `data/example-sentences/` with per-lemma tags. Picker spec assumes per-lemma
  tags exist; seeding is a content task in T-W19b.
