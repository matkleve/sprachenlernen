# Card example sentence

<!-- id: SPEC-feature-card-example-sentence -->
<!-- use-case: UC-076 -->
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
2. Score each candidate with [`coverage.md`](../service/coverage.md) over the
   learner's held-lemma set.
3. Prefer **comfortable** band (95–98% coverage). If none: closest to 95% from
   above (slightly challenging) or below (known fallback).
4. Stable random among ties via `sessionId` + `taskId` salt — not a new card
   every flip within one session.
5. Hard cap: sentence length ≤ **20** tokens (subtitle register).

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
| `lemmaIds` | for coverage scoring |
| Held set | review log + [`vocabulary-snapshot.md`](../service/vocabulary-snapshot.md) |

## Acceptance criteria

- [ ] Given Italian with held lemmas covering 95% of a bank sentence containing
      `fare`, when the `fare` card renders, then that sentence (or one in the
      same comfort band) appears on the front.
- [ ] Given no sentence for a lemma reaches the comfort band, when the card
      renders, then the UI matches today's lemma-only card — no broken layout.
- [ ] Given `spoken_language` `de`, when the sentence translation is shown,
      then it is German — not English from the bank file.
- [ ] Given the learner flips, when the back renders, then the sentence remains
      visible and the gloss is in the spoken language.
- [ ] Given two sessions the same day, when the same `taskId` appears, then the
      same sentence is chosen (stable salt).

## Check

`npm test -- card-example-sentence`

## Open

- ⚠ **Bank source v1** — extend `data/demonstration-sentences/` vs new
  `data/example-sentences/` with per-lemma tags. Picker spec assumes per-lemma
  tags exist; seeding is a content task in T-W19b.
