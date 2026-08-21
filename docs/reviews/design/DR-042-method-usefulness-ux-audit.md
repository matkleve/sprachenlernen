# 42 · Method usefulness — UX designer and learning-science audit

<!-- id: DR-042 -->
<!-- type: design-review -->
<!-- status: active -->

**Status:** owner report 2026-08-19. Trigger: *build-a-sentence* feels useless — one
sentence, no correction, four screens, done.

This chapter answers: **what makes a hosted method worth the learner's time**,
audits every **built** engine today, and lists **spec changes** required before
more catalogue Methods ship in the same shape.

Research base: [06](../../study/STUDY-006-production.md), [20](../../study/STUDY-018-speaking-and-sentences.md),
[23](../../study/STUDY-021-how-an-exercise-runs.md), [25](../../study/STUDY-023-why-it-does-not-feel-productive.md),
[02](../../study/STUDY-002-evidence.md) E1/E3, [12](../../study/STUDY-010-method-cards.md).

---

## The learner's complaint, decoded

| What they said | What it means in product terms |
| --- | --- |
| "One sentence" | **Volume** — one retrieval attempt cannot carry a session |
| "Will not get corrected" | **No feedback loop** — production without correction is nearly worthless ([06](../../study/STUDY-006-production.md)) |
| "Four screens" | **Overhead ratio** — chrome steps dominate learning steps |
| "Then it's done" | **No competence moment** — nothing new became possible ([08](../../study/STUDY-008-motivation.md) M5) |

The method is not evil in the catalogue. **Build a sentence with a target word**
is a standard classroom warm-up with evidence grade **A** when it is *retrieval +
feedback + enough reps*. The shipped recipe is a **navigation shell around a
single unscored typing prompt**.

---

## What "useful" means here (six gates)

A hosted method must pass **all six** before it deserves menu placement. These
are not taste — they map to mechanisms this study already treats as load-bearing.

| Gate | Learning mechanism | Fails when |
| --- | --- | --- |
| **G1 · Retrieval** | Testing effect — memory changes through recall, not exposure ([02](../../study/STUDY-002-evidence.md) E1) | Learner only reads, listens, or taps options |
| **G2 · Feedback** | Value of production is *failure + correction* ([06](../../study/STUDY-006-production.md)) | `done` is reachable with no comparison, key, rubric, or honest "we cannot judge" |
| **G3 · Volume** | One item is a probe, not practice — effect needs **repeated retrieval** or **sustained production** | One sentence / one gap in a multi-screen session |
| **G4 · Whole-task proximity** | Performance accomplishments build persistence ([25](../../study/STUDY-023-why-it-does-not-feel-productive.md) P5) | Exercise unit (one screen) never resembles a task the learner would do anyway |
| **G5 · Honest `done`** | Seen ≠ done ([23](../../study/STUDY-021-how-an-exercise-runs.md)) | Marking done proves navigation, not performance |
| **G6 · Effort budget** | Context filter already removed impossible methods ([21](../../study/STUDY-019-method-catalogue-and-context.md)) | Prepare + decide + offers consume more attention than the learning unit |

**Product sentence:** a method that fails G2 or G3 is **worse than not offering
it** — it trains the learner that this app is another tap-through exercise app
([25](../../study/STUDY-023-why-it-does-not-feel-productive.md) bottom-right cell).

---

## UX designer scan — what good methods feel like

From wizard UX, Khan lesson cards, and this product's cooking-app runner
([23](../../study/STUDY-021-how-an-exercise-runs.md)), learners trust a method when:

1. **One focal task per screen** — but the *session* still has a visible **batch
   size** ("3 sentences" not "1 sentence hidden inside 4 chrome steps").
2. **Correction is unmistakable** — side-by-side, tapped errors, or explicit
   "we cannot auto-correct yet — compare yourself".
3. **The end names what changed** — not "session complete" but "you practised
   producing X with feedback on Y" (feeds F186 in [25](../../study/STUDY-023-why-it-does-not-feel-productive.md)).
