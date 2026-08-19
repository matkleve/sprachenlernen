# Form practice

<!-- id: SPEC-service-form-practice -->
<!-- use-case: UC-041 -->
<!-- use-case: UC-078 -->
<!-- status: draft -->

How a learner practises inflected forms — which items exist, in what order they
are introduced, and how a session is composed. **Sensitive**: it multiplies the
Task count fifteenfold and adds a second signal to the level model.

Nothing here is built. This is the contract the build follows, and two of its
inputs are still undecided (§ Blocked on).

**Relationship to UC-078 (T-W20):** `deck=form` on `srs-session` delivers
**form-recall Tasks only** — one surface form per held lemma today. This spec
covers the **full paradigm-cell** engine (`paradigm-cells-mixed`) and is T-W6.

## Scope

- **In:** the paradigm-cell Task type, the introduction model, session
  composition, answer routes, and the inverse index the whole thing needs.
- **Out:** the level-model arithmetic for form mastery
  ([`study/03`](../../study/03-level-model.md) owns it); the paper sheet, which
  is its own method; grammar as a curriculum of topics (UC-041, out of scope).

## Two units, and the seam is memory

| | Unit | Schedule | Method |
| --- | --- | --- | --- |
| **Paradigm cell** | one `(lemma, cell, direction)` | an FSRS Task | `paradigm-cells-mixed` — card engine, `/words/review` |
| **Paradigm sheet** | ~20 mixed rows | none — it is a Sheet | `paradigm-sheet` — paper, self-corrected |

The seam is not "cell versus table", it is **has a memory state versus does
not**. FSRS schedules Tasks; a worksheet is not a Task. Splitting the existing
catalogue entry `paradigm-tables-mixed` along that line is what lets one half
run on a phone at all.

`taskId`: `es:hablar:verb:ind.pres.1pl:form-recall`. `wordId` stays `es:hablar`,
so vocabulary size is untouched and form mastery remains its own signal.

**Cells are not instantiated in bulk.** 112 verbs in the shipped pool carry
6,085 practisable cells; instantiating them all would be a horizon nobody can
read and a denominator nobody can defend. A cell becomes a Task when the learner
**meets** the form or **fails** it — Targeting, as the glossary defines it.

## Introduction: weight it, never gate it

The learner's objection that drove this spec — *"you don't learn all tenses at
once"* — is right, and it is a **pool-size** problem rather than a curriculum
problem. Three dials, no prerequisite graph:

1. **A cap on new cells per day.** This alone answers the objection.
2. **Frequency-stratified order** — by form frequency, stratified by cell class
   so the head of the list is not fifty forms of *ser · estar · haber · ir*.
3. **Subjunctive last.** The one ordering step with research behind it; it lives
   in subordinate clauses and needs syntax a beginner does not have.

**Never a lock.** An unintroduced cell has weight ≈ 0 in *automatic* selection
and weight 1 the moment the learner asks for it, meets it in a text, or fails it
in production. [`GLOSSARY.md`](../../GLOSSARY.md)'s Targeting entry governs
Method availability; ordering content by weight is allowed and this is what that
means in practice.

⚠ **What is explicitly not adopted:** present → preterite → imperfect → future
as a taught sequence. It is textbook convention, and the one large intervention
that manipulated it (N ≈ 700, preterite-first versus imperfect-first) found no
difference. Building it would be inventing a rule nobody has demonstrated.

## Session composition: select by due date, mix by ordering

FSRS chooses **what** is due; that is correct and untouched. But cells learned
together come due together, so **the due set arrives pre-blocked** — the
scheduler does not give interleaving for free. Mixing is therefore a property of
**ordering**, which changes no scheduler state:

1. No two consecutive items share a lemma.
2. No more than 2 of any 4 consecutive items share tense × conjugation class.
3. **Echo rule.** When a cell with a confusable twin is answered, the twin is
   inserted 2–5 items later if it is in the pool. Discrimination is the
   mechanism; deliberate adjacency is how it is trained.
4. If the due set cannot satisfy 1–3, pull the nearest non-due cells forward.
   A cell reviewed a day early costs a fraction of a percent of stability; a
   twelve-item blocked stretch costs the effect the method exists for.

