# 45 · Method duration — filter vs fixed packages

<!-- id: ARCH-045 -->
<!-- type: archived-bridge -->
<!-- status: archived -->

**Status:** owner decision 2026-08-20. **UX/product** — menu slider filters only;
methods offer ≤ 2 fixed packages on detail. **Learning-science** — which methods
should have different lengths at all, and how news/articles work:
[`archive/ARCH-046-method-length-and-level-matched-content.md`](../archive/ARCH-046-method-length-and-level-matched-content.md).

This chapter answers: **why methods have different lengths**, **why at most two
fixed packages per method**, and **why the menu slider must not size the
session**.

Research base: [01](../STUDY-001-duolingo.md) S2, [12](../STUDY-010-method-cards.md), [21](../STUDY-019-method-catalogue-and-context.md),
[23](../STUDY-021-how-an-exercise-runs.md), [42](../../reviews/design/DR-042-method-usefulness-ux-audit.md).

---

## The decision (normative)

| Control | Role | Sizes the session? |
| --- | --- | --- |
| **Menu time slider** | Hard filter — *"what fits in my window?"* | **No** |
| **Method card** | Shows duration range (`8–15 min`) or single value | **No** |
| **Detail variant chips** | Learner picks **one of ≤ 2 fixed packages** before Start | **Yes** |
| **Session contract** | Names the chosen package — *"~8 min · 4 sentences"* | Display only |

**Rules:**

1. Each value in `durations[]` is a **shipped package** with a fixed recipe —
   fixed item count, timer, or read window. **No** `floor(budget / secPerItem)`
   scaling from the menu slider.
2. **At most two** values in `durations[]` per method. More than two is a sign the
   method should split into two catalogue entries or that one length is lying.
3. Menu `?minutes=` is **not** forwarded to `/practice` or `/words/review`. Only
   the **variant the learner chose on detail** (or the sole variant when
   `durations.length === 1`) becomes `minutes=` on the session URL.
4. On detail, only variants with `variantMinutes ≤ menuTimeBudget` are offered
   (unless menu is **Endless** — then both packages show).

**Implementation queue:** T-MV6 becomes *decouple menu from session*; T-MV5
becomes *validate each package passes G7*.

---

## Why the menu slider must not size sessions

Study/42 and owner review (2026-08-20) converged on one UX failure mode:

> Learners read the slider as **"how much time do I have?"** — not **"how long
> should this exercise be?"**

When one control does both:

- The card says `3–15 min`, the slider says `15`, the session delivers `3` — three
  truths, trust gone.
- Compose scaling is hard to keep honest (most built methods still fail G7 under
  the old model).
- Users on prescribed paths expect **fixed lesson blocks** ([01](../STUDY-001-duolingo.md) S2:
  *"you can see from the start how far it is"*).

**Filter and steering are different mental models.** UX guidance (wizard pattern,
Khan lesson cards, study/23): the first question is *fit*, the second is *which
package*. Combining them on one slider is the Duolingo-class mistake of
optimising for a single number the learner will game or misread.

The menu slider stays — it answers UC-045 well. It just stops being a hidden
volume knob.

---

## Why some methods have different lengths at all

Not every method **should** scale with time. Length is a **pedagogical property**,
not a preference dial.

### 1 · The exercise has a natural unit

| Method family | Natural unit | Why one length is wrong |
| --- | --- | --- |
| Dictation | Sentences per pass | One sentence is a probe; six sentences is practice ([02](../STUDY-002-evidence.md) E1) |
| Build-a-sentence | Target words per batch | One production attempt is warm-up, not a session ([42](../../reviews/design/DR-042-method-usefulness-ux-audit.md)) |
| SRS | Cards | Deck size must match attention span; 7 vs 30 cards are different sessions |
| Free production | One timed block | The task is sustained output, not N micro-prompts |
| 4/3/2 | Three rounds × decreasing time | Ritual shape is fixed — scaling breaks the method |
| Extensive reading | Read window | Input volume is time-on-text, not item count |

A method without a natural unit (e.g. *self-talk*) is usually **off-app** or
**open-ended** (`durations: null`).

### 2 · Cognitive load ≠ clock time

Study/12 separates **intensity** (can I manage this now?) from **duration**
(how long the clock runs). A forty-five-minute audiobook can be intensity 1; a
three-minute dictation can be intensity 3.

Two packages therefore differ in **what happens**, not only in **how long**:

- **Short package** — fewer items, same step types, still passes G3 minimum.
- **Long package** — more items or a longer read window — same recipe shape.

Example: `partial-dictation` at **8 min** vs **15 min** is not "the same dictation
but slower" — it is **fewer vs more sentences** with the same feedback loop.

### 3 · Context fit (study/21)

The menu filter asks *"can I finish this in the time I have?"* Methods declare
their **shortest** package in `min(durations)`. A learner with five minutes should
not see a method whose shortest honest package is twelve minutes.