4. **Prepare appears only when setup is real** — paper, headphones, quiet room.
   Keyboard-only micro-tasks should not open with a three-item checklist.
5. **Decide is proportional** — scheduling one word after one unscored sentence is
   disproportionate; batch errors or skip decide when nothing was measured.

**Anti-pattern (Duolingo-class):** many screens, shallow prompts, implicit
completion, rising numerators — [25](../../study/STUDY-023-why-it-does-not-feel-productive.md) C2–C3.

---

## Audit — seven built engines (2026-08-19)

| Method | G1 | G2 | G3 | G4 | G5 | G6 | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `srs-session` | ✓ | ✓ (self-grade) | ✓ (deck) | ○ | ✓ | ✓ | **Good** — different engine, proven shape |
| `partial-dictation` | ✓ | ✓ (`self-mark`) | ○ (N=1 v1) | ○ | ✓ | ○ | **Acceptable** — raise N in variants |
| `full-dictation` | ✓ | ✓ | ✓ (loop) | ○ | ✓ | ○ | **Good** |
| `extensive-reading` | ○ | ○ (comprehension) | ✓ | ✓ | ✓ | ✓ | **Good** for input |
| `reading-aloud` | ✓ | ✗ (no key) | ○ | ✓ | ○ | ✓ | **Weak** — needs rubric or playback compare |
| `build-a-sentence` | ✓ | **✗** | **✗** | ○ | **✗** | **✗** | **Fail** — see below |
| `free-production` | ✓ | ○ (placeholder) | ✓ (timer) | ✓ | ✓ | ○ | **Honest weak** — feedback admitted as v1 gap |

Legend: ✓ pass · ○ partial · ✗ fail.

---

## Case study — `build-a-sentence` (why it fails)

**Catalogue promise** (`data/methods/writing.json`): production recall, evidence
A, 3–15 min, `doesNotDo` already warns it stays at one sentence.

**Shipped recipe** (`lib/exercise-recipe/build-a-sentence.ts`):

```
prepare (3 checklist items)
  → do: type-with-word (one target word)
  → review: reveal-answer (no exemplar in config)
  → decide: offers (schedule word)
```

**Review step reality** (`RevealAnswerStep`): without `config.exemplar`, UI shows
only generic copy — *"Any grammatical sentence that uses the word naturally
counts"* — plus the learner's text. **No correction, no model sentence, no error
tokens.** That is G2 and G5 failure.

**Volume:** one L1→L2 production attempt. Research on staged retrieval ([02](../../study/STUDY-002-evidence.md)
E3) treats single-shot production as entry probe, not session.

**Overhead:** four runner steps for one sentence. Prepare duplicates context the
method detail page already covers ([37](DR-037-content-and-method-setup-ux.md)).

**Effect estimate corruption:** learner taps **Weiter** on prepare, types anything,
taps through reveal, declines offers — `done` steps may still feed signals while
nothing was checked ([23](../../study/STUDY-021-how-an-exercise-runs.md)).

### What would make the *same* catalogue entry useful

Not a different method — a **viable session contract**:

| Lever | Target |
| --- | --- |
| Volume | **3–5 target words** per session (loop at compose time), or fold into `diary-three-sentences` |
| Feedback | **Exemplar sentence per word** from lemma/material data **or** `self-mark` on function words **or** `feedback` with honest automation tier |
| Chrome | Drop prepare when only keyboard/touch; keep decide only when errors exist |
| Detail surface | Show **"5 sentences · compared to examples"** before Start |

Evidence grade **A** in the catalogue assumed classroom use: teacher hears the
sentence and corrects. The app removed the teacher and kept the prompt.

---

## Science anchors (for sceptical review)

