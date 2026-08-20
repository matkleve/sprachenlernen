# 44 · Foundation phase — expert panel review

**Status:** study only — no implementation.  
**Brief:** Owner wants same-day return in sessions 2–3 while the base is small,
likes that **easy/good** cards do not keep coming back, fears opaque layering on
top of FSRS. This chapter records a structured review from two roles — **data
scientist (DS)** and **language teacher (LT)** — and a single recommended design.

Parent: [43](43-early-foundation-sessions.md). Decisions locked elsewhere:
[ADR-0012](../adr/0012-ux-decisions-requeue-i18n-leech-nav.md) (requeue),
[26](26-readiness-and-difficulty.md) (targeting not gating).

---

## P0 · Clarification — what already happens today

Two different mechanisms; learners (and owners) often conflate them.

### A · Inside one session (UC-071, ADR-0012 decision 13)

| Grade | Same session? | Where |
| --- | --- | --- |
| **`again`** (falsch / nicht gewusst) | **Yes** — re-inserted ~5 cards later, or at end if queue shorter | Client requeue only |
| **`hard`** (schwer / unsicher) | **Yes** — re-inserted at **end of remaining queue** | Client requeue only |
| **`good`** / **`easy`** | **No** — card leaves the run | — |

Repeats in the same run **do not change** the advertised distinct card count
(UC-039). Each grade still writes one row to `review_log` and FSRS updates `due`.

### B · Between sessions on the same day

| Grade in session 1 | Typical FSRS effect | In session 2 same day? |
| --- | --- | --- |
| **`again`** | Short interval; often **due again** within hours | **Often yes** — if `due ≤ now` when session 2 builds |
| **`hard`** | Shorter than `good`, longer than `again` | **Sometimes yes** — depends on stability / state |
| **`good`** / **`easy`** | Interval pushed forward (often **tomorrow+**) | **Usually no** — by design |

**Owner intuition confirmed:** struggling cards (`again`/`hard`) are the ones
most likely to return quickly — **within** a session via requeue, **across**
sessions via FSRS if still due. **Easy/good** cards correctly disappear for the
rest of the day unless nothing else is schedulable and they are still `new`/due.

**The gap** is not `again`/`hard` — it is **`good` on a fragile word** (first
success) and **words that are not due yet** but should still consolidate the
base on day one. That is what foundation resurfacing addresses — and it should
**not** pull `easy`/`good` words the learner just cleared.

---

## P1 · Data scientist review

**Role:** memory model, schedule transparency, regression risk.

### P1a · Keep one source of truth

> **Do not add a second scheduler.** FSRS sets `due`, stability, and state.
> Foundation phase only changes **which due+eligible cards enter the next
> session queue** — a thin **composer** on top, not a parallel algorithm.

If resurfacing changes `due` or writes fake reviews, intervals collapse and G1
("why now?") lies. Resurfacing must be **ungraded exposure** or **selection only**.

### P1b · Minimise parameters (v1)

| Parameter | Proposed default | Rationale |
| --- | --- | --- |
| Foundation **on** when | `held_meaning_recall < 50` | Owner anchor; recalibrate with data |
| **Resurfacing slots** per session | `min(5, floor(sessionLength / 3))` | Visible, bounded — not half the deck |
| **New cap** while foundation on | `min(5, sessionLength - resurfacing)` | Stops 15-new-word days |
| Resurfacing **eligibility** | See P3 table — **exclude last grade `good`/`easy` same day** | Matches owner preference |
| Retrievability sampling (F217) | **Defer** | Third mental model; add only if v1 insufficient |

### P1c · Measurability

Log per built session (analytics, not learner UI):

- `foundationPhase: boolean`
- `resurfacedTaskIds: string[]`
- `resurfacedReason: 'again_today' | 'hard_today' | 'fragile_one_success'`

Success metrics after ship:

1. **Session-2 same-day overlap** — share of lemmas from session 1 that appear
   in session 2 (target: median ≥ 0.25 while foundation on).
2. **7-day retention** on first-50 lemmas — must not drop vs baseline.
3. **Empty session rate** on `deck=form` — should fall when soft staging ships.

### P1d · Verdict (DS)

**Approve** one composer layer with hard caps. **Reject** probability stacks,
retrievability sampling, and form-weight ramps in the same release. Ship
foundation resurfacing + new cap first; measure; then form staging v2.

---

## P2 · Language teacher review

**Role:** acquisition order, learner affect, classroom parallels.

### P2a · Pedagogical alignment

| Principle | Classroom analogue | Product mapping |
| --- | --- | --- |
| **Struggling items return same day** | Teacher recycles errors at end of lesson | UC-071 requeue + FSRS short interval for `again`/`hard` ✓ |
| **Confident items sleep** | "Good, we move on" — not drilled again same hour | `good`/`easy` absent until due ✓ |
| **New words capped early** | First lessons recycle a small set before adding 20 more | Foundation new cap (P1b) |
| **Form after meaning, not after a week of silence** | Learners meet *läuft* soon after *laufen*, not after a vocabulary test | **Form staging is the real pain** — soft ramp is LT-priority **after** resurfacing |

