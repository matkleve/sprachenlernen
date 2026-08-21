# 43 · Early foundation — same-day return and enthusiasm at the start

<!-- id: ARCH-043 -->
<!-- type: archived-bridge -->
<!-- status: archived -->
<!-- spawns: UC-079 -->

The user's question, in their words: *how do you still get people excited about
learning when it is natural, and in the 2nd or 3rd session **on the same day**
words from earlier should come back — especially at the beginning, when I want to
build a good base?*

This chapter is **study only** — no implementation. It records the diagnosis,
the evidence, a proposed direction, and **where every future change would live**
in specs and code.

Related: [04](../STUDY-004-flashcards-srs.md) (card staging, backlog), [25](../STUDY-023-why-it-does-not-feel-productive.md)
(empty feeling), [26](../STUDY-024-readiness-and-difficulty.md) (targeting not gating),
[03](../STUDY-003-level-model.md) (held / fragile / new).

---

## F1 · What the learner expects versus what the app does today

### What feels natural at the start

A learner who does three short sessions in one evening expects:

1. **Session 1** — meet new words, some stick, some do not.
2. **Session 2** — *some of session 1 comes back*, plus a few new ones.
3. **Session 3** — again yesterday's / this morning's words, the base thickens.

That expectation is not laziness. At low vocabulary size, **re-encounter within
hours** is how a base becomes retrievable before long FSRS intervals kick in.

### What the shipped product does

| Layer | Rule today | Effect on session 2 same day |
| --- | --- | --- |
| **Session builder** ([`session-builder.md`/../../specs/service/session-builder.md)) | Include a card only if `due ≤ now` **or** never reviewed | Cards graded `good`/`easy` in session 1 have `due` in the future → **absent** |
| **Same-session requeue** ([UC-071/../../use-cases/UC-071-get-a-wrong-card-back-before-the-session-ends.md), [`review-session-requeue.ts`/../../../lib/review-session-requeue.ts)) | `again` → ~5 cards later; `hard` → end of queue; `good`/`easy` → gone | Only **failed** cards return inside one run |
| **Sibling rule** (session builder) | At most one Task per `wordId` per session | Meaning and form never both appear in one 15-card run |
| **Form staging** ([`form-recall-pool.md`/../../specs/service/form-recall-pool.md)) | Form-recall only when meaning-recall is **held** (≥ 7 d stability, 2 successes, …) | **Formen üben** is often empty for weeks |
| **New-card fill** | Unreviewed cards sort by frequency (gap-set lemmas first) | Session 2 can be **all new** if nothing is due — old words from session 1 do not return |

**Conclusion:** the app optimises **inter-day spacing** (correct for long-term
retention) but under-supplies **intra-day consolidation** (needed for early
base-building). Session 2 on the same day can feel like starting over — the
opposite of "building a foundation."

---

## F2 · What the research actually says (and what it does not)

### F2a · Spacing is real — but the unit matters **[A]**

[E2](../STUDY-002-evidence.md): distributed practice beats massed practice **across days**.
That is the core justification for FSRS and for not showing 900 cards after a
two-week break ([04](../STUDY-004-flashcards-srs.md), backlog trap).

**What E2 does not say:** that a word seen once at 18:00 must be invisible at
20:00. The spacing literature compares **same-day blocks** vs **multi-day
gaps** — not "never repeat within 24 hours."

> **Product sentence:** inter-**day** spacing stays non-negotiable; inter-**session
> same-day** return is a separate knob.

### F2b · Early production is staged — but "stable" is not binary **[A/B]**

[E3](../STUDY-002-evidence.md): full production recall on a brand-new item is too hard;
recognition and meaning recall come first. [04](../STUDY-004-flashcards-srs.md) tables
**form recall** as "once meaning recall is stable."

The shipped **held** gate (7 days, two successes) is a **conservative
operationalisation** of "stable" ([`vocabulary-snapshot.md`/../../specs/service/vocabulary-snapshot.md),
calibration 2026-08-12). It prevents counting one lucky `good` as known. It also
creates a **multi-day desert** before forms exist — which [26](../STUDY-024-readiness-and-difficulty.md)
would address with **targeting** (weight forms in) rather than **gating** (lock
forms out).

