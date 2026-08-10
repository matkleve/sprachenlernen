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
(UC-048). Contract: [`../service/time-scale.md`](../service/time-scale.md).

**Instant filters (UX, 2026-08-10):** skill, energy, and refine chips filter the
catalogue **in place** — no full page navigation, no scroll jump to the top. The
catalogue is already in memory; only method-card links navigate away.

## Scope

- **In:** stepped time slider ([`../service/time-scale.md`](../service/time-scale.md));
  skill and energy filter pills; optional refine (hands, voice, eyes); compact
  chip cards; hosted → session; off-app → detail; client-side filtering with URL
  sync (`history.replaceState`).
- **Out:** situation presets ("kitchen", "transit", …); saved custom situations;
  daily menu; learner-specific card fields; Commitments on this list.

**Reuse: Chip** (card facts), **Reuse: NavLink** (card links only).
**FilterPill** toggles filters in place — button geometry matching Chip, because
toggling a filter is not navigation. **MethodMenu** is a client island; the route
stays a Server Component.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/methods` | Whole catalogue until filters apply |
| 2 | Moves time slider | URL `?minutes=` updates to the nearest scale step (or `endless`); list shows methods whose shortest variant fits |
| 3 | Taps skill, energy, or refine | List intersects that dimension **without reloading the page**; scroll position preserved |
| 4 | Opens refine | Optional hands / voice / eyes constraints |
| 5 | Taps hosted card | Session route opens directly |
| 6 | Taps off-app card | Detail page |

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

`npm test -- method-menu method-menu-filter`

## Acceptance criteria

See [method-menu.acceptance-criteria.md](method-menu.acceptance-criteria.md).
