# Method implementation maturity

<!-- id: SPEC-service-method-implementation-maturity -->
<!-- use-case: UC-046 -->
<!-- use-case: UC-049 -->
<!-- use-case: UC-057 -->
<!-- status: active -->

How good the **app's implementation** of a catalogue Method is — separate from
**learner level** (CEFR, study/03) and from **pedagogical evidence** (A–D on the
card). A Method can be evidence **A** and implementation **I1** (specced only).

Parent: [`practice-model.md`](practice-model.md). Matrix column:
[`METHOD-IMPLEMENTATION-MATRIX.md`](../../METHOD-IMPLEMENTATION-MATRIX.md).
Guided paths: [`method-guided-sessions.md`](method-guided-sessions.md).

## Scope

- **In:** five maturity tiers **I0–I4**; how they differ from readiness and
  evidence; ship gate **I2**; link to study/26 effect tiers.
- **Out:** learner CEFR display; per-method effect estimates; menu composition.

## Not learner level

| Concept | Measures | Owner |
| --- | --- | --- |
| **Layer 1–3 level** | Learner competence | [`03-level-model.md`](../../study/03-level-model.md) |
| **Evidence A–D** | Research support for the Method | [`method-catalogue.md`](method-catalogue.md) |
| **Readiness** | Whether material fits the learner *now* | UC-057, UC-059 |
| **I0–I4** | Whether the app implements the Method well | this spec |

Readiness (**ready · better later · no material yet**) is an **I3 concern** —
adaptive material at compose time. It is not a maturity tier.

## Maturity tiers

| Tier | Name | Meaning | Ship? |
| --- | --- | --- | --- |
| **I0** | Catalogue | Detail page only; no recipe in composer.methods | No |
| **I1** | Specced | Recipe + session kind declared | No |
| **I2** | Runnable | Composer + components shipped; LIVE CHECK green | **Yes** (engineering) |
| **I3** | Adaptive | I2 + material band / heldLemmas / coverage at compose | Learner-fit |
| **I4** | Measured | I3 + session writes target signal Progress can read | Effect |

**I2** is the engineering Definition of Done ([`WORKFLOW.md`](../../WORKFLOW.md)):
scoped verify, AC test, LIVE CHECK walkthrough.

**I3** implements study/26 R5 (95–98 % coverage band) and UC-057 material fit.
**I4** implements study/26 tier 2 (*did it move the target signal?*) — only
`targetSignal` Methods with a session log.

Study/26 tiers 1–3 describe **learning effect**, not code:

1. Research (evidence + `doesNotDo`) → catalogue, not I-tier
2. Target signal moved → **I4**
3. Works for this person → exploration + uncertainty (future menu effect)

## Tier rules (computed)

Applied in `scripts/generate-method-matrix.mjs`:

| Condition | Tier |
| --- | --- |
| No row in `exercise-recipe-composer.methods.md` | I0 |
| Recipe specced, engine not built | I1 |
| In `lib/exercise-recipe-built.ts` or card engine shipped (`srs-session`) | I2 |
| I2 + `materialTopics` or dictation/read adaptive compose | I3 |
| I3 + `targetSignal` + review/session log feeds Progress | I4 |

Today: five Methods at **I2–I4** (`srs-session` I4; dictation/reading family I3).

## LIVE CHECK rubric (I2)

Per Method before calling I2:

1. Start opens correct route (`/practice` or `/words/review`).
2. Every recipe step renders — no honest not-built copy.
3. Prepare/wait match spec (timer, checklist where declared).
4. Terminal step matches kind (graded: review/offers; guided: confirm-done).
5. Detail `doesNotDo` still true for what the session does.

## Acceptance criteria

In [`method-implementation-maturity.acceptance-criteria.md`](method-implementation-maturity.acceptance-criteria.md).

## Related

| Doc | Owns |
| --- | --- |
| [`method-guided-sessions.md`](method-guided-sessions.md) | Guided paths — I1 declares recipe |
| [`practice-model.md`](practice-model.md) | Catalogue vs built engines |
| [`METHOD-IMPLEMENTATION-MATRIX.md`](../../METHOD-IMPLEMENTATION-MATRIX.md) | I column per method |
| UC-057 | Readiness — not an I-tier |

## Check

`npm test -- method-implementation-maturity method-guided-sessions`
