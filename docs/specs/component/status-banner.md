# Status banner

<!-- id: SPEC-component-status-banner -->
<!-- use-case: UC-074 -->
<!-- status: active -->

Non-error inline acknowledgement — success or informational feedback inside a
page or session. Distinct from [`error-callout.md`](error-callout.md) (failures)
and from toast overlays.

**Reuse: none** — new primitive. First consumer: review report confirmation
([`review-card-report.md`](../feature/review-card-report.md) hands off after
submit).

UX: [`reviews/design/DR-035-review-report-and-acknowledgement-ux.md`](../../reviews/design/DR-035-review-report-and-acknowledgement-ux.md).

## Scope

- **In:** `components/ui/StatusBanner.tsx` — `variant` (`success` | `info`),
  `title` + optional `body`, token-only styling, `role="status"`,
  `aria-live="polite"`.
- **Out:** errors ([`error-callout.md`](error-callout.md)); toasts; fixed
  cookie-consent chrome; dismiss buttons (v1 — parent unmounts).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Parent renders with message | Banner visible with variant styling |
| 2 | Screen reader | Message announced politely without moving focus |
| 3 | Parent unmounts or clears | Banner absent — no ghost region |

## States

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| hidden | no children / null message | not rendered | no |
| shown | message set | banner visible | no |

## Data

Copy from parent `content.ts` — never inline in JSX per design system.

## Acceptance criteria

- [ ] Given `variant="success"` and a title, when rendered, then the root uses
      success token utilities (`bg-success-soft`, `text-ink`) — no raw colours.
- [ ] Given a body line, when rendered, then it appears below the title in
      muted smaller text.
- [ ] Given the banner is shown, then the root has `role="status"` and
      `aria-live="polite"`.
- [ ] Given `variant="info"`, when rendered, then styling uses `accent-soft`
      (or agreed info token) — distinct from success and danger.
- [ ] No axe-core violations.

## Check

`npm test -- status-banner`
