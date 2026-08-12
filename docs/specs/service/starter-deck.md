# Starter deck

<!-- id: SPEC-service-starter-deck -->
<!-- use-case: UC-011 -->
<!-- status: active -->

The frequency-ranked lemma pool that seeds a learner's first SRS sessions.
**Standard** (`AGENTS.md`) — data plus a loader; no UI.

**Owned by the card engine** ([`method-engines.md`](method-engines.md)): consumed
exclusively by `srs-session` via [`session-builder.md`](session-builder.md).
Other Methods do not read this pool until their engines ship and declare a
dependency here.

## Scope

- **In:** `data/starter/es-meaning-recall.json` (shipped pool), its three
  hand-maintained companions — `.overrides.json` (glosses), `.exclusions.json`
  (lemmas that never enter the pool), `.cognates.json` (lemmas whose gloss is
  legitimately the lemma) — `scripts/build-starter-deck.mjs` (regenerator),
  `lib/starter-deck.ts` (load + validate).
- **Out:** Italian or a second language; **audio** recall tasks; runtime
  gloss generation; language-wide vocabulary extrapolation (still blocked on
  pool size + calibration — see [`page/progress.md`](../page/progress.md));
  choosing which lemmas enter the pool at review time (the pool is fixed per
  release). Form-recall pool: [`form-recall-pool.md`](form-recall-pool.md).

## Behavior

| # | Input | Output |
| --- | --- | --- |
| 1 | Shipped JSON | Validates and returns a deck: language, task type, cards |
| 2 | Invalid JSON | Error list; no deck |
| 3 | Regenerator run | Rewrites the JSON from frequency data + lemma table + gloss sources |

## States

Not a UI machine. `loadSpanishMeaningRecallDeck` is synchronous.

## Data

**Stage 1 pool (shipped):** **500** Spanish lemmas, task type
`meaning-recall`, ordered by descending aggregated form frequency.

| Field | Type | Notes |
| --- | --- | --- |
| `taskId` | `string` | `es:{lemma}:meaning-recall` |
| `wordId` | `string` | `es:{lemma}` |
| `lemma` | `string` | Canonical lemma from the lemma table |
| `front` | `string` | v1: same as `lemma` |
| `back` | `string` | English gloss — build-time, never runtime |
| `frequencyRank` | `number` | 1 = most frequent in pool |

**Lemma selection (build script):**

1. Read `data/frequency/es.txt` (form counts).
2. Resolve each form through `data/lemma/es.json`; skip fused forms.
3. Sum form counts per lemma; sort descending.
4. Drop every lemma listed in `es-meaning-recall.exclusions.json` — **before**
   the cap, so the pool reaches one rank deeper per exclusion and still holds
   500 cards.
5. Take the top **500** remaining lemmas.

Exclusions are proper names and lemmatiser artefacts — words the pipeline
produces that are not Spanish vocabulary. Each entry carries its reason as its
value. Excluding a real but unwanted word is not what this list is for.

Unknown forms that resolve to themselves are included when frequent enough; the
pool follows subtitle register, not textbook vocabulary.

**Gloss provenance (build script):**

1. Hand-checked overrides in `es-meaning-recall.overrides.json` win, and ship
   verbatim — shaping a reviewed answer would undo the review.
2. Else the first English gloss from the Kaikki.org Spanish dictionary
   (CC BY-SA 3.0), cached at build time in `.cache/gloss/`, **shaped** (below).
3. Else the build fails — no card ships without a gloss.

**Gloss shaping**, applied to machine glosses only. A dictionary sense line is
not a card back: a learner grading recall against *dog (the species Canis
familiaris …)* is grading against a paragraph.

1. Remove bracketed apparatus — `(…)` and `[…]`, balanced — and collapse the
   whitespace it leaves behind. That is the whole transformation.
2. Reject the card if the result is empty, longer than **60** characters, equal
   to the lemma without an entry in `es-meaning-recall.cognates.json`, or a
   **grammar note rather than a translation** (`third-person singular … of`,
   `apocopic form of`, `Senses relating to …`, `a surname`).

**Shaping never chooses between senses**, and that is the point. An earlier
version kept the first `;` group and the first three synonyms; it shipped
`policía` as *"Civility, polity, public order"* — one position short of
*police* — and `gran` as *"apocopic form of grande"*, discarding the *"great,
grand"* that followed. Kaikki does not order senses by usefulness, so every
positional rule eventually discards the right answer, silently. Anything still
too long once the apparatus is gone is a human's problem, and the build says so.

A rejected card fails the build naming the lemma, so the fix is an override
rather than a silent bad card. A gloss equal to the front is otherwise the
signature of a failed lookup, which is why the cognate exceptions are listed as
data rather than detected — and why `lib/starter-deck.ts` reads the same file
the script does.

**Regenerating is safe for stored history, excluding is not.** `taskId` is
derived from the lemma, never the rank, so re-ranking the pool leaves every
`review_log.task_id` still resolvable — a learner's history survives a rebuild.

Adding an **exclusion** is the one edit that does not. Rows for that lemma stay
in the append-only log — nothing is deleted, and the UC-024 export still carries
them through `listAllReviews` — but `listReviewsForTaskIds` queries the pool's
ids, so those reviews stop counting toward held/shaky/new, the horizon and the
standing line. The learner sees a number go down for a reason no screen
explains. Before excluding a lemma, check whether it has shipped: excluding one
that never reached a learner costs nothing, and excluding one that did is a
decision about their data, not a data-quality fix.

## Acceptance criteria

In [`starter-deck.acceptance-criteria.md`](starter-deck.acceptance-criteria.md).

## Check

`npm test -- starter-deck`

## A second language

Italian is investigated and **not buildable yet** — three independent blockers,
none of them code. See
[`starter-deck.second-language.md`](starter-deck.second-language.md).

## Open

- **⚠ The shipped deck has not been reproduced from a live Kaikki fetch.**
  `kaikki.org` is blocked by the agent network policy, so the committed pool was
  built from a **reconstructed** gloss cache — the raw glosses the previous
  build had already resolved, replayed through the current shaping rules. That
  makes it reproducible *given that cache*, which is not the same claim. The
  first run on a machine that can reach Kaikki is the real test, and it may
  surface lemmas needing an override that this one could not see. Do it before
  stage 2, not during.
- **Stage 2 (2k lemmas)** — same pipeline, larger cap; blocked on gloss QA
  bandwidth, not code. Roughly 4× the hand-gloss work: 20 overrides carried 500,
  and the long tail is less cognate-friendly, not more. The pipeline's hard
  ceiling is **2,953** lemmas — every unique lemma the 5,000-form frequency list
  resolves to — so 2k fits and anything past it needs a larger list, which is a
  recalibration event (provenance travels with the rank).
- **Lemma-frequency recomputation** — summing form counts into lemma ranks is
  deliberate but is a calibration event when the level model extrapolates
  ([`lexicon.md`](lexicon.md) Open).
