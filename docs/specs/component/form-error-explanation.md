# Form error explanation

<!-- id: SPEC-component-form-error-explanation -->
<!-- use-case: UC-022 -->
<!-- use-case: UC-078 -->
<!-- status: draft -->

On-demand disclosure on form-recall (and later form-production) cards: cell
label, short rule, and held-word examples. **Standard** UI component.

Parent: [`form-cell-explanation.md`](../service/form-cell-explanation.md),
[`review-session.md`](../feature/review-session.md).

## Scope

- **In:** `features/review-session/FormErrorExplanation.tsx` (or equivalent);
  wired on `ReviewCard` when `isFormRecallTaskId`; i18n via `next-intl`.
- **Out:** meaning-recall cards; blocking modal; links to a grammar index.

**Reuse: `Disclosure`** — same collapsed/expanded pattern as lemma callout on
Words home.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Flips a form-recall card | Back shows surface form; **Why this form?** disclosure collapsed below the answer |
| 2 | Taps **Why this form?** | Expands: headline (cell), rule (≤2 sentences), up to two examples |
| 3 | Grades **Again** or **Hard** | Disclosure auto-expands once; learner may collapse and continue |
| 4 | Grades **Good** or **Easy** without opening | Session advances; no explanation forced |
| 5 | Resolver returns `null` | Control not rendered |

## States

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| collapsed | initial; after collapse | Chevron + label only | no |
| expanded | tap; auto after Again/Hard | Full explanation visible | no |

## Acceptance criteria

- [ ] Given a form-recall card at back face, when rendered, then **Why this
      form?** is present and collapsed by default.
- [ ] Given **Again** graded, when the learner remains on the card, then the
      disclosure is expanded and grade buttons stay usable.
- [ ] Given expanded explanation, when the learner collapses it, then only the
      disclosure chrome hides; the answer and grades remain.
- [ ] **Negative:** meaning-recall cards do not render this component.

## Check

`npm test -- ReviewCard review-session`