| Claim | Grade | Source in this study |
| --- | --- | --- |
| Retrieval beats re-exposure | **[A]** | [02](../../study/STUDY-002-evidence.md) E1 |
| Production recall ≠ recognition | **[A/B]** | [02](../../study/STUDY-002-evidence.md) E3 |
| Production without feedback ≈ worthless | **[B]** | [06](../../study/STUDY-006-production.md), Swain / noticing |
| Effortful practice can feel unproductive while working | **[A]** | [25](../../study/STUDY-023-why-it-does-not-feel-productive.md) P1–P3 |
| Absence of whole-task use makes "unproductive" correct | **[A/B]** | [25](../../study/STUDY-023-why-it-does-not-feel-productive.md) P5, two-cause test |
| Chunks beat word-by-word construction for fluency | **[B]** | [20](../../study/STUDY-018-speaking-and-sentences.md) |
| One focal screen + visible progress helps completion | **[D]** | [23](../../study/STUDY-021-how-an-exercise-runs.md), wizard UX |

---

## Spec changes required (normative)

New contract spec: [`method-session-viability.md`](../../specs/service/method-session-viability.md).

| Spec | Change |
| --- | --- |
| [`method-session-viability.md`](../../specs/service/method-session-viability.md) | **New** — seven gates (G1–G7) as validator rules |
| [`method-session-budget.md`](../../specs/service/method-session-budget.md) | **New** — wall-clock budget contract + compose scaling |
| [`exercise-recipe-composer.md`](../../specs/service/exercise-recipe-composer.md) | Composer must reject recipes that fail viability; link gates |
| [`exercise-recipe-composer.methods.md`](../../specs/service/exercise-recipe-composer.methods.md) | `build-a-sentence` **target** mix: `×3–5 [ D:type-with-word → R:feedback-or-exemplar ]` |
| [`exercise-step-components.md`](../../specs/service/exercise-step-components.md) | `reveal-answer` on production: exemplar **or** honesty key required |
| [`method-detail.md`](../../specs/page/method-detail.md) | **Session contract** row: item count + feedback mode before Start |
| [`exercise-runner.md`](../../specs/feature/exercise-runner.md) | Prepare optional when `prepareRequired: false` in recipe meta |
| [`method-catalogue.md`](../../specs/service/method-catalogue.md) | Optional `sessionContract` on hosted methods for detail display |

**Implementation queue (not this doc):**

| ID | Work | Class |
| --- | --- | --- |
| **T-MV1** | Viability linter on composed recipes in CI | Standard |
| **T-MV2** | Recompose `build-a-sentence` (batch + exemplar/feedback) | Sensitive |
| **T-MV3** | Session contract on method detail | Standard |
| **T-MV4** | `reading-aloud` rubric or record-and-replay step | Standard |
| **T-MV5** | Budget-driven compose + catalogue duration validator | Standard |
| **T-MV6** | Pass `minutes` from menu through Start URLs | Standard |

---

## Duration fidelity audit (G7) — all built methods

**Rule:** card or menu budget **B** minutes → composed wall estimate in **[0.85B, 1.15B]**
minutes of active learning + capped chrome overhead
([`method-session-budget.md`](../../specs/service/method-session-budget.md)).

**Today:** menu `?minutes=` only **filters** the catalogue — it does **not** size
the session. Card `durations` are filter hints, not enforced budgets. That is why
"15 minutes" feels like a lie.

### Shipped vs catalogue (2026-08-19)

| Method | Card `durations` (min) | Shipped wall estimate | G7 | Recommended `durations` after fix |
| --- | --- | --- | --- | --- |
| `srs-session` | 2, 10, 20 | **~9 min** (15 cards × ~35 s) | **Fail** 2 & 20 | **5, 10, 20** → 7 / 15 / 30 cards |
| `partial-dictation` | 8, 15 | **~5–6** short (N=1) · **~14–18** standard (N=6) | **Fail** short at 8 | **5, 10, 15** → short N=2 / standard N=4 / long window |
| `full-dictation` | 12, 25 | **~15–25** standard loop | **Borderline** at 12 | Keep **12, 25**; map short/standard/long to budget |
| `extensive-reading` | 10, 20, 45 | **Unbounded** (`full` text default) | **Fail** all | **10, 20, 45** with **window** units only; drop `full` as timed default |
| `reading-aloud` | 5, 10, 20 | **Unbounded** (`full` text) | **Fail** all | **5, 10, 20** with **window** units; add rubric step |
| `build-a-sentence` | 3, 8, 15 | **~3** (4 chrome steps, 1 sentence) | **Fail** 8 & 15 | **5, 10** until batch ships (3 & 5 sentences); **hide 15** |
| `free-production` | 10, 20 | **~10** (600 s timer default) | **Pass** 10 · **Fail** 20 | **10, 20** with timer = budget − overhead |

