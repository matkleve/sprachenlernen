# Session sampling

<!-- id: SPEC-service-session-sampling -->
<!-- use-case: UC-011 -->
<!-- use-case: UC-019 -->
<!-- use-case: UC-079 -->
<!-- status: draft -->

Weighted selection of review cards for one SRS session. Replaces the binary
`due ≤ now` then fill-with-new rule in [`session-builder.md`](session-builder.md)
when T-W22 ships. FSRS still owns intervals and grades; this module only
**composes** the queue.

Study: [`archive/ARCH-043-early-foundation-sessions.md`](../../study/archive/ARCH-043-early-foundation-sessions.md),
[`archive/ARCH-044-foundation-phase-expert-review.md`](../../study/archive/ARCH-044-foundation-phase-expert-review.md).

## Scope

- **In:** `lib/session-sampling.ts` (weights, sample without replacement),
  integration in `lib/session-builder.ts`, caller inputs from
  `features/review-session/actions.ts` (held count, today's first-review count,
  today's grades per task, **active Lernwelt** from
  [`learner-world.md`](learner-world.md)). Form-recall **soft staging** weights
  live here, not in a hard gate. Optional per-card `samplingReason` for G1 copy
  (UC-005) — not Lernwelt labels by default ([`study/56`](../../study/56-lernwelt-single-choice.md)).
- **Out:** changing `applyReview` or FSRS weights; session-length picker (T-MV5);
  UC-071 same-session requeue; backlog counters (A3). **No hard caps** on new or
  resurfacing cards — load is reduced by **probability** only.

## Behavior

| # | Input | System response |
| --- | --- | --- |
| 1 | Pool + task states + `now` | Builds candidate list (respects deck filter, sibling dedup per `wordId`, form staging floor — see supplement) |
| 2 | Each candidate task | Computes weight `wᵢ = uᵢ × bᵢ × nᵢ × fᵢ × worldMatchᵢ` (supplement); `u` from FSRS retrievability; `worldMatch` from active Lernwelt (T-W24) |
| 3 | Session length L (default 15) | Draws L distinct cards by weighted sampling without replacement |
| 4 | `held_meaning_recall` high | Foundation factor `φ(H) → 0`; sampling ≈ retrievability-only |
| 5 | Many new cards already today | `nᵢ` down-weights remaining **new** candidates — never zero |
| 6 | `again`/`hard` earlier today | `bᵢ` boosts that task — not guaranteed; higher weight |
| 7 | Last grade today `good`/`easy` | No struggle boost on that task (owner 2026-08-20) |
| 8 | Queue entry | May carry `samplingReason` for UI: `low-recall`, `struggled-today`, `new-throttled`, `form-staging`, `frequency` |

**Deck filter (UC-078):** applied before candidates, unchanged from session-builder.

**Sibling rule:** at most one task per `wordId` in the drawn set — unchanged.

**Determinism:** callers may pass `rng` seed in tests; production uses secure
random. Same inputs + seed → same queue (AC in supplement).

## States

Pure function — no UI machine.

## Data

| Field | Source | Notes |
| --- | --- | --- |
| `heldMeaningRecall` | vocabulary snapshot | Drives `φ(H)` |
| `newFirstReviewCountToday` | review log / caller | Drives `nᵢ` for new tasks |
| `gradesTodayByTaskId` | review log / caller | Last grade per task, local calendar day |
| `activeWorld` | [`learner-world.md`](learner-world.md) | Drives `worldMatch`; `general` → factor 1 |
| `config` | `DEFAULT_SAMPLING_CONFIG` | Six tunables — supplement |

## Acceptance criteria

See [`session-sampling.acceptance-criteria.md`](session-sampling.acceptance-criteria.md).

## Relationship to session-builder

Until T-W22 ships, `buildSession` keeps binary due/new selection. After T-W22,
`buildSession` delegates card picking to this module; due dates are **not**
moved by sampling alone.

## Check

`npm test -- session-sampling session-builder`
