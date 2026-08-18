# Route error surface

<!-- id: SPEC-component-route-error-surface -->
<!-- use-case: UC-065 -->
<!-- status: active -->

Full-page recovery when a route segment throws — wraps [`error-callout.md`](error-callout.md)
with layout padding and a **Try again** control wired to Next's `reset()`.
Contract: [`errors-boundaries.md`](../service/errors-boundaries.md).

## Scope

- **In:** `components/ui/RouteErrorSurface.tsx`; used by `app/error.tsx` and
  `app/global-error.tsx`.
- **Out:** feature-level `ErrorCallout` on loaders; toast notifications.

**Reuse: `ErrorCallout`, `Button`**.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Route throws | Surface shows `userMessage`, optional `nextStep`, `referenceId` |
| 2 | Taps Try again | For `render/boundary` and `internal/unexpected`, a full page reload; otherwise parent `reset()` re-renders the segment |
| 3 | On a non-destination route (e.g. `/profile`) | **Back to {previous destination}** links to where the learner came from (session history); falls back to Methods when unknown |
| 4 | Screen reader | Alert region announces the failure |

## States

Single `shown` state — mutually exclusive with route happy path (boundary
replaces the segment).

## Acceptance criteria

- [ ] Given user-facing fields, when rendered, then no banned generic from
      [`errors.md`](../service/errors.md) appears.
- [ ] Given `onRetry`, when Try again is activated, then `onRetry` is called once.
- [ ] No axe-core violations.

## Check

`npm test -- route-error-surface`
