# OptionButton

<!-- id: SPEC-component-option-button -->
<!-- use-case: UC-049 -->
<!-- status: active -->

Full-width or inline toggle built on `Button` — practice prep rows,
comprehension choices, self-mark tokens, learner-world pickers. Parent:
[`button.md`](button.md), [`practice-surface.md`](../feature/practice-surface.md).

## Scope

- **In:** `selected` → `primary` + `aria-pressed`; unselected → `secondary`;
  `layout` `row` (full-width `md`) or `chip` (`sm`, inline).
- **Out:** single-fire CTAs (use `Button` directly); chrome filters (use
  `FilterPill`); form consent (use `Checkbox`).

**Reuse: `Button`.**

## Layouts

| Layout | Size | Classes | Use for |
| --- | --- | --- | --- |
| `row` | `md` | `w-full justify-start` | prep checklist, comprehension options, world picker |
| `chip` | `sm` | `rounded-pill` | self-mark error tokens in a wrap row |

## States

Inherits all five `Button` states plus `aria-pressed` for the selected layer.
No `pending` by default — toggles are instant.

## Acceptance criteria

- [ ] Given `selected={false}`, when rendered, then `variant="secondary"` and
      `aria-pressed="false"`.
- [ ] Given `selected={true}`, when rendered, then `variant="primary"` and
      `aria-pressed="true"`.
- [ ] Given `layout="row"`, then the control is full width with left-aligned label.

## Check

`npm test -- option-button`
