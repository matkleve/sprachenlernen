# Method card — destination marker (UX 2026-08-18)

<!-- parent: SPEC-component-method-card -->
<!-- use-case: UC-045 -->
<!-- status: superseded — routing AC merged into method-card.md 2026-08-19 -->

Owner + UX review 2026-08-18: cards carry enough facts (shields, duration,
requirements) but do not say **what happens on tap**. This supplement adds the
**destination marker** and summary hierarchy. Parent:
[`method-card.md`](method-card.md).

## Problem

| Today | Gap |
| --- | --- |
| Whole card is a `SurfaceLink` | No visible tap outcome |
| `summary` is `text-muted` | Session hook reads as secondary |
| Hosted/off-app chip on card | Redundant with requirement chips; misread as "not built" |

Routing already exists in `lib/method-session.ts` (`cardHrefForMethod`). The UI
does not surface it.

## Destination marker

**Placement:** top-right of the **card header** band — same zone as the section
label (label stays bottom-left). See [`method-card-header.md`](method-card-header.md).

**Not** a separate button. Not at the card bottom. Quiet text only — no border,
fill, scrim, or shadow.

### Two values only

Derived from `cardHrefForMethod` — not from `hosted` alone:

| Condition | Marker (EN key) | Tap goes to |
| --- | --- | --- |
| `usesWordsReview(method)` | **Start** (`card.destination.start`) | `/words/review?method=srs-session` |
| `usesExerciseRunner(method)` | **Start** | `/methods/{id}` — overview before `/practice` |
| Everything else | **Info** (`card.destination.info`) | `/methods/{id}` |

Off-app (`hosted: false`) and hosted-not-built both show **Info** — same tap
target, different detail footer copy ([`method-detail.supplement.md`](../page/method-detail.supplement.md)).
No third marker ("Anleitung") on the card.

### Accessibility

Inside the card link, the marker is visible text (not `aria-hidden`). The
existing `sr-only` badge summary stays; link accessible name should include the
marker value after the method name and summary.

## Summary typography

| Element | Class | Role |
| --- | --- | --- |
| Method name (`h3`) | `text-3xl font-semibold leading-tight text-ink` | Identity — unchanged |
| Summary | `text-sm text-ink line-clamp-2` | **Session hook** — what you do first |
| `doesNotDo` | `text-sm text-muted` | Limits — unchanged |

Catalogue field `summary` already means "what you actually do, in one line"
([`method-catalogue.md`](../service/method-catalogue.md)). No new data field.

## Property chips

**Remove** the hosted/off-app chip from cards. Keep:

- Duration chip(s) / range
- **All** requirement value chips (study/34 — display all)

Requirements (paper, headphones, speaker, …) already imply how the exercise runs.
Hosted intent stays on **detail** practical panel only.

## Acceptance criteria

- [ ] Given a runnable exercise method, when the card renders, then the header shows
      **Start** top-right and the link `href` is `/methods/{id}`.
- [ ] Given `srs-session`, when the card renders, then **Start** links to Words review.
- [ ] Given any non-runnable method (off-app or hosted-not-built), when the card
      renders, then the header shows **Info** top-right and the link `href` is
      the detail route.
- [ ] Given any method card, when it renders, then `summary` uses `text-ink`.
- [ ] Given any method card, when it renders, then no hosted/off-app chip
      appears in the property chip row.
- [ ] Given a card link, when a screen reader announces it, then the name
      includes the destination marker word (Start or Info).

## Check

`npm test -- method-card method-menu method-card-header`
