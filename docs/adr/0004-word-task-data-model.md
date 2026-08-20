# 0004. Model a word as one entity owning several independently scheduled tasks

- **Status:** Accepted
- **Date:** 2026-08-08

## Context

Four facts force this decision before any code is written.

1. **Direction of retrieval is not one skill.** Producing *casa* from "Haus"
   trains form recall; producing "Haus" from *casa* trains meaning recall. The
   research treats these as distinct knowledge, and recognition (multiple choice)
   overestimates real knowledge relative to production by roughly 20 %. An app
   that schedules one of them and reports both is measuring half a competence.
   ([`../study/STUDY-002-evidence.md`](../study/STUDY-002-evidence.md) E3)
2. **The scheduler's state is per question, not per word.** FSRS tracks
   stability, difficulty and retrievability for a thing that is *asked*. A word
   asked four ways has four independent memory states, and forcing them into one
   destroys the signal the level model is built on.
3. **The vocabulary estimate counts words, not questions.** The level model maps
   known **word families** against frequency rank. If a word that is asked four
   ways counts as four, the estimate inflates by a factor that varies per user,
   and the calibration is meaningless.
   ([`../study/STUDY-003-level-model.md`](../study/STUDY-003-level-model.md))
4. **Two languages from day one.** The first version targets German → Spanish
   **and** German → Italian (roadmap question 2, answered 2026-08-08). Two
   closely related Romance languages mean cross-language confusion is a
   first-class concern immediately, not a later feature.

The reversal cost is what makes this an ADR: review history accumulates from the
first session. Changing the unit that history hangs on later means either
discarding it or migrating it with invented values — and the level model would
visibly jump for every user.

## Decision

We model three levels, not two:

```
Language  ──►  Word  ──►  Task
                          └── one FSRS state each (stability, difficulty, due)
                    └── lemma + part of speech + frequency rank
                        the unit the vocabulary estimate counts
```

- A **Word** is a lexical entry in one language, keyed by lemma and part of
  speech, carrying its frequency rank. It holds **no scheduling state**.
- A **Task** is one question about a Word — meaning recall, form recall, audio
  recall, cloze, minimal pair — and owns its own FSRS state and its own due
  date. Tasks of one Word are scheduled independently.
- **Reviews** are an append-only log attached to a Task, each with grade,
  latency and timestamp. The FSRS state is derived from the log and may be
  recomputed; the log is never rewritten.
- Every Word belongs to exactly one Language. Nothing is shared across
  languages except the user.
- The user-facing word "card" means **Task**. The learner never sees the Word/Task
  split as a concept.

Counting rules, normative: the vocabulary estimate counts **Words**. Session
size, due counts and the forecast count **Tasks**. A multiword item is one Word
regardless of how many tokens it spans.

## Alternatives considered

**One card per question, no word entity.** Anki's model, and the simplest to
build. Lost because the vocabulary estimate then has nothing to count — you
would have to reconstruct word identity from card text, which is exactly the
fragile heuristic the level model cannot rest on. It also makes "show me
everything about this word" impossible.

**One card per word, one schedule, direction chosen at review time.** Fewer
records and a smaller-feeling workload. Lost because it destroys fact 2: a
single memory state cannot represent "reads it fine, cannot produce it", which
is the most common state of an intermediate learner's vocabulary and the one the
skill profile needs to see.

**Tasks as rows on the Word (a fixed set of columns).** Tempting because the
task types are known. Lost because the task list is not closed — minimal-pair
tasks appear only when a confusion is detected, and HVPT introduces
contrast-bound tasks that not every word has
([`../study/STUDY-011-pronunciation-perception.md`](../study/STUDY-011-pronunciation-perception.md)).
A fixed shape would be migrated within months.

**A single shared Word space across languages**, with language as an attribute
on the Task. Lost because Spanish and Italian share spellings with different
meanings, and merging them creates exactly the confusion this project has to
diagnose rather than cause.

## Consequences

**Easier.** The level model reads what it needs directly: Word count for
vocabulary size, per-Task stability for what is actually known, per-skill
grouping by task type. The four-state skill status
([`../study/STUDY-003-level-model.md`](../study/STUDY-003-level-model.md)) becomes a query
rather than a special case. Adding a task type is additive. Two languages need
no retrofit, and UC-025 stops being a stage-6 problem.

**Harder, and this is the real cost.** Roughly three to five records per word
instead of one. Three consequences we now own:

- **Perceived workload.** A learner with 500 words has ~2,000 tasks. Never show
  that number. This is why the fixed-length session
  ([`../study/STUDY-004-flashcards-srs.md`](../study/STUDY-004-flashcards-srs.md), F04)
  is not a nicety but a requirement of this model.
- **Sibling scheduling.** Four tasks for one word will drift together and clump.
  Some spacing rule between siblings is needed, and it is not designed yet.
  **⚠ SPEC GAP: the minimum interval between two tasks of the same word is
  undecided.** It belongs in the scheduler spec, not here.
- **Aggregation is now a decision everywhere.** Any display of "this word" must
  say how it combines its tasks. Weakest task, average, or the one relevant to
  the current skill — three different answers, all defensible, and the reason
  the glossary marks *word family vs. word form* as still undecided.

**Committed to.** The review log as the source of truth, which means every
scheduler change is a recomputation rather than a migration — the property that
makes recalibration honest
([`../study/STUDY-003-level-model.md`](../study/STUDY-003-level-model.md), rule 4).
