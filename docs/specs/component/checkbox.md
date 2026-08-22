# Checkbox

<!-- id: SPEC-component-checkbox -->
<!-- use-case: UC-049 -->
<!-- status: active -->

Custom checkbox control — native `input` stays for forms and screen readers; the
visible box is drawn in-app so browsers cannot paint asymmetric borders.

Parent: [`field.md`](field.md). Material setup consent rows use the inline
`label` prop; exercise prep checklists use option `Button`s instead — see
[`practice-surface.md`](../feature/practice-surface.md).

## Scope

- **In:** marker sizing, five interaction states, optional inline label, disabled.
- **Out:** tri-state, radio behaviour, exercise prep rows (use option `Button`s).

## Marker

| Size | Box | Border | Checked |
| --- | --- | --- | --- |
| `md` | `size-6` | `border-2 border-line-strong`, `rounded-md` | `bg-accent-deep`, `border-accent-deep`, check icon |
| `sm` | `size-5` | same | same |

With `label`: row uses `items-center gap-2.5` so a single-line label aligns with
the marker.

Native input: `sr-only`. Marker: `aria-hidden`.

## States

All five required — [`DESIGN-SYSTEM.md`](../../DESIGN-SYSTEM.md) § Interaction states.

| State | Marker |
| --- | --- |
| default | `border-line-strong bg-surface` |
| hover | `group-hover:border-accent` (caller adds `group` on row label) |
| active | `active:scale-[0.98]` on marker |
| focus-visible | `peer-focus-visible:ring-2 ring-accent ring-offset-2` |
| disabled | `peer-disabled:opacity-50`, `pointer-events-none` on label when used with `label` prop |

## Acceptance criteria

- [ ] Given a checkbox with a label, when the label text is clicked, then the
      control toggles.
- [ ] Given focus via keyboard, then focus ring is visible on the marker.
- [ ] Given `disabled`, then the control cannot toggle.
- [ ] No axe-core violations.

## Check

`npm test -- checkbox`
