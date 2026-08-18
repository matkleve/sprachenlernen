# Session builder

<!-- id: SPEC-service-session-builder -->
<!-- use-case: UC-011 -->
<!-- status: active -->

Framework-free service that turns a starter deck and optional review history
into a fixed-length queue of Tasks for one review session. **Standard**
(`AGENTS.md`) — pure functions, no React.

## Scope

- **In:** `data/starter/es-meaning-recall.json` (frequency-ordered pool),
  `lib/starter-deck.ts` (load + validate), `lib/session-builder.ts`
  (`buildSession`), and tests. Default session length **15** cards; pool size
  **2000** lemmas ([`starter-deck.md`](starter-deck.md)); language **es**; task
  type **meaning-recall** only.
- **Out:** choosing session length from the method menu (time scale is a separate
  PR); **at most one Task per Word per session** when siblings are both due
  (2026-08-12); real Word/Task tables in the database; which language a pool
  belongs to, and how many languages the account holds — a caller's job, never
  this module's (see "This module never chooses a language" below); form recall,
  audio recall, cloze; hand-picking cards (UC-039); backlog counters (UC-063, A3).

## Behavior

| # | Input | System response |
| --- | --- | --- |
| 1 | Starter pool + empty history | Returns **15** cards in frequency order, each with a stable `taskId` and `wordId` |
| 2 | Starter pool + prior reviews for some tasks | Rebuilds scheduler state per task via `rebuild`; includes **due** tasks (`due <= now`, not suspended/retired) before **new** tasks; still caps at **15** |
| 3 | More than 15 due | Returns the 15 most overdue by `due` ascending |
| 4 | Fewer than 15 due + new available | Fills with new tasks in frequency order until 15 or pool exhausted |
| 5 | Pool smaller than session length | Returns every card in the pool — never invents cards |
| 6 | Two Tasks of one Word both due | Includes the more overdue one; the other stays due for the next session |

**Sibling rule (2026-08-12):** FSRS sets each Task's `due` date independently.
When building a session, if meaning-recall and form-recall for the same Word are
both due, **only one enters this session** — whichever sorts first (earlier
`due`, then lower `frequencyRank`). The sibling remains due and can appear in the
**next** session. This is not a fixed card count or fixed day gap; it prevents
the same word twice in one 15-card run. Same-Task requeue after `again`/`hard`
(UC-071) is separate and handled in the review session, not here.

## States

Not a UI machine. `buildSession` is synchronous and returns a value or an error
string — no partial queue.

## Data

**Starter card** (JSON):

| Field | Type | Notes |
| --- | --- | --- |
| `taskId` | `string` | Stable opaque id, e.g. `es:de:meaning-recall` |
| `wordId` | `string` | Lexical unit, e.g. `es:de` |
| `lemma` | `string` | Surface form shown on the front |
| `front` | `string` | L2 prompt (v1: same as `lemma`) |
| `back` | `string` | **Legacy** English description — supplied at build, resolved via [`gloss-resolver.md`](gloss-resolver.md) once T-W15 ships. Target: `descriptionKey` only. |
| `frequencyRank` | `number` | 1 = most frequent in pool |

**Session queue entry** adds scheduler-derived fields the UI may show later:
`position` (1-based), `total`.

⚠ **This shape bakes description text into the pool file, permanently
English.** [UC-069](../../use-cases/UC-069-use-the-app-in-my-own-language.md)
resolved that word identity and description text must be **separate
records**, keyed by (word, spoken language) — this spec's `back` field does
not reflect that yet. Not updated here because two of UC-069's own gaps are
still open (where non-English text comes from; one string vs. split parts).
When it is updated: never a second `back`-like field per spoken language on
this same shape — UC-069 explicitly rejects a duplicate-deck-per-language
design.

Reviews passed in are scheduler `Review[]` keyed by `taskId`. The builder never
calls the database.

## Acceptance criteria

- [ ] Given an empty review map, when `buildSession` runs with the shipped Spanish
      starter pool, then exactly 15 entries return in ascending `frequencyRank`
      and each `taskId` is unique.
- [ ] Given a task with reviews that make it due now, when `buildSession` runs,
      then that task appears before any task with no reviews.
- [ ] Given 20 tasks all due now, when `buildSession` runs, then 15 return and
      they are the 15 with the earliest `due` values.
- [ ] Given a pool of 10 cards, when `buildSession` runs, then 10 return and
      no error is thrown.
- [ ] Given meaning-recall and form-recall for the same `wordId` both due,
      when `buildSession` runs, then exactly one of them appears in the queue.
- [ ] Given an invalid starter file, when `loadStarterDeck` runs, then it returns
      errors and no deck.

## This module never chooses a language, and never mixes two

**Corrected 2026-08-12.** An earlier version of this section forbade filtering
the pool by the learner's active language, reasoning from a combined
cross-language daily budget that [UC-025](../../use-cases/UC-025-learn-multiple-languages.md)
has since **rejected outright** — languages never share a session, so there is
nothing left to protect by keeping this module blind to which language it is
given.

What still holds, for a different reason: `buildSession` takes **whatever pool
the caller passes**, and does not know or care which language that is — it has
no language parameter today and needs none. The actual rule this module must
never violate is upstream of it: **a caller must never pass it cards from more
than one learning language at once.** One session, one language, always — the
caller (`poolForActiveLanguage` in `lib/db/learner-pools.ts`, done 2026-08-12 —
the single function that replaced the earlier `poolForScheduling`/
`poolForDisplay` split) is where that is enforced, by handing this module only
the active language's cards.

- [ ] Given the module, then it imports nothing from `lib/db/learning-languages.ts`
      and takes no language, active-language or focus parameter — it stays a
      pure function over whatever pool it is handed.
- [ ] Given a pool built from two learning languages' cards (a caller error),
      then `buildSession`'s output still cannot be relied on to separate them —
      this is why the separation belongs in the caller, covered by its own test,
      not smuggled into this module as a filter.

## Check

`npm test -- session-builder starter-deck`
