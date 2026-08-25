# OptionButton

<!-- id: SPEC-component-option-button -->
<!-- use-case: UC-049 -->
<!-- status: active -->

Full-width or inline toggle built on `Button` — comprehension choices, self-mark
tokens, learner-world pickers. Parent: [`button.md`](button.md),
[`practice-surface.md`](../feature/practice-surface.md).

## Scope

- **In:** `selected` → `primary`; unselected → `secondary`; `layout` `row` or
  `chip`; `selectionMode` `toggle` (`aria-pressed`) or `radio` (`role="radio"`,
  `aria-checked`).
- **Out:** prepare requirements (static `PracticePrepList`); single-fire CTAs;
  chrome filters (`FilterPill`); form consent (`Checkbox`).

**Reuse: `Button`.**

## Layouts

| Layout | Size | Classes | Use for |
| --- | --- | --- | --- |
| `row` | `md` | `w-full justify-start` | comprehension options, world picker |
| `chip` | `sm` | `rounded-pill` | self-mark error tokens in a wrap row |

## Selection modes

| Mode | ARIA | Use for |
| --- | --- | --- |
| `toggle` (default) | `aria-pressed` | multi-select tokens, world picker |
| `radio` | `role="radio"` + `aria-checked` | single-select comprehension options inside `role="radiogroup"` |

## Acceptance criteria

- [ ] Given `selectionMode="toggle"` and `selected={false}`, then `aria-pressed="false"`.
- [ ] Given `selectionMode="radio"` and `selected={true}`, then `role="radio"` and
      `aria-checked="true"` (no `aria-pressed`).
- [ ] Given `layout="row"`, then the control is full width with left-aligned label.

## Check

`npm test -- option-button`