That is why `durations` stays on the catalogue entry — it is the contract for
the filter — but the **longest** package must still pass G7, or it must be
removed from `durations[]` until the recipe ships.

### 4 · Evidence and diminishing returns

| Claim | Grade | Implication for packages |
| --- | --- | --- |
| Spaced retrieval needs multiple trials | **[A]** | Short package must still meet G3 (≥ 3 units) or not ship |
| One long input block beats many micro-snippets for fluency | **[B]** | Reading/listening favour one **window** package, not ten one-minute chips |
| Variable practice length within a session does not improve transfer | **[C]** | Continuous slider adds complexity without evidence |

**Conclusion:** offer **discrete, validated packages** — not a continuous range.

---

## Why at most two packages

**Owner decision 2026-08-20** — designer + learning-science review.

| Count | Verdict |
| --- | --- |
| **1** | Default — most methods. Card shows `12 min`. Detail has no picker. |
| **2** | When pedagogy genuinely supports two distinct honest sessions (short vs standard). Card shows `8–15 min`. Detail shows two chips. |
| **3+** | **Reject** — either the method is really two methods, or one duration is lying. Forces catalogue discipline. |

**Listening/dictation pattern (reference implementation):**

- `partial-dictation`: `durations: [8, 15]` — short burst vs sustained loop.
- `full-dictation`: `durations: [12, 25]` — same shape, different N.
- Material `unitId` (sentence / paragraph / window) may **correlate** with a
  package but does not replace the duration chip — the learner must see minutes
  and volume before Start.

**Examples to collapse to two or one:**

| Method | Today | Target |
| --- | --- | --- |
| `build-a-sentence` | `[3, 8, 15]` | `[5, 10]` or `[8, 15]` once both pass G7 |
| `srs-session` | `[2, 10, 20]` | `[10, 20]` — two card counts, fixed at compose |
| `extensive-reading` | `[10, 20, 45]` | `[20, 45]` — drop middle until window recipe honest |

---

## What learners on "prescribed levels" expect

"Prescribed level" here means learners from courses, textbooks, or path apps
(Duolingo, Busuu) — not our skill-tier shields (those grade **method evidence**,
not the learner).

| Expectation | Fixed packages + filter | Old slider-scaling |
| --- | --- | --- |
| "15 min on the card means 15 min" | ✓ if they pick the 15 min chip | ✗ often |
| "I have 40 min — what can I do?" | Filter shows everything with min ≤ 40; they pick one package or return after | Slider implies one session fills 40 min |
| "Can I do vocab + reading?" | Not automatic — return to menu between methods (mixed-stack is future UC-039) | Same gap |
| "Don't lock me out" | ✓ UC-057 — filter hides, never locks | ✓ |

The fixed-package model **matches course habits** better than scaling. The
remaining gap — **one block, multiple methods** — is a separate feature
(session stack), not something the duration slider should fake.

---

## UX rules (designer checklist)

1. **One number, one meaning** on the session contract — the chip they tapped.
2. **Menu slider label** — *"Show methods that fit in …"* not *"Session length"*.
3. **Default variant on detail** — longest package in `durations[]`; sole package
   auto-selected. Menu filter does **not** hide chips.
4. **No variant picker** when `durations.length === 1`.
5. **Remove lying durations** from catalogue before showing on card — validator
   (T-MV5) enforces G7 per package.

---

## Product features derived

| # | Feature | Verdict |
| --- | --- | --- |
| F216 | **Decouple menu time from session URL** | **V1** — spec 2026-08-20 |
| F217 | **Duration variant chips on detail** (≤ 2) | **V1** |
| F218 | **Catalogue `durations` max length 2** | **V1** — validator |
| F219 | **Fixed compose per package** — retire menu-driven `itemCountForBudgetMinutes` | **V1** |
| F220 | **Session stack** — multiple methods in one time block | **V2** — UC-039 |

---

## Traceability

| Doc | Action |
| --- | --- |
| [`method-session-budget.md`/../../specs/service/method-session-budget.md) | Rewritten — filter vs packages |
| [`method-menu.md`/../../specs/page/method-menu.md) | Slider filter-only |
| [`method-catalogue.md`/../../specs/service/method-catalogue.md) | `durations` ≤ 2, fixed packages |
| [`method-detail.md`/../../specs/page/method-detail.md) | Variant chips |
| [`exercise-recipe-composer.md`/../../specs/service/exercise-recipe-composer.md) | `variantMinutes` not menu scaling |
| UC-045 | Updated success criteria |
| Study/42 F214 | Superseded by F216–F219 |

## Open

- **⚠ SPEC GAP:** chip labels for two packages — *"Short · 4 sentences"* vs
  *"Standard · 8 sentences"* — copy keys in `methodMenu.durationVariant.*`.
- **⚠ SPEC GAP:** when material `unitId` and duration package disagree, which
  wins? Proposal: duration package is primary; material unit is sub-choice within
  a package where both dimensions apply (dictation).
