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
  pool size **500** lemmas; language **es**; task type **meaning-recall** only.
- **Out:** choosing session length from the method menu (time scale is a separate
  PR); sibling spacing between tasks of one Word (ADR-0004 spec gap); real
  Word/Task tables in the database; Italian or a second language; form recall,
  audio recall, cloze; hand-picking cards (UC-039); backlog counters (UC-063,
  A3).

## Behavior

| # | Input | System response |
| --- | --- | --- |
| 1 | Starter pool + empty history | Returns **15** cards in frequency order, each with a stable `taskId` and `wordId` |
| 2 | Starter pool + prior reviews for some tasks | Rebuilds scheduler state per task via `rebuild`; includes **due** tasks (`due <= now`, not suspended/retired) before **new** tasks; still caps at **15** |
| 3 | More than 15 due | Returns the 15 most overdue by `due` ascending |
| 4 | Fewer than 15 due + new available | Fills with new tasks in frequency order until 15 or pool exhausted |
| 5 | Pool smaller than session length | Returns every card in the pool — never invents cards |

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
| `back` | `string` | English gloss — supplied, not generated at runtime |
| `frequencyRank` | `number` | 1 = most frequent in pool |

**Session queue entry** adds scheduler-derived fields the UI may show later:
`position` (1-based), `total`.

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
- [ ] Given an invalid starter file, when `loadStarterDeck` runs, then it returns
      errors and no deck.

## Check

`npm test -- session-builder starter-deck`
