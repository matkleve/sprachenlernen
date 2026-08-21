# UC-079 — Build a core vocabulary with natural repetition

<!-- id: UC-079 -->
<!-- specs: SPEC-service-session-sampling, SPEC-service-session-builder, SPEC-feature-words-home, SPEC-feature-review-session -->

**Who:** a beginner or returning learner building their first stable word base —
they do two or three short sessions in an evening and expect words from the
first session to show up again, especially ones they struggled with.
**Wants to:** grow vocabulary without feeling like a conveyor belt of endless
new cards, and without the app going silent after a good session.
**So that:** the base actually sticks before long FSRS intervals kick in.

Derived from owner review 2026-08-20, [`archive/ARCH-043-early-foundation-sessions.md`](../study/archive/ARCH-043-early-foundation-sessions.md),
[`archive/ARCH-044-foundation-phase-expert-review.md`](../study/archive/ARCH-044-foundation-phase-expert-review.md).
Implements study decision: **probabilistic load reduction**, not hard caps
(T-W22).

## Today

The session builder includes a card only if `due ≤ now` or it is new. After
`good`/`easy`, the card disappears until its FSRS interval elapses — often the
next day. Session 2 on the same day can be almost all new words. Form-recall
stays locked until meaning is **held** (7-day stability). See ch 43–44.

## Success looks like

- Card selection uses **weighted sampling** from FSRS retrievability plus soft
  foundation bias — [`session-sampling.md`](../specs/service/session-sampling.md).
- **No hard cap** on new or resurfacing cards; high load **reduces probability**
  (`exp(−λ · N_newToday)`).
- Foundation taper uses **sigmoid on held count** — no cliff at 50 lemmas.
- Struggling words (`again`/`hard` today) are **more likely** in the next session;
  clear `good`/`easy` today are **not** boosted (except one fragile first success).
- Words home shows a short **base-building** line while `φ(H)` is meaningful.
- Optional per-card **why in this session** reason for G1 (UC-005 follow-on).
- Form-recall enters via **soft staging weight**, not a binary gate (pairs with UC-078).

## Out of scope

Changing FSRS formulas; daily streak gamification; placement test; full paradigm
engine (T-W6).

---

## Scenarios and how learners react

Each scenario states the **likely felt experience**, the **risk if we get it
wrong**, and what **success** looks like. For formulas see
[`session-sampling.supplement.md`](../specs/service/session-sampling.supplement.md).

### R1 · First session — everything is new

**Situation:** Day 1, first ever review, 15 cards.

| | |
| --- | --- |
| **Likely reaction** | "OK, lots of new words — that's what I expected." |
| **Risk** | Too many hard failures → quit ([02](../study/STUDY-002-evidence.md) E3). |
| **Success** | UC-071 catches `again` inside the run; no false promise of repeats yet. |

### R2 · Second session same day — first session went well

**Situation:** Mostly `good`/`easy` in session 1; opens session 2 two hours later.

| | |
| --- | --- |
| **Likely reaction (today)** | "Where did my words go? Only new stuff." → mistrust ([25](../study/STUDY-023-why-it-does-not-feel-productive.md) P2). |
| **Likely reaction (target)** | "A few from before came back, plus some new — feels like building." |
| **Risk** | Resurfacing *everything* including easy → "I already knew that" annoyance. |
| **Success** | ~30–50% overlap with session 1 lemmas (stochastic); **no** boost for last grade `good`/`easy`. |

### R3 · Second session same day — first session was rough

**Situation:** Several `again`/`hard` in session 1.

| | |
| --- | --- |
| **Likely reaction** | "Good — it's quizzing me on what I missed." |
| **Risk** | >80% repeats, no new words → boredom or shame spiral. |
| **Success** | Struggle boost raises weight, not certainty; some new cards still appear via `nᵢ` > 0. |

### R4 · Third session same day

**Situation:** Two sessions done; `N_newToday` already 8–10.

| | |
| --- | --- |
| **Likely reaction (today)** | Another 15 new — "I'm drowning." |
| **Likely reaction (target)** | "Mostly review now; only a couple new." |
| **Risk** | Hard daily cap feels like punishment. |
| **Success** | `exp(−λN)` makes new **unlikely** but not forbidden; session may be <15 cards. |

### R5 · Crossing ~50 held — no cliff

**Situation:** Learner goes from 48 → 52 held over a week.

| | |
| --- | --- |
| **Likely reaction (hard cliff)** | "The app changed — forms still empty / only new again." |
| **Likely reaction (sigmoid)** | Imperceptible shift toward long-interval FSRS. |
| **Success** | `φ(H)` smooth; copy on Words fades out, not switches off. |

### R6 · Steady state (~50+ held, one session per day)

**Situation:** Regular habit, mixed grades.

| | |
| --- | --- |
| **Likely reaction** | "Mix of old and new — about right." (~35% new / 65% review typical). |
| **Success** | Sampling ≈ retrievability-only; G1 explains each card. |

### R7 · Steady state — two sessions, morning perfect

**Situation:** Session 1 all `good`; afternoon session 2.

| | |
| --- | --- |
| **Likely reaction (worst)** | "Punished for doing well — 12 new words I never saw." |
| **Mitigation** | Low `R` fragile pool + honest copy: urgent queue cleared. |
| **Success** | New share lower than session 1 but non-zero; learner understands why. |

### R8 · Formen üben early

**Situation:** 10 meanings reviewed once; opens `deck=form`.

| | |
| --- | --- |
| **Likely reaction (today)** | "Nothing to review" — feels broken. |
| **Likely reaction (target)** | Occasional form cards when meaning has ≥1 success. |
| **Success** | Soft `fᵢ`; empty queue only when truly no form candidates. |

### R9 · "Nothing to review"

**Situation:** Queue < 15 or empty.

| | |
| --- | --- |
| **Likely reaction** | "I'm done" vs "Bug?" |
| **Success** | Distinguish empty pool from light day; never invent cards. |

---

## Links

- Implementation slice: **T-W22** in [`plans/words.md`](../plans/words.md)
- UC-071 (same-session requeue) unchanged
- UC-078 (`deck=form`) unchanged entry; staging softens here
