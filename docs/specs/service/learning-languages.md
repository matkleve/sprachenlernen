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
  filtering of Progress and Words; maintenance mode (UC-025, later — a combined
  cross-language budget is **not** a later item, it is rejected, see UC-025);
  interface translation, which is a different axis entirely and is at stage 0
  ([`I18N.md`](../../I18N.md)).

## The distinction this spec exists to hold

[`GLOSSARY.md`](../../GLOSSARY.md) defines both, and they must not merge:

- **Learning language** — a language this Account is learning. Several possible.
  Owns its Reviews, vocabulary reading and calibration.
- **Active language** — the one in focus in the interface. Exactly one. Decides
  **both what is displayed and what a session schedules from** (corrected
  2026-08-12 — see "One pool, one function" below; it used to decide display
  only).

**Engines are per learning language.** Reviews, the starter pool, and Progress
readings are scoped to the language in focus — on display surfaces and in the
review session alike. There is no separate "scheduling view" that sees more
languages than the interface does.

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

## One pool, one function

**Corrected 2026-08-12.** `lib/db/learner-pools.ts` used to expose two
functions, `poolForScheduling` (every learning language, concatenated) and
`poolForDisplay` (the active language only), because scheduling and display
were meant to see different things under the now-rejected combined budget.
That reason is gone, so there is one function instead:

| | Contains | Used by |
| --- | --- | --- |
| `poolForActiveLanguage` | the **active** language only, and nothing else | the review session, `/progress`, `/words`, the standing line — every surface, now the same way |

Task ids still carry their language (`es:el:meaning-recall`), which was needed
for the old concatenation and stays true, but is no longer load-bearing for
anything here since a pool never holds more than one language's cards. A
language whose pool stopped shipping still errors rather than silently falling
back to a different learning language — it is never substituted, only named.

**No destination renders for an account with no language.** The pool returns
`no-language` and every caller routes to the picker — `/methods`, `/progress`,
`/words` and the review session alike. The guard is on the **destination**, not
on signup: there are four ways into the app (immediate-session signup, the
confirmation link, OAuth, and signing in later) and only the first passes
through signup's redirect, so guarding the entrance left three unasked. "Not
measured" is a statement about a learner who has been asked; it must not be
shown to one who has not.

`buildSession` (`session-builder.md`) itself still takes no language
parameter and stays agnostic to which language its pool belongs to — this
module is where "never more than one language at once" is actually enforced,
by never asking for more than the active language in the first place.

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
      `poolForActiveLanguage` runs, then the pool contains **only** the
      language in focus — a session never draws from a language the interface
      is not showing.
- [ ] Given an account with languages but none in focus, then
      `poolForActiveLanguage` reports `no-language` rather than guessing one.
- [ ] Given the language in focus has no shipped pool, then
      `poolForActiveLanguage` errors rather than silently falling back to
      another learning language.

## Check

`npm test -- learning-languages`

## Not yet applied

⚠ **The migration has never been executed anywhere** — not on the live project,
not locally. Every destination reads this table, so until it runs they all show
the error surface. Steps and the checks to run afterwards:
[`plans/apply-learner-language.md`](../../plans/apply-learner-language.md).

## Open

- **Maintenance mode** (UC-025) adds a per-row state — enough review to hold
  what exists, no new material, for one language independent of any other.
  Deliberately not modelled yet — the shape of that state (a boolean? a target
  retention override?) is still a guess, not the combined budget, which UC-025
  no longer has.
- **Removing a language.** Rows in `review_log` survive by design, so the count
  would return if it were re-added. Whether the UI offers removal at all is a
  question for [`profile.md`](../page/profile.md), not for this adapter.
