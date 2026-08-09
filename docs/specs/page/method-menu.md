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

**Time scale revision 2026-08-09 (UX):** the slider is **stepped**, not linear.
Steps are dense at the low end (2–15 min in small jumps) so a five-minute
window is easy to hit; they spread out through hours and cap at **1 day**; the
final step is **Endless**, which drops the time filter entirely so long-window
methods appear (UC-048). URL: `?minutes=<step>` or `?minutes=endless`.

## Scope

- **In:** stepped time slider (2 min → 1 day → **Endless**); skill chips; energy chips; optional refine
  (hands, voice, eyes); compact chip cards; hosted → session; off-app → detail.
- **Out:** situation presets ("kitchen", "transit", …); saved custom situations;
  daily menu; learner-specific card fields; Commitments on this list.

**Reuse: Chip**, **Reuse: NavLink**. **Time slider** is a client island only.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/methods` | Whole catalogue until filters apply |
| 2 | Moves time slider | URL `?minutes=` updates to the nearest scale step (or `endless`); list shows methods whose shortest variant fits |
| 3 | Taps skill or energy | List intersects that dimension |
| 4 | Opens refine | Optional hands / voice / eyes constraints |
| 5 | Taps hosted card | Session route opens directly |
| 6 | Taps off-app card | Detail page |

Default slider position is **15 minutes** on first visit; the URL updates on release.

Time steps are defined in [`lib/time-scale.ts`](../../../lib/time-scale.ts) — dense below 15 min, sparse up to 1440 min (1 day), then endless.

## States

URL search parameters are the single source of truth (`docs/STATE.md` §6).

## Check

`npm test -- method-menu`

## Acceptance criteria

See [method-menu.acceptance-criteria.md](method-menu.acceptance-criteria.md).