### Compose targets (normative once T-MV5 ships)

| Method | `budgetMinutes` | Volume | Active-learning driver |
| --- | --- | --- | --- |
| `srs-session` | menu or variant | `cardCount` | `budget × 60 / 35` |
| `partial-dictation` | 5 / 10 / 15 | N sentences | 90 s × N + waits |
| `full-dictation` | 12 / 25 | N sentences | 120 s × N + waits |
| `extensive-reading` | 10 / 20 / 45 | read window | `durationSec` on `window` unit |
| `reading-aloud` | 5 / 10 / 20 | read window | window + speak pass |
| `build-a-sentence` | 5 / 10 | N target words | 75 s × N (write + review each) |
| `free-production` | 10 / 20 | one block | `timed-write.durationSec` |

### UX rules

1. **One number, one meaning** — the minute value on the card is the session budget
   the composer uses, not a filter-only label.
2. **Menu + detail agree** — `?minutes=15` on `/methods` becomes `minutes=15` on
   Start unless the method's minimum variant is higher (show that honestly).
3. **Contract before Start** — *"~10 min · 4 sentences · compared to key"* not
   only *"10–20 min"* in the sidebar.
4. **Remove lying variants** — until compose catches up, drop minute values from
   `durations[]` so the card cannot promise what the runner cannot deliver.

---

## Product features derived

| # | Feature | Ev. | Eff. | Verdict |
| --- | --- | --- | --- | --- |
| F208 | **Method session viability gates** — hosted recipes must pass G1–G7 | D | S | **V1** — T-MV1 |
| F209 | **Session contract on detail** — "{n} items · {feedback label}" | D | S | **V1** — T-MV3 |
| F210 | **Batch micro-production** — default 3–5 items for word/sentence prompts | B | M | **V1** — T-MV2 |
| F211 | **Exemplar from material** — lemma table supplies model sentences | B | M | **V1** — T-MV2 |
| F212 | **Skip prepare** when context already satisfied on detail | D | S | **V2** |
| F213 | **Reading-aloud self-rubric** — 2-dimension self-mark after record | B | M | **V2** — T-MV4 |
| F214 | **Budget-driven sessions** — menu minutes sizes compose, not just filter | D | M | **Superseded** — study/45 F216 (owner 2026-08-20) |
| F215 | **Catalogue duration validator** — refuse `durations` that fail wall estimate | D | S | **V1** — T-MV5 |

---

## Open

- **Question 21 — minimum N for dictation variants?** **Resolved for budgeting:**
  N is derived from `budgetMinutes`, not fixed at 1/6. Catalogue min 8 → at least
  2 sentences at short budget.
- **Question 22 — when feedback is placeholder, can `done` feed productionQuality?**
  Proposal: only when learner completed review step, not do-only — needs level-model
  spec alignment.

## Traceability

| Doc | Action |
| --- | --- |
| This chapter | Owner report + science + UX audit |
| [`method-session-viability.md`](../../specs/service/method-session-viability.md) | Normative gates |
| [`IMPLEMENTATION-PLAN.md`](../../IMPLEMENTATION-PLAN.md) | Add T-MV1–T-MV6 when scheduled |
| [`method-session-budget.md`](../../specs/service/method-session-budget.md) | Wall-clock contract |
| UC-049 | Whole-task and honest `done` — already aligned; session contract is new surface |
