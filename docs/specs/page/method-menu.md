# Methods — narrow the catalogue in three questions

<!-- id: SPEC-page-method-menu -->
<!-- use-case: UC-045 -->
<!-- status: active -->

The app's front door at `/methods` ([ADR-0010](../../adr/0010-the-route-model.md)).
Three primary questions — **time**, **skill**, **energy** — narrow the catalogue;
an optional **refine** panel adds hands, voice, and eyes only when needed.
Hosted cards open the session directly; off-app cards open the detail page.

**UX revision 2026-08-09 (owner + two designer review):** the seven "where are
you" presets and eight-dimension custom builder were dropped. Learners found
them unclear and overwhelming; time as discrete chips was replaced by a slider.
The science still treats physical constraints as a hard filter when stated
(study/21), but they belong in refine, not as the front door.

**Time scale (UX, 2026-08-09):** the slider is **stepped**, not linear. Steps are
dense at the low end (2–15 min in small jumps) so a five-minute window is easy
to hit; they spread through hours and cap at **one day**; the final step is
**Endless**, which drops the time filter entirely so long-window methods appear
(UC-048). Contract: [`../service/time-scale.md`](../service/time-scale.md);
implementation: [`lib/time-scale.ts`](../../../lib/time-scale.ts).

**Instant filters (UX, 2026-08-10):** skill, energy, and refine chips filter the
catalogue **in place** — no full page navigation, no scroll jump to the top. The
catalogue is already in memory; only method-card links navigate away.

**Method badges (UX, 2026-08-15):** each card shows a **badge row** — skill
contribution, evidence label, effort label — above logistics chips (duration,
all requirements, hosted). Study/27; component
[`method-badge.md`](../component/method-badge.md).

**Property audit (UX, 2026-08-16):** study/34 — detail badge band shows skill tiers +
plain effort text only; evidence in Practical disclosure; effort anchor sentence in
Practical; **all** requirement chips on cards (owner: display all). Effort is always
plain text — never a dot scale.

**Card graphics (UX, 2026-08-15):** each card shows a **section header graphic**
(one abstract image per catalogue section, decorative) with a soft gradient into
the card body. Component [`method-card-header.md`](../component/method-card-header.md).

**Card visual polish (UX, 2026-08-18):** study/40 — shipped T-B10f (`h-24` header,
`text-lg` title, larger tier shields). Component
[`method-card.md`](../component/method-card.md).

No accent left border — uniform `rounded-card` only.

## Scope

- **In:** stepped time slider ([`../service/time-scale.md`](../service/time-scale.md));
  skill and energy filter pills; optional refine (hands, voice, eyes); method
  cards with badge row + logistics chips (duration, all requirements, hosted);
  **card-engine hosted** (`srs-session`) → Words review; other hosted → detail
  until built; off-app → detail; client-side filtering with URL sync
  (`history.replaceState`); **current standing** — one honest sentence from the
  progress reading, above the filters (T-B10 follow-up, narrowed); **daily
  three** — three method cards composed from the filtered catalogue (study/12,
  narrowed — evidence grade proxies for measured effect); **demonstration
  sentence** below standing ([`demonstration-sentence.md`](../feature/demonstration-sentence.md)).
- **Out:** situation presets ("kitchen", "transit", …); saved custom situations;
  daily menu; learner-specific card fields; Commitments on this list;
  CEFR skill or overall level on this surface; level-labelled demonstration
  feedback (tier C until calibration).

**Reuse: MethodCard** ([`method-card.md`](../component/method-card.md)),
**Reuse: MethodCardHeader** ([`method-card-header.md`](../component/method-card-header.md)
— section graphic), **Reuse: MethodBadge** (`features/method-menu/MethodBadge.tsx`
— tier shields + effort dots), **Reuse: Chip** (short tags only), **Reuse: NavLink**
(card links only).
**FilterPill** toggles filters in place — button geometry matching Chip, because
toggling a filter is not navigation. **MethodMenu** is a client island; the route
stays a Server Component.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 0 | Opens `/methods` with no language chosen | Redirects to the picker. Three of the four ways into the app — the confirmation link, OAuth, and simply signing in later — never pass through signup's redirect, so the guard lives on the destination |
| 1 | Opens `/methods` | Whole catalogue until filters apply; **current standing** appears above the filters when review history can be read |
| 2 | Moves time slider | URL `?minutes=` updates to the nearest scale step (or `endless`); list shows methods whose shortest variant fits |
| 3 | Taps skill, energy, or refine | List intersects that dimension **without reloading the page**; scroll position preserved |
| 4 | Opens refine | Optional hands / voice / eyes constraints |
| 5 | Taps hosted card that uses the card engine (`srs-session`) | `/words/review?method=srs-session` opens directly |
| 6 | Taps other hosted card | Detail page — session not built yet |
| 7 | Taps off-app card | Detail page |

## Current standing

**Provisional — card engine only.** Standing reads the vocabulary-size signal
from meaning-recall Tasks only — the same derivation as
[`progress.md`](progress.md), but not the full progress load on every
`/methods` visit. It reflects **meaning-recall Reviews from `srs-session`**, not
practice from other Methods (hosted or off-app). One sentence, never a CEFR label:

| History | Standing line |
| --- | --- |
| None | Nothing recorded yet — link to start a review session |
| Some, pool-local vocab has data | `{held} of {pool} lemmas held stably in your starter pool` plus link to `/progress` |
| Review log read fails | Standing omitted — the catalogue still renders; failure is not shown as "no progress" |

Skills are not named here until a skill signal has data (study/03). When input
or production engines ship, standing may gain additional lines — each must name
its source signal; nothing is folded into a single progress bar.

## Daily three

study/12's compromise: three cards, not the whole catalogue. Composed from the
**currently filtered** methods so context still governs first:

1. **Low intensity** — always one `intensity === 1` option when the pool has one.
2. **Strong evidence** — highest `evidence` grade in the pool (A > B > C > D).
   Per-learner effect estimates do not exist yet; grade is the v1 proxy.
3. **Variety** — a third pick from a different `section` when possible; stable
   for the calendar day via `pickDailyThree(methods, dayKey)` in
   `lib/daily-three.ts`.

Shown between standing and the filter controls. The full filtered list remains
below — the three are a starting point, not a gate.

**Hosted but unbuilt:** a Method may appear in the daily three even when its
engine is not built. Its card links to the detail page (honest not-built copy),
not to a fake session. Floors and evidence grades still govern **selection**;
readiness and engine availability govern **where the link goes**
([`method-engines.md`](../service/method-engines.md)).

Default slider position is **15 minutes** on first visit; the URL updates on
release, not on every intermediate drag frame.

## States

Filter state lives in a **client island** (`MethodMenu`). The URL is synced with
`history.replaceState` on every filter change — shareable and back/forward
compatible, but **no navigation** and no scroll reset. The catalogue is filtered
in memory; the server page does not re-run (`docs/ARCHITECTURE.md`, client-first
principle).

URL search parameters remain the bookmark format (`docs/STATE.md` §6).

## Check

`npm test -- method-menu method-menu-filter time-scale standing daily-three`

## Acceptance criteria

See [method-menu.acceptance-criteria.md](method-menu.acceptance-criteria.md).
