# ADR-0012 — Session requeue, localization storage, leech detection, and nav

- **Status:** Accepted
- **Date:** 2026-08-12
- **Context:** [`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md) decisions 10–16;
  [UC-069](../use-cases/UC-069-use-the-app-in-my-own-language.md),
  [UC-071](../use-cases/UC-071-get-a-wrong-card-back-before-the-session-ends.md),
  [UC-013](../use-cases/UC-013-stop-losing-time-on-one-card.md),
  [`I18N.md`](../I18N.md), [ADR-0009](0009-three-destinations.md)

## Context

Seven product decisions were discussed across several sessions and recorded in
`IMPLEMENTATION-PLAN.md`, but agents kept re-asking or contradicting them because
they lived only in a long backlog file alongside stale prose. This ADR is the
durable record — one place that outranks the plan when they disagree.

## Decision

### 12 — Same-session repeats do not count toward UC-013 leech suspend

Cross-session failures only. A same-run repeat ([UC-071](../use-cases/UC-071-get-a-wrong-card-back-before-the-session-ends.md))
is a within-sitting rehearsal buffer; UC-013 suspension is a cross-session
diagnosis. One bad afternoon must not hide a card the learner is still correcting.

### 13 — Same-session requeue distances (Anki-style)

| Grade | Requeue |
| --- | --- |
| `again` | Re-insert **5 positions ahead** (after the next card), or at end if fewer than 5 remain |
| `hard` | Re-insert at **end of the remaining queue** |
| `good` / `easy` | No requeue |

No learner-visible indicator that a repeat is coming. The session's advertised
total is the count of **distinct** `taskId`s in the built queue (UC-039); repeats
do not inflate it. Every graded attempt still appends one `review_log` row.

### 10 — Where non-English description text lives

Two surfaces, two [`I18N.md`](../I18N.md) stages:

- **App chrome** (menus, buttons, grade labels, errors): **stage 1** — `next-intl`,
  `messages/<locale>.json`.
- **Card description text** (what describes a word): **stage 3** — `app_texts` +
  `app_text_translations`, keyed by (`wordId`, spoken language),
  `status ∈ (draft, reviewed, published)`. Runtime reads a **snapshot JSON** at
  build/cache invalidation, never a query per card. English seeded from Kaikki;
  other locales MT → review → publish.

### 11 — One string per card face per spoken language

No split into definition / hint / instruction parts for v1. Form-recall fronts
like *"to run — write the Spanish form"* are one translatable row per locale when
description text is localized; instruction wording for form-recall is composed at
render time from `features/review-session/content.ts` (see form-recall-pool spec).

### 14 — Broken-card detection: both, by tier

Per [`IDEAS.md`](../IDEAS.md): tier 1 (static candidates) at **build time**;
tier 2 (leech threshold) and tier 3 (tap-to-confirm) **per learner**.

### 15 — Neighbour-word collision threshold (v1)

Levenshtein distance **1** only; both lemmas length **3–8**; **candidate** only,
never auto-diagnose. Distance 2 rejected for v1. Build gate script required.

### 16 — Progress stays a top-level destination

Methods · Words · Progress. Profile remains the corner chip ([ADR-0009](0009-three-destinations.md)).
Moving Progress under Profile is rejected — study 03's honesty apparatus needs its
own surface.

## Alternatives considered

- **Combined daily budget across languages** — rejected 2026-08-12; see UC-025.
- **Split card description into named parts** — rejected for v1 (decision 11).
- **Per-learner-only neighbour detection** — rejected; tier 1 is build-time.
- **Progress under Profile** — rejected (decision 16).

## Consequences

- **T-B13**, **T-B14**, and **T-B11** are spec-ready; implementation may proceed.
- Requeue is **client-only session state**; FSRS cross-session math unchanged.
- Localization needs a migration for `profiles.spoken_language` and stage-3 text
  tables before non-English card descriptions ship.
- `IMPLEMENTATION-PLAN.md` decisions 10–16 should cite this ADR, not restate them.
