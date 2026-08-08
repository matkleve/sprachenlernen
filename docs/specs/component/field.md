# Field

<!-- id: SPEC-component-field -->
<!-- use-case: UC-002 -->
<!-- status: active -->

Label, description, error and the ARIA wiring between them, plus the text
controls that consume it (`Input`, `Textarea`).

Field owns the ids. Controls read them from context. That division exists
because the wiring between a label, its hint, its error and its input is the
most commonly broken thing in a form — and it breaks *silently*: the form looks
correct and is unusable with a screen reader.

## Scope

- **In:** label association, description and error announcement, invalid state,
  required marking, the shared control styling for `Input` and `Textarea`.
- **Out:** validation logic, form state, submission, error summaries across a
  whole form. Field must work with any validation approach and depend on none.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Clicks or taps the label | The control receives focus |
| 2 | Focuses the control | Label, then description, then error are announced |
| 3 | Submits and an error appears | The error is announced without focus moving |
| 4 | Uses a control outside a Field | It renders and works, with no wiring |

## States

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| valid | no `error` prop | default border | no |
| invalid | `error` present | `aria-invalid`, danger border, error announced | no |

Invalid is derived from the presence of `error` — there is no separate
`invalid` prop. Two inputs for one state is how the border and the announcement
end up disagreeing.

## Wiring

`Field` generates one `useId()` and derives `controlId`, `descriptionId` and
`errorId` from it. `aria-describedby` lists description **then** error: a screen
reader reads them in the order given, and the hint is what the user needs first.

Controls call `useFieldControl()`, which returns `{}` outside a Field. Field's
props are spread **before** the caller's, so an explicit `id` or
`aria-describedby` from the caller still wins — someone who passes one meant it.

## Accessibility

- A real `<label for>`, never `aria-label`. The label must be a click target;
  `aria-label` gives the announcement and not the 44px of tappable text.
- `aria-invalid` is omitted when valid rather than set to `"false"` — the
  attribute exists to signal a problem, and `"false"` is noise on every field.
- The error carries `role="alert"` **and** sits in `aria-describedby`. It is
  therefore announced when it appears and again on focus. That mild duplication
  is chosen over the alternative, which is silence for a keyboard user whose
  focus is elsewhere at submit time. A whole form should additionally take focus
  to an error summary; a single field cannot do that.
- Required is marked with a visible `*` (`aria-hidden`) plus a visually hidden
  "(required)", and the native `required` attribute. Colour and a glyph alone
  fail when styles are off.

## Acceptance criteria

- [ ] Given a Field with a label, when the label is clicked, then the control
      receives focus.
- [ ] Given a description and an error, then `aria-describedby` names both, with
      the description first.
- [ ] Given no error, then the control shall carry no `aria-invalid` attribute
      at all.
- [ ] Given an error, then the control shall carry `aria-invalid="true"` and the
      error shall have `role="alert"`.
- [ ] When `required` is set, the control shall be `required` and an assistive
      technology shall receive the word "required".
- [ ] Given a control rendered outside a Field, then it renders without error and
      carries no field wiring.
- [ ] Given a caller-supplied `id`, then it wins over the generated one.
- [ ] No axe-core violations, valid and invalid.

## Check

`npm test -- field`
