# Select

<!-- id: SPEC-component-select -->
<!-- use-case: UC-002 -->
<!-- status: active -->

A styled native `<select>`, wired into [Field](field.md) when nested in one.

## Scope

- **In:** single selection from a known list, Field wiring, the disabled and
  invalid states, the drawn chevron.
- **Out:** multi-select, search-within-options, option groups with rich content,
  async loading. Those are a different component — see § Escalation.

## Native on purpose

A custom listbox costs several hundred lines of roving focus, typeahead,
virtual-cursor handling and mobile fallbacks. The platform ships all of it,
including the native wheel picker on iOS and Android that people demonstrably
prefer to a rebuilt dropdown.

Anyone reaching for a custom one should first check they are not just reaching
for a nicer arrow.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Clicks the control | The platform's picker opens |
| 2 | Types a letter | Native typeahead selects the next matching option |
| 3 | Is inside a Field | Label, description and error apply as for any control |

## States

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| default | — | `border-line` | no |
| invalid | Field has an `error` | `border-danger` via `aria-invalid` | no |
| disabled | `disabled` | 50% opacity, not focusable | no |

## Wiring

`appearance-none` removes the platform arrow, so one is drawn back. That chevron
is `pointer-events-none` — without it, the icon becomes a dead zone in the middle
of the control, and the click that lands on it does nothing.

## Escalation

Move to a custom listbox only when you need multi-select, search, or rich option
content. When you do, it is a new component with its own spec, an explicit state
machine ([STATE.md](../../STATE.md)) and a keyboard contract — not an extension
of this one. Do not grow this component toward it.

## Acceptance criteria

- [ ] Given a Select inside a Field, when the label is clicked, then the select
      receives focus.
- [ ] Given the Field has an error, then the select shall carry
      `aria-invalid="true"`.
- [ ] Given no Field, then the select renders and works with no wiring.
- [ ] The rendered control is a real `<select>` with its options as `<option>`.
- [ ] The chevron shall not be a click target.
- [ ] No axe-core violations.

## Check

`npm test -- select`