**The item names its cell, and the item does not store that sentence.** A prompt
of "to speak" alone has six answers; it is answerable only because the cell is on
screen. Where the wording comes from is settled in
[`form-recall-pool.md`](form-recall-pool.md): the row carries the meaning and the
cell code, `paradigmCells.ts` turns the code into words, and the layout composes
them. Every item type here inherits that split — a Build or Spoken item changes
the arrangement, never the pool.

**Heading: name the scope, never the answer.** *"Past — preterite and imperfect,
mixed verbs"* is safe. *"Now the imperfect"* above contextual items is not: it
pre-solves the choice the item is measuring. Attach the one-line reason —
*"mixed on purpose: it feels worse and sticks better"* — because that is the
part with evidence behind it.

## Answer routes — three, and none of them graded by a machine listening

[`study/14`](../../study/14-accessibility.md) already requires it: typing must
not be the only way to answer, or the app measures spelling and calls it form
mastery.

| Route | Needs | Notes |
| --- | --- | --- |
| **Typed** | keyboard or touch | autocorrect **off** — iOS rewrites *hablás*; a persistent accent strip, never long-press only; the stem is **never** prefilled |
| **Build** | touch, one hand | ~15 ending chips spanning **all** classes and tenses in play. Not multiple choice: four options from one paradigm are solvable by suffix shape |
| **Spoken** | voice; optionally headphones and no screen at all | self-compared against the model answer, then self-graded |

**Speech is never machine-graded here**, and the reason is specific rather than
generic: an isolated conjugated form is the worst case for recognition — no
sentence context, and the competing hypotheses (*hablo · habló · hablé · hable ·
hablas · hablás*) are minimal pairs of exactly the distinctions being tested.
Recognition may drive a fixed command list (*again · good · easy · repeat*) so a
session runs hands-free. It controls the session; it never judges the answer.

The spoken route earns **three grades, not four** — no *Easy*. An answer the app
did not see does not earn the longest interval.

Answering aloud is a **route**, not speaking practice: it earns no speaking
evidence, and `skills` must not gain `speaking` because of it.

**Accents.** An accent-only mismatch is forgiven **unless the unaccented string
is itself a form of the same lemma**. *hablare* is the future subjunctive of
*hablar*, so it may not pass for *hablaré*; *estas* is not a form of *estar*, so
it may. Blanket forgiveness hides real errors; blanket strictness measures
spelling. Accent slips are logged separately from form errors.

## The read path will not survive this

7,509 Tasks against today's 500. `listReviewsForTaskIds` batches at 100, so the
existing shape becomes **76 requests per page load**. This is the same trap as
the word pool, one order of magnitude worse — see
[`TRAPS.md`](../../TRAPS.md). The answer is not smaller batches but a different
query shape: read the account's reviews and match locally, so the cost grows
with **how much the learner has done**, not with how big the pool is.

## Acceptance criteria

In [`form-practice.acceptance-criteria.md`](form-practice.acceptance-criteria.md).

## Check

`npm test -- form-practice`

## Blocked on

- ⚠ **The inverse index is unspecified.** [`lexicon.md`](lexicon.md) orders
  `form → analyses`; every item here needs `(lemma, cell) → accepted forms`,
  which has no ordering, no primary, no variety tag. **28.2 %** of verb
  `(lemma, cell)` pairs have more than one correct form (*habla · hablas ·
  hablás* for one cell), and the table carries noise a grader would accept —
  unaccented `estan`, a bare `a` under *haber*, clitics under an empty cell.
  Nothing is built until this is a contract.
- ⚠ **The sibling gap** ([`scheduler.md`](scheduler.md)). *hablar* has 59 cells.
  Without a minimum interval between Tasks of one Word, a learner sees the same
  verb twelve times in fifteen items — a blocked table delivered by the
  scheduler in an interleaved costume.
- ⚠ **Which cell a wrong answer actually was** is not recorded. The review log
  stores correct/incorrect; *hablé* for *hablaba* is a tense error and *hablas*
  for *hablo* a person error, and the shipped table can tell them apart. Without
  it, none of the choices above is testable.
