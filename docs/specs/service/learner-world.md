# Learner world (Lernwelt)

<!-- id: SPEC-service-learner-world -->
<!-- use-case: UC-019 -->
<!-- use-case: UC-011 -->
<!-- status: draft -->

Persisted **Lernwelt** preference per learning language. One flat `worldId`
choice weights session composition and content pickers — it does **not** change
FSRS intervals or stored `due` dates ([`study/56`](../../study/56-lernwelt-single-choice.md)
W9, UC-005).

## Scope

- **In:** `worldId` enum; read/write per `(user_id, language_code)`;
  `lib/learner-world.ts`; `worldMatch` factor for
  [`session-sampling.md`](session-sampling.md); `activeWorld` passed to Words
  and method runners; lemma `worlds[]` tags on pool rows (read-only v1).
- **Out:** multi-select worlds; per-world retention dial; changing
  `applyReview` or scheduler weights; visible unit progress; hidden situation
  tags; fixed card quotas per world.

## Behavior

| # | Input | System response |
| --- | --- | --- |
| 1 | New learning language, no row | Default `worldId = general` |
| 2 | `setWorld(language, worldId)` | Persists; returns previous id for switch UI |
| 3 | `getWorld(language)` | Current `worldId` + `setAt` |
| 4 | Session build | Caller passes `activeWorld` into sampling + example picker |
| 5 | Method runner start | Receives same `activeWorld` as Words |
| 6 | World switch | All held lemmas and review history unchanged; FSRS due unchanged |
| 7 | `worldId = general` | `worldMatch = 1` for every candidate — frequency path only |

**FSRS boundary:** Lernwelt affects **which** due/new card wins a slot, never
**when** a card becomes due. Non-matching-world cards that are due still appear
with normal urgency `uᵢ`; they are not hidden or pulled early.

## World ids

| `worldId` | Learner label (DE v1) |
| --- | --- |
| `business` | Business |
| `everyday` | Alltag |
| `technical` | Technik |
| `politics` | Politik |
| `nature` | Natur & Garten |
| `general` | Allgemein |

Peers — not hierarchy. Politik and Natur are Lernwelten, not topics under
Business.

## Session weight `worldMatch`

For candidate task `i` with lemma tag set `Wᵢ` (may be empty):

```
worldMatchᵢ = 1                              if activeWorld = general
worldMatchᵢ = γ                              if activeWorld ∈ Wᵢ
worldMatchᵢ = 1                              otherwise
```

Default `γ = 1.5` (`DEFAULT_LEARNER_WORLD_CONFIG.gammaMatch`). Never zero —
non-world cards stay in the pool.

Lemma may tag multiple worlds (e.g. *presupuesto* → `business`, `politics`).
Match if **any** tag equals `activeWorld`.

Integrated into sampling as `wᵢ = uᵢ × bᵢ × nᵢ × fᵢ × worldMatchᵢ` — see
[`session-sampling.supplement.md`](session-sampling.supplement.md).

## Switching mid-course

| Concern | Rule |
| --- | --- |
| Held lemmas | All stay |
| Due reviews | Run when FSRS says so — any world |
| New introductions | Weight toward new `activeWorld` from next session |
| Example sentences | Bank pick prefers new world (+ neutral glue) |
| Catalogue / methods | Filter bias toward new world; learner may override per run |
| UI | One confirmation when world changes — not on every session |

No reset, no discard, no punishment.

## States

Not a UI machine. Adapter returns `ok | error` like
[`learning-languages.md`](learning-languages.md).

## Data

```sql
create table public.learner_world (
  user_id uuid not null references auth.users (id) on delete cascade,
  language_code text not null,
  world_id text not null check (world_id in (
    'business', 'everyday', 'technical', 'politics', 'nature', 'general'
  )),
  set_at timestamptz not null default now(),
  primary key (user_id, language_code)
);
```

RLS: owner read/write only. FK optional to `learner_language` — same pair as
active learning language rows.

Pool JSON (v1 content): optional `worlds: string[]` on lemma — same id strings.

## Acceptance criteria

See [`learner-world.acceptance-criteria.md`](learner-world.acceptance-criteria.md).

## Relationship to withdrawn models

Register + topic two axes, hidden `situation:*`, 2–3 card quotas, and 60-day
decay are **withdrawn** — [`study/56`](../../study/56-lernwelt-single-choice.md).

## Check

Pending T-W23. Until `lib/learner-world.test.ts` exists, verify via
`npm run check:specs` only.