### P2b · What not to do

- **Do not** resurface every word graded `good` the same day — feels like the
  app ignores success ([25](25-why-it-does-not-feel-productive.md) P2).
- **Do not** teach full paradigms in week one — one surface form per lemma
  (shipped pool) is enough.
- **Do not** hide the rule — one sentence on Words home while foundation is on:
  *"Base building: a few words from earlier today come first; new words are
  limited until your core is wider."*

### P2c · Resurfacing eligibility (LT Refinement of P3)

**Include in same-day resurfacing pool:**

1. Last grade today was **`again` or `hard`** (any session earlier today).
2. **Fragile** with exactly **one** successful review ever and reviewed earlier
   today (first `good` still fragile — worth one more pass).
3. Optional: **`again`/`hard` from yesterday** if still fragile and foundation
   on — **v2**; not v1.

**Exclude:**

- Last grade today **`good` or `easy`** — owner preference; LT agrees.
- **Held** tasks — already "known" for counting purposes.
- **Suspended / retired**.

### P2d · Verdict (LT)

**Approve** foundation resurfacing focused on **struggle + first-touch fragile**,
not on easy wins. **Approve** keeping UC-071 as-is. **Request** soft form
staging as **phase 2** — empty Formen path hurts motivation more than missing
same-day `good` recycling.

---

## P3 · Synthesised design — one layer, one sentence

### The sentence (learner-facing)

> **While you're building your first core words, each session starts with a few
> words from earlier today — especially ones you found hard — and adds only a
> handful of new ones.**

### The algorithm (engineer-facing) — three steps only

```
1. FSRS  →  each task has due, stability, state (unchanged)
2. Pool  →  due now + new + eligible resurfacing candidates (foundation only)
3. Pick  →  fill session: [resurfacing slots] → [due by overdue] → [new up to cap]
```

No step 4. No probability table. G1 still explains each card via FSRS; resurfaced
cards get one extra line: *"Back today to strengthen your base."*

### Composer table (normative draft for future spec)

| Slot order | Source | Cap |
| --- | --- | --- |
| 1 | Resurfacing (P2c rules) | ≤ 5 |
| 2 | FSRS due (`due ≤ now`) | fill to session length |
| 3 | New (`reviews.length === 0`) | ≤ 5 while foundation on |

Sibling rule (one task per word per session) **unchanged**. Deck filter
(`meaning`/`form`/`mixed`) **unchanged**.

### What we explicitly do **not** ship in v1

| Idea | Why deferred |
| --- | --- |
| F217 retrievability sampling | Extra layer; hard to explain in G1 |
| Resurfacing `good`/`easy` same day | Owner + LT reject |
| Changing `due` on resurfacing | DS reject — breaks FSRS truth |
| Form 7-day hard gate removal | Separate slice; pairs with resurfacing but own spec |

---

## P4 · Panel consensus

| Question | DS | LT | Consensus |
| --- | --- | --- | --- |
| Do `again`/`hard` return in the **same** session? | Yes (requeue) | Yes — essential | **Keep UC-071** |
| Should `easy`/`good` bounce back same day? | Only if fragile+one success edge case | No for clear `good`/`easy` | **Exclude last grade good/easy** |
| One composer layer enough? | Yes if capped | Yes if copy is honest | **T-W22 v1 scope** |
| Form staging now? | Phase 2 | Phase 2 | **After resurfacing ships** |
| Risk to transparency? | Low if FSRS untouched | Low if one home sentence | **G1 + one line per resurfaced card** |

---

## P5 · Implementation map (unchanged from ch 43, narrowed scope)

| Artefact | v1 scope |
| --- | --- |
| `docs/specs/service/foundation-phase.md` | Composer rules P3 only |
| `lib/foundation-phase.ts` | `isFoundationPhase`, `resurfacingCandidates`, caps |
| `lib/session-builder.ts` | Slot order P3 |
| `features/review-session/actions.ts` | Load today's grades for eligibility |
| UC-079 | Learner story — session 2 sees hard words from session 1 |

**Out of v1:** `session-sampling.md`, F217, soft form ramp (F218).

---

## P6 · Open for owner sign-off

1. **Threshold 50 held** — fixed or configurable in Profile later?
2. **First `good` fragile** — include in resurfacing (LT yes, one extra pass) or
   exclude (stricter owner reading)? **Panel recommends include** — only when
   `reviews.length === 1` and success was `good`, not `easy`.
3. **GO to spec UC-079 + `foundation-phase.md`** before code?

---

## Sources

| Role | Basis |
| --- | --- |
| DS | FSRS contract, session-builder, ADR-0012, ch 43 F2d |
| LT | E2/E3 [02](02-evidence.md), ch 26 targeting, ch 04 card staging, owner brief |
