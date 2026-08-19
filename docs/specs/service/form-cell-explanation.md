# Form cell explanation

<!-- id: SPEC-service-form-cell-explanation -->
<!-- use-case: UC-022 -->
<!-- use-case: UC-041 -->
<!-- status: draft -->

Short, explicit rule text for one **paradigm cell** — the on-demand and
after-error explanation for form practice. Implements
[`study/02`](../../study/02-evidence.md) E5 and anti-pattern A8: available at
the point of need, never as a chapter up front.

Parent: [`form-recall-pool.md`](form-recall-pool.md),
[`paradigm-cells.ts`](../../../lib/paradigm-cells.ts),
[`lexicon.md`](lexicon.md).

## Scope

- **In:** `lib/form-cell-explanation.ts` (pure resolver); message keys in
  `messages/*.json`; examples drawn from the learner's **held** lemmas in the
  same conjugation class when possible.
- **Out:** a reference grammar; linguistic terminology as a subject; machine
  grading of typed answers; explanations for meaning-recall cards (later slice).

## Behavior

| # | Input | Output |
| --- | --- | --- |
| 1 | `paradigmCell`, `lemma`, conjugation class from lexicon | **Headline** — human cell label from `paradigmCellLabel` (person + tense/mood) |
| 2 | Same | **Rule** — at most two sentences: the pattern for this class × cell (e.g. *-ar present 1sg: stem + -o*) |
| 3 | Held lemmas in same class | **Examples** — up to two surface forms from the learner's pool, including the current lemma when held |
| 4 | Irregular lemma | Rule names the irregularity; no false regular pattern |
| 5 | Language profile declares no inflection | Resolver returns `null`; UI omits the control |

**Delivery (UI owns timing):** on form-recall cards, a **Why this form?**
disclosure on the back (after flip). After **Again** or **Hard**, the disclosure
opens expanded once — still dismissible, never blocking the grade row. Typed
production routes ([`form-practice.md`](form-practice.md)) show the same content
after an incorrect submission.

**Contrast, not topic:** the rule names the distinction that failed (person,
tense, class) — never "Chapter 4: The imperfect."

## Data

| Field | Source |
| --- | --- |
| `paradigmCell` | Task / card row |
| `conjugationClass` | `data/lemma/{lang}.json` analyses for the lemma |
| Example lemmas | meaning-recall pool filtered to `isTaskHeld` + same class |

Rule templates are **data keyed by (language, class, cell-pattern)** in
`data/form-rules/` when the slice ships — not hard-coded English in components.

## Acceptance criteria

- [ ] Given Spanish `es:hablar` cell `ind.pres.1sg`, when the resolver runs,
      then the headline names first-person singular present and the rule
      describes *-ar* 1sg, without naming *hablo* in the rule line.
- [ ] Given the learner holds `es:hablar` and `es:comer`, when examples are
      requested for an *-ar* cell, then at least one example uses a held *-ar*
      lemma.
- [ ] Given `ser` (irregular), when the resolver runs, then the rule does not
      claim a regular *-ar/-er/-ir* suffix pattern.
- [ ] Given Italian with inflection profile, when the resolver runs for a
      shipped cell, then copy is available in the learner's spoken language via
      message keys.
- [ ] **Negative:** no explanation is shown before the learner has flipped or
      graded **Again**/**Hard** on a form-recall card.

## Check

`npm test -- paradigm-cells form-recall-pool`
