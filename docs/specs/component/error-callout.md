# Error callout

<!-- id: SPEC-component-error-callout -->
<!-- use-case: UC-065 -->
<!-- status: active -->

The shared surface for page- and session-level failures — everything that is
not a single field's validation error. Shows what went wrong, what to try next,
and a reference id. Serves
[UC-065](../../use-cases/UC-065-know-what-went-wrong-and-what-to-do-next.md);
fed by [`../service/errors.md`](../service/errors.md).

## Scope

- **In:** rendering `userMessage`, optional `nextStep`, `referenceId`; optional
  retry action slot; danger styling; full five interaction states on any
  interactive child (retry button).
- **Out:** field errors ([`field.md`](field.md)); toast notifications;
  root layout failures — see [`route-error-surface.md`](route-error-surface.md).

**Reuse: `Button`** for an optional retry action passed as a child or prop.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | A parent passes a `HandledError` (or its user-facing fields) | The callout renders with danger styling; happy-path content on that surface is absent |
| 2 | Reads the callout | They see what failed, an optional next step, and `Reference: {id}` in muted mono |
| 3 | Activates retry (when provided) | The parent re-runs the failed operation — the callout does not own retry logic |
| 4 | Screen reader focuses the region | The message is announced as an alert |

## States

| State | Trigger | Visual / behavioral effect | Terminal? |
| --- | --- | --- | --- |
| hidden | parent has no error | nothing rendered | no |
| shown | `error` prop set | callout visible; mutually exclusive with that surface's loading/content | no |

Loading and error are mutually exclusive on the same surface — same rule as
[`DESIGN-SYSTEM.md`](../../DESIGN-SYSTEM.md).

## Data

Receives only user-facing fields from `HandledError` — never `developerMessage`
or raw `context`. The parent is responsible for mapping.

## Accessibility

- Root has `role="alert"` (or `role="status"` with `aria-live="assertive"` —
  pick one in implementation; must announce on appear without moving focus).
- Reference id is readable text, not colour alone.
- Retry control, when present, is a real `Button` with a visible label — not
  "click here".

## Acceptance criteria

- [ ] Given `userMessage` and `referenceId`, when rendered, then both appear and
      no banned generic from [`../service/errors.md`](../service/errors.md) is
      shown.
- [ ] Given `nextStep` is omitted, when rendered, then no empty "next step"
      placeholder appears.
- [ ] Given `developerMessage` is passed, when rendered, then it does **not**
      appear in the DOM.
- [ ] Given a retry action, when activated, then the parent's handler runs and
      the callout does not implement fetch itself.
- [ ] No axe-core violations.

## Check

`npm test -- error-callout`
