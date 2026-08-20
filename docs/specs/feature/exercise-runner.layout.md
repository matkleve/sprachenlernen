# Exercise runner — layout zones

<!-- parent: SPEC-feature-exercise-runner -->

Split from [`exercise-runner.md`](exercise-runner.md) to stay under the spec cap.

## Three zones (fixed frame)

The runner is a **column flex** that fills `--height-review-session` (mobile)
or `--height-practice-session` (desktop). Zones never reorder.

```
┌─ Chrome top (shrink-0) ─────────────────────┐
│ Hero · step label · stop                     │
├─ Body (flex-1) ─────────────────────────────┤
│ Practice-surface step content               │
│ short: overflow-hidden · scroll: overflow-y │
├─ Chrome bottom (shrink-0, anchored) ───────┤
│ Segmented step bars · Schritt n/m · timer   │
│ Scrim · ◀ ▶ · primary CTA (bottom-right)    │
└─────────────────────────────────────────────┘
```

**Step segments** (one bar per recipe step, not a single fill line). Visual
colour is resolved from **`activeStepIndex` + `stepStatuses[i]`** — not from
status alone (same pattern as review session's run status strip: current card =
primary fill).

| Visual | Condition | Token |
| --- | --- | --- |
| **active** | `i === activeStepIndex` **and** status ≠ `done` | `bg-accent` (primary) |
| **done** | status = `done` (even when navigated back to that step) | `bg-accent-soft` (`dark:bg-accent/35`) |
| **seen** | status = `seen`, not active, not done | `bg-line-strong/45` |
| **unseen** | status = `unseen` | `bg-line` |
| **skipped** | status = `skipped` (future v1 — no skip UI yet) | `bg-line` (same as unseen until skip ships) |

**Resolution order:** `done` → then `active` → then `seen` / `unseen` / `skipped`.
The current step must read as **primary** while it is still open; completed steps
stay light accent when the learner moves on.

**Invariant:** footer controls stay at the **same vertical position** across
steps on one device. **Short-profile steps never show a body scrollbar** — content
and chrome are sized to the fit frame ([`study/41`](../../study/41-practice-surface-ux.md)).
Only **scroll** / **paginated** profiles use `overflow-y-auto` on the body.

Parent layout mode: `one-screen-exercise` ([`page-layout.md`](page-layout.md)).
Words review keeps `one-screen-runner` (mobile only height; desktop scrolls).

## Content profiles

Recipe authors pick a profile per step component — not per Method.

| Profile | Step examples | Body behaviour |
| --- | --- | --- |
| **short** | prepare checklist, type-with-word, capture, offers | `overflow-hidden`; content fits frame |
| **scroll** | long `material-preview` | `overflow-y-auto`; footer scrim |
| **paginated** | extensive-reading `text-display` (future) | scroll until turns ship; chrome anchored |

Resolver: `lib/exercise-runner/content-profile.ts`.

**Rule:** long reading text does **not** grow the page and push the footer down.
Use **scroll** (v1) or **paginated** (v2) inside the body zone.

## Fit-frame density (`practice-fit-frame`)

When layout mode is `one-screen-exercise`, the runner root carries
`practice-fit-frame`. One system for **every** hosted Method — not a per-method
`compact` flag. Research: [`study/42`](../../study/42-exercise-mobile-fit-frame.md).

| Tier | Breakpoint | Top chrome | Progress | Footer |
| --- | --- | --- | --- | --- |
| Mobile fit | `< md` | 2.75rem strip (step + stop) — **no hero image** | Thin bar in footer | ◀ ▶ + primary one row |
| Desktop | `md+` | 5rem hero belt + metadata | Under hero + label | ◀ ▶ above primary |

Frame math: `lib/exercise-runner/frame-budget.ts`. Research:
[`study/42`](../../study/42-exercise-mobile-fit-frame.md).

## Footer scrim

When `overflow-y-auto` is active on the body, the footer shows a `canvas`
gradient above the control cluster so scrolled text fades before controls —
same idea as shell `FooterScrim`, local to the runner.

**Scroll padding:** body zone uses `p-1` so control focus rings (`ring-2` +
`ring-offset-2`) are not clipped by the scroll container.

## Desktop vs mobile

| | Mobile (`< md`) | Desktop (`md+`) |
| --- | --- | --- |
| Shell mode | `one-screen-exercise` | same |
| Height token | `--height-review-session` | `--height-practice-session` |
| Page scroll | No | No |
| Footer anchor | Yes | Yes |

## Check

`npm test -- shell-page-layout exercise-runner`
