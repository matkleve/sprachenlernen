# Frequency blocks

<!-- id: SPEC-service-frequency-blocks -->
<!-- use-case: UC-032 -->
<!-- status: active -->

Framework-free derivation of **how many starter-pool words the learner holds
stably in each frequency band**. Pool-local v1 — counts over the shipped
starter deck, not language-wide coverage.

Serves UC-032 (milestones) and the pool-local slice of UC-031 (map). Full
language map and marginal coverage payoff wait for the coverage calculator
(stage 3).

## Scope

- **In:** `lib/frequency-blocks.ts` — pure functions over starter cards and
  review history; displayed on `/words` via [`words-home.md`](../feature/words-home.md).
  Default bands for the 2000-lemma pool: ranks **1–1000** and **1001–2000**.
- **Out:** corpus-calibrated payoff lines ("+8 % coverage"); language-wide
  extrapolation; block-completion events; forcing block order; recomputing
  lemma-frequency ranks ([`lexicon.md`](lexicon.md) — **decided 2026-08-12:**
  starter ranks stay as built from form-frequency lists until coverage ships).

**Reuse:** `isTaskHeld` from [`vocabulary-snapshot.md`](vocabulary-snapshot.md).

## Behavior

| # | Input | Output |
| --- | --- | --- |
| 1 | Starter pool + task state per card | One row per band: `rankStart`, `rankEnd`, `poolSize`, `held`, `fragile`, `new` |
| 2 | A card whose rank falls in a band | Counted in that band's bucket via meaning-recall task state only |
| 3 | Form-recall tasks | Ignored — one row per word, same rule as the vocabulary atlas |
| 4 | Empty history | Every card in `new`; `held + fragile + new = poolSize` per band |

"Held" uses the same rules as vocabulary counts (`heldStabilityThreshold`, two
successes, no trailing `again`).

## States

Not a UI machine. Pure derivation.

## Acceptance criteria

- [ ] Given the shipped 2000-lemma Spanish pool and empty history, when blocks
      are built, then two bands return (1–1000 and 1001–2000) with 1000
      `poolSize` each and all cards `new`.
- [ ] Given one meaning-recall task held in rank 42, when blocks are built,
      then band 1 shows `held: 1` and band 2 is unchanged.
- [ ] Given a form-recall review only (no meaning-recall history), when blocks
      are built, then the word's band does not increment `held`.
- [ ] Given any input, when blocks are built, then `held + fragile + new`
      equals `poolSize` for every band.

## Check

`npm test -- frequency-blocks`
