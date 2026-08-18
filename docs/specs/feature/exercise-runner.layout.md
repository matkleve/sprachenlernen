# Exercise runner — layout zones

<!-- parent: SPEC-feature-exercise-runner -->

Split from [`exercise-runner.md`](exercise-runner.md) to stay under the spec cap.

## Three zones (fixed frame)

The runner is a **column flex** that fills `--height-review-session` (mobile)
or `--height-practice-session` (desktop). Zones never reorder.

```
┌─ Chrome top (shrink-0) ─────────────────────┐
│ Hero · progress bar · timer (when active)    │
├─ Body (flex-1, overflow-y-auto) ────────────┤
│ Practice-surface step content               │
├─ Chrome bottom (shrink-0, anchored) ───────┤
│ Scrim · ◀ ▶ · primary CTA (bottom-right)    │
└─────────────────────────────────────────────┘
```

**Invariant:** footer controls stay at the **same vertical position** across
steps on one device — short steps do not pull the buttons up. Only the body
scrolls.

Parent layout mode: `one-screen-exercise` ([`page-layout.md`](page-layout.md)).
Words review keeps `one-screen-runner` (mobile only height; desktop scrolls).

## Content profiles

Recipe authors pick a profile per step component — not per Method.

| Profile | Step examples | Body behaviour |
| --- | --- | --- |
| **short** | prepare checklist, type-with-word, capture, offers | Fits in body; rarely scrolls |
| **scroll** | timed-write, long text-display, gap-fill | Body scrolls; footer scrim + anchored chrome |
| **paginated** | extensive-reading `text-display` (future) | Turns/pages inside body; chrome still anchored |

**Rule:** long reading text does **not** grow the page and push the footer down.
Use **scroll** (v1) or **paginated** (v2) inside the body zone.

## Footer scrim

When `overflow-y-auto` is active on the body, the footer shows a `canvas`
gradient above the control cluster so scrolled text fades before controls —
same idea as shell `FooterScrim`, local to the runner.

## Desktop vs mobile

| | Mobile (`< md`) | Desktop (`md+`) |
| --- | --- | --- |
| Shell mode | `one-screen-exercise` | same |
| Height token | `--height-review-session` | `--height-practice-session` |
| Page scroll | No | No |
| Footer anchor | Yes | Yes |

## Check

`npm test -- shell-page-layout exercise-runner`
