# UC-068 — Know my tap was received

<!-- id: UC-068 -->
<!-- specs: SPEC-feature-interaction-feedback, SPEC-system-interaction-inventory, SPEC-system-contrast-gate, SPEC-component-disclosure -->

**Who:** a learner on phone or desktop tapping anything in the app.
**Wants to:** see immediately that their tap registered, and that work is
happening when it takes longer than a frame.
**So that:** the interface feels alive and trustworthy instead of frozen or
broken.

## Today

Many controls have hover/active styles in the design system, but enforcement is
review-only and several surfaces use hand-rolled `<button>`s or plain links.
Async actions (sign-out, start review, auth submit) show no pending state — the
user lifts their finger and nothing changes until navigation completes.

## Success looks like

- Every interactive control shows a visible **press** state the moment it is
  touched (or hovered on pointer devices).
- Every control that waits on network or navigation shows a **pending** state
  after release until the action finishes or the next screen appears.
- Instant client-side toggles (filter chips, grade advance) still press visibly;
  their "working" feedback is the UI changing, not a spinner.

## Out of scope

- Haptic feedback / vibration.
- Global page-transition animations or skeleton screens for every route.
- Changing what an action *does* — only how it *feels* while doing it.
