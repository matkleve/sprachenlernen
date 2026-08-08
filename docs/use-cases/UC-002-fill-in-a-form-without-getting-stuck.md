# UC-002 — Fill in a form without getting stuck

<!-- id: UC-002 -->
<!-- specs: SPEC-component-field, SPEC-component-select, SPEC-component-dialog -->

**Who:** anyone entering information the product needs.
**Wants to:** answer the questions, know what is expected, and understand what
went wrong when something is rejected.
**So that:** they can finish the task instead of abandoning it.

## Today

The label is a `<div>` next to the input, so tapping it does nothing and a
screen reader announces "edit text, blank". The hint is styled text that no
assistive technology connects to the field. The error appears in red — only in
red — after a submit that moved focus nowhere, so a keyboard user is told
nothing at all.

Each of those is invisible to the person who built it, and each is discovered by
someone who cannot use the form.

## Success looks like

- Tapping or clicking a label focuses its control.
- The hint and the error are both announced as part of the field, hint first.
- An error that appears after submit is announced even when focus is elsewhere.
- Invalidity is conveyed by more than colour.
- Required fields are marked in a way that survives having the styles turned off.
- A destructive confirmation cannot be dismissed by a stray click.

## Out of scope

Validation logic, form state management, and submission. Those belong to a
library or to the feature — these are the primitives underneath, and they must
work with any of them.