### F2c · Effortful practice feels unproductive — unless you see return **[A]**

[25](../STUDY-023-why-it-does-not-feel-productive.md) P2: learners rate effortful
strategies as less effective and avoid them. At the start, **no same-day return**
makes effort feel wasted even when FSRS is "working."

The bottom-right cell of the two-cause test (easy + no real use) is the
competitor default. Our early SRS path risks a cousin: **hard + no visible
return within the day.**

### F2d · Retrievability is already a probability — the session ignores it **[A]**

FSRS stores stability and computes **retrievability** `R` at any moment
([`scheduler.algorithm.md`/../../specs/service/scheduler.algorithm.md)). The
glass-walled schedule (G1 in [04](../STUDY-004-flashcards-srs.md)) can show "recall today:
89 %."

The session builder does **not** use `R`. It uses a hard cut: `due ≤ now`. That
is simpler and testable, but it is **not** the user's proposed model ("low
probability day 1, rising each day") — that model is closer to scheduling by
`R` or fuzzy due dates than to what ships.

### F2e · Initial vocabulary acquisition benefits from denser early contact **[C]**

○ Nation-style vocabulary acquisition work and classroom practice both assume
**multiple meetings** before a lemma is treated as "known." Typical guided
courses recycle high-frequency items within the same lesson block and across
adjacent lessons — not because spacing is wrong, but because **first encoding**
needs repetition on a shorter timescale than **maintenance**.

Evidence grade **[C]**: direction is standard in curriculum design; exact
parameters (how many same-day returns, at what pool size to taper) are **product
calibration**, not a single paper.

---

## F3 · Design goal (study-level, not spec)

> **Foundation phase:** while the learner's base is small, sessions should
> **feel like the same words are growing**, not like a conveyor belt of new
> lemmas. Long intervals apply to **maintenance**; short **resurfacing** applies
> to **fragile** items until the base crosses a threshold.

This aligns with thesis 13 ([26](../STUDY-024-readiness-and-difficulty.md)): the app
**targets** content and timing; it does not **lock** methods. Empty "Formen
üben" is a lock in practice even when the method is always visible.

### Three mechanisms (conceptual — not built)

| # | Mechanism | Intent |
| --- | --- | --- |
| **M1** | **Same-day resurfacing pool** | Session 2+ on the same calendar day reserves slots for lemmas touched earlier today (or in the last N hours), prioritising **fragile** and latest `good` that would otherwise be hidden until tomorrow |
| **M2** | **Foundation throttle on new cards** | While `held < H` (e.g. 30–50 meaning-recall Tasks), cap **new** introductions per session and spend freed slots on resurfacing |
| **M3** | **Soft form introduction** | Form-recall enters as a **low-weight target** once meaning has ≥ 1 success, full FSRS weight once meaning is held — not a binary 7-day wall |

None of these require abandoning FSRS. They belong in **session composition** and
**staging policy**, not in rewriting `applyReview`.

---

## F4 · Proposed rules (draft — for a future spec)

Values are **starting points for calibration**, not decisions.

### M1 · Same-day resurfacing

| Input | Rule |
| --- | --- |
| Prior sessions today | Load `taskId`s reviewed since local midnight (or rolling 12 h) |
| Slot budget | `min(8, floor(sessionLength / 2))` reserved for resurfacing while in foundation phase |
| Eligibility | Task is `fragile` OR was graded `good`/`easy` in an earlier session today and `due > now` |
| Ordering | Lowest retrievability first among eligible; tie-break `frequencyRank` |
| FSRS | **Do not** move `due` earlier on resurfacing alone — resurfacing is extra exposure, not a failed review |

**Learner-visible copy (example):** "Three words from earlier today — strengthening
the base."

### M2 · Foundation throttle

| Signal | Behaviour |
| --- | --- |
| `held_meaning_recall < 50` | Foundation phase **on** |
| New cards per session | `min(5, sessionLength - resurfacingSlots)` |
| `held ≥ 50` | Foundation phase **off**; current builder logic unchanged |
| Gap-set cookie | Still boosts priority lemmas within the new cap |

This implements the user's "after ~50 words, earlier words should come back
often enough that you don't learn 100 new words per day."

### M3 · Soft form staging

