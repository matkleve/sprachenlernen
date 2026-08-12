# Learning languages

<!-- id: SPEC-service-learning-languages -->
<!-- use-case: UC-025 -->
<!-- status: active -->

Which languages an Account is learning, and which one the interface is currently
showing. **Sensitive** (`AGENTS.md`) — persisted, owned per Account, and the
first table added since `review_log`.

## Scope

- **In:** the `learner_language` table and its RLS policy,
  `lib/db/learning-languages.ts` (adapter), and the derivation of the **active**
  language for a request.
- **Out:** the picker and profile surfaces (their own specs); per-language
  filtering of Progress and Words; the combined daily budget and maintenance
  mode (UC-025, both later); interface translation, which is a different axis
  entirely and is at stage 0 ([`I18N.md`](../../I18N.md)).

## The distinction this spec exists to hold

[`GLOSSARY.md`](../../GLOSSARY.md) defines both, and they must not merge:

- **Learning language** — a language this Account is learning. Several possible.
  Owns its Reviews, vocabulary reading and calibration.
- **Active language** — the one in focus in the interface. Exactly one. Decides
  **what is displayed and nothing else.**

**Engines are per learning language.** Reviews, the starter pool, and Progress
readings are scoped to the language in focus on display surfaces (Words,
Progress, standing). The session builder may draw from **all** learning languages
for scheduling — see UC-025. Active language must never reach the builder.

## Behavior

| # | Input | System response |
| --- | --- | --- |
| 1 | Account has no learning language | Adapter returns an empty list; callers route to the picker rather than rendering an empty destination |
| 2 | Account adds a language | One row, `added_at` set, becomes active if nothing else is |
| 3 | Account switches active language | Only the active pointer moves; no row is added, removed or reordered |
| 4 | Account adds a language it already has | No second row — idempotent, no error |
| 5 | A language with no shipped pool is requested | Refused by the adapter, naming the language. Availability is derived from what `data/starter/` actually ships, never from a list anyone can edit independently |
| 6 | Read fails | `error` outcome — never an empty list, which callers would read as "new learner" and answer with the picker |

## States

Not a UI machine. The adapter is async and returns `ok | error`, matching
[`review-log.md`](review-log.md).

## Data

```sql
create table public.learner_language (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  language_code text not null,
  is_active boolean not null default false,
  added_at timestamptz not null default now()
);
```

| Column | Notes |
| --- | --- |
| `user_id` | Owner, taken from the session — never from the client (BACKEND.md §4) |
| `language_code` | Matches a profile in `data/languages/` |
| `is_active` | **At most one** true row per Account, enforced by a partial unique index. At *least* one is the adapter's job — an index cannot express it |
| `added_at` | Ordering for the profile list |

Constraints: `unique (user_id, language_code)` gives behaviour 4 for free, and
`unique (user_id) where is_active` makes "**at most** one active" a database
fact. Keeping one in focus cannot be an index: `setActiveLanguage` verifies the
target belongs to the account **before** clearing, and restores the previous row
if the promotion touches nothing — an earlier version cleared, set, checked
neither, and could leave an account with languages and none in focus.

**RLS mirrors `review_log`**: a row is readable and writable only by the Account
in `user_id`. Proven by the §8 access-control test, not asserted here.

**No migration is needed for existing history.** `review_log.task_id` already
carries the language as its first segment (`es:el:meaning-recall`), so per-language
partitioning of Reviews needs no column and no backfill.

## Two pools, and why they are two functions

`lib/db/learner-pools.ts` turns the account's languages into cards, and it
exposes **`poolForScheduling`** and **`poolForDisplay`** rather than one
parameterised call:

| | Contains | Used by |
| --- | --- | --- |
| `poolForScheduling` | **every** learning language, concatenated | the review session |
| `poolForDisplay` | the **active** language only | `/progress`, `/words`, the standing line |

Task ids carry their language (`es:el:meaning-recall`), so concatenating decks
cannot collide. A language whose pool stopped shipping is skipped rather than
fatal — one broken deck must not cost a learner the languages that still work.

Named, not parameterised (`getPool(activeOnly?)`), because a boolean at the call
site is an invitation and a name is a decision. Display may follow the
interface's focus; scheduling may not — see below.

**Neither surface renders an empty state when nothing is chosen.** Both return
`no-language`, and the caller routes to the picker: `/progress` and `/words`
redirect, the review session redirects, and the method menu simply omits its
standing line so the catalogue still loads. "Not measured" is a statement about
a learner who has been asked; it must not be shown to one who has not.

## The constraint that protects UC-025

⚠ **The active language must never reach the session builder.** It selects what
is displayed. If it becomes a filter on what is scheduled, the combined daily
budget stops splitting across languages and the older language decays — which is
the entire failure UC-025 exists to prevent, and the most natural wrong thing to
build. Stated as a negative acceptance criterion in
[`session-builder.md`](session-builder.md) as well, because one place is not
enough for a rule this easy to violate.

## Acceptance criteria

- [ ] Given an Account with no rows, when the adapter lists languages, then it
      returns an empty list with status `ok` — distinguishable from an error.
- [ ] Given an Account adding `es`, when it is the first, then the row is created
      with `is_active` true.
- [ ] Given an Account adding a second language, then the active language does
      **not** change — adding is not switching.
- [ ] Given an Account adding a language it already has, then no second row is
      created and the outcome is not an error.
- [ ] Given a switch to a language the Account has, then exactly one row has
      `is_active` true afterwards.
- [ ] Given a request for a language with no shipped starter pool, then the
      adapter refuses and names it — availability derives from `data/starter/`.
- [ ] Given Account B signed in, when B reads or writes A's rows, then zero rows
      are returned and the write is refused (§8 access-control test).
- [ ] Given the read fails, then the outcome is `error`, never an empty list.
- [ ] **Negative:** no export from this module is imported by
      `lib/session-builder.ts` — checked by grep in the test, because the damage
      is silent and the reviewer would have to notice an absence.
- [ ] Given an account learning two languages with only one in focus, when
      `poolForScheduling` runs, then the pool contains **both** — the review
      session never narrows to what the interface is showing.
- [ ] Given the same account, when `poolForDisplay` runs, then the pool contains
      only the language in focus.
- [ ] Given an account with languages but none in focus, then `poolForDisplay`
      reports `no-language` rather than guessing one.
- [ ] Given a learning language whose pool no longer ships, then
      `poolForScheduling` skips it and still returns the rest.

## Check

`npm test -- learning-languages`

## Open

- **Maintenance mode** (UC-025) adds a per-row state. Deliberately not modelled
  yet — it needs the combined budget to mean anything, and a column added now
  would be a guess about its shape.
- **Removing a language.** Rows in `review_log` survive by design, so the count
  would return if it were re-added. Whether the UI offers removal at all is a
  question for [`profile.md`](../page/profile.md), not for this adapter.