| Meaning state | Form in `deck=mixed` | Form in `deck=form` |
| --- | --- | --- |
| No reviews | Never | Never |
| 1+ success, not held | Low priority; may fill resurfacing slots | Eligible if no held forms due |
| Held | Normal FSRS competition | Normal FSRS pool |

Hard gate (today) becomes a **weight ramp**.

---

## F5 · Where everything would live (implementation map)

When this ships, touch **study → spec → code** in this order. No file below is
changed by this chapter.

### New artefacts (likely)

| Artefact | Purpose |
| --- | --- |
| [`docs/study/archive/ARCH-043-early-foundation-sessions.md`](../archive/ARCH-043-early-foundation-sessions.md) | This chapter — **why** |
| `docs/use-cases/UC-079-build-a-vocabulary-base-with-same-day-return.md` | Learner story: 2nd session same day sees earlier words |
| `docs/specs/service/foundation-phase.md` | Normative: when foundation phase is on/off, resurfacing slots, throttle |
| `docs/specs/service/session-sampling.md` | Optional split child: retrievability-weighted picks vs hard `due` |
| `docs/specs/service/foundation-phase.acceptance-criteria.md` | AC supplement if parent grows |
| `docs/adr/00xx-foundation-phase-vs-fsrs-due.md` | ADR: resurfacing does not rewrite `due`; FSRS log stays authoritative |
| `docs/diary/YYYY-MM-DD.md` | Ship note when implemented |

### Specs to extend (not replace)

| Spec | Change |
| --- | --- |
| [`session-builder.md`/../../specs/service/session-builder.md) | New inputs: `foundationPhase`, `resurfacingCandidates`, `maxNew`; behaviour rows for M1–M2 |
| [`scheduler.md`/../../specs/service/scheduler.md) | Document `retrievabilityAt(now)` as **session-builder input** (may already exist in code) |
| [`vocabulary-snapshot.md`/../../specs/service/vocabulary-snapshot.md) | Export `isFoundationPhase(snapshot)` helper contract |
| [`form-recall-pool.md`/../../specs/service/form-recall-pool.md) | Replace binary staging table with weight ramp (M3) |
| [`review-session.md`/../../specs/feature/review-session.md) | Copy for resurfacing banner; session-complete line naming same-day returns |
| [`words-home.md`/../../specs/feature/words-home.md) | Optional: "Base building" hint while foundation phase active |
| [`words-review.md`/../../specs/page/words-review.md) | Empty queue copy when `deck=form` and staging blocks all — differentiate from "nothing due" |

### Code (future — pointers only)

| File | Role |
| --- | --- |
| `lib/foundation-phase.ts` | `isFoundationPhase`, `resurfacingSlots`, `maxNewCards` — framework-free |
| `lib/session-builder.ts` | Merge due + new + resurfacing picks in order |
| `lib/session-sampling.ts` | Optional: `retrievabilityWeight(task, now)` for soft inclusion |
| `lib/form-recall-staging.ts` | Weight ramp instead of boolean filter |
| `lib/vocabulary-snapshot.ts` | `held` count export for foundation threshold |
| `features/review-session/actions.ts` | Load today's reviews; pass foundation options into `buildSession` |
| `lib/db/review-log.ts` or task-state | Query reviews since midnight for resurfacing set |
| `lib/session-builder.test.ts` | Red tests: session 2 same day includes fragile from session 1 |
| `lib/foundation-phase.test.ts` | Threshold and slot math |
| `messages/en.json`, `messages/de.json` | Resurfacing / base-building copy |

### Plans and implementation plan

| Doc | Entry |
| --- | --- |
| [`docs/plans/words.md`/../../plans/words.md) | New slice **T-W22** Foundation phase + same-day resurfacing |
| [`docs/IMPLEMENTATION-PLAN.md`/../../IMPLEMENTATION-PLAN.md) | Queue after T-W21; depends on review log read path |
| [`docs/backlog/BL-009-feature-catalogue.md`](../../backlog/BL-009-feature-catalogue.md) | F216–F218 (below) |
| [`docs/backlog/BL-011-roadmap-open-questions.md`](../../backlog/BL-011-roadmap-open-questions.md) | Question 20 |

### What should **not** change

| Area | Reason |
| --- | --- |
| `lib/scheduler.ts` `applyReview` | FSRS intervals stay honest; resurfacing is overlay |
| ADR-0009 (no fourth nav tab) | Forms stay on Words; deck filter unchanged |
| No backlog counter ([04](../STUDY-004-flashcards-srs.md)) | Resurfacing is not "871 overdue" |

---

## F6 · Feature catalogue (draft IDs)

| # | Feature | Ev. | Eff. | Verdict |
| --- | --- | --- | --- | --- |
| F216 | **Foundation phase** — throttle new cards while `held` below threshold; same-day resurfacing slots | C/D | M | **V1 candidate** — [43](../archive/ARCH-043-early-foundation-sessions.md) |
| F217 | **Session sampling by retrievability** — soft inclusion below hard `due` for fragile tasks only | B | M | **V2** — [43](../archive/ARCH-043-early-foundation-sessions.md) |
| F218 | **Soft form staging ramp** — forms weighted in after first meaning success, full weight after held | B | S | **V1 candidate** — [43](../archive/ARCH-043-early-foundation-sessions.md) |

Copy component for F216 (ties to [25](../STUDY-023-why-it-does-not-feel-productive.md) F186):
session end may name *"You met 8 words; 3 came back from this afternoon — that
is the base getting wider."*

---

## F7 · Open questions (need owner decision before spec)

1. **Foundation threshold** — is `held < 50` meaning-recall Tasks the right off
   switch, or should it be `held + fragile < 80`, or time-based (first 14 days)?
2. **Resurfacing vs FSRS** — does an extra same-day show count as a review for
   scheduling, or is it a zero-grade exposure? (Recommendation: **no grade, no
   `due` change** — otherwise intervals collapse.)
3. **Calendar boundary** — local midnight vs rolling 24 h for "earlier today."
4. **deck=form** during foundation — should M3 force at least one form when
   meaning has one success, or only when mixed session would otherwise be all new?
5. **Enthusiasm** — resurfacing fixes *competence signal*; [25](../STUDY-023-why-it-does-not-feel-productive.md)
   F187 (whole-task floor) still needed for *purpose signal*. Do not pretend
   same-day words alone solve "not productive."

---

## F8 · Success criteria (how we know the study worked)

When implemented, a sceptical engineer should be able to demonstrate:

- [ ] Learner with 5 fragile words does session 1 at 10:00, session 2 at 15:00
      → ≥ 3 of those 5 appear in session 2 without being `due` by raw FSRS.
- [ ] Learner with `held ≥ 50` → session builder matches today's behaviour (no
      resurfacing unless UC-071 requeue).
- [ ] `good` in session 1 does not pull `due` earlier solely because session 2
      resurfaced the card.
- [ ] `deck=form` with 10 meanings at 1× success each → non-empty form session
      possible (soft staging).

---

## Where this chapter corrects or extends earlier ones

- **[04](../STUDY-004-flashcards-srs.md):** adds **intra-day** return as complementary to
  inter-day FSRS — not a replacement.
- **[26](../STUDY-024-readiness-and-difficulty.md):** form **gating** should move toward
  **targeting** (M3) — thesis 13 applied to the empty Formen path.
- **[25](../STUDY-023-why-it-does-not-feel-productive.md):** early empty sessions are often
  **correct reading** (P5) when there is no real use — but when the learner *did*
  practise and sees nothing come back, that is a **product defect**, not
  desirable difficulty.

---

## Sources

| | Claim | Grade |
| --- | --- | --- |
| ○ | Multiple encounters before "known" in vocabulary pedagogy | [C] |
| ⬤ | Spacing effect across sessions/days | [A] — [02](../STUDY-002-evidence.md) E2 |
| ⬤ | Production staged after meaning | [A/B] — [02](../STUDY-002-evidence.md) E3 |
| ⬤ | Misinterpreted-effort / need for visible return | [A] — [25](../STUDY-023-why-it-does-not-feel-productive.md) P2 |
| ⬤ | FSRS retrievability as computed quantity | [A] — [`scheduler.algorithm.md`/../../specs/service/scheduler.algorithm.md) |
| ⬤ | Shipped session builder hard `due` cut | [A] — [`session-builder.md`/../../specs/service/session-builder.md), `lib/session-builder.ts` |
