# UC-074 — Know my report was received

<!-- id: UC-074 -->
<!-- specs: SPEC-component-status-banner -->

**Who:** a learner who just reported a card, saved a grade that is syncing, or
any other moment where the app did something on their behalf and they need to
know it worked.
**Wants to:** see a clear, non-alarming confirmation without a modal or toast
that disappears before they read it.
**So that:** they trust the tap landed, understand what changes next, and can
keep reviewing.

Parent: [UC-023](UC-023-report-something-wrong.md) for the report confirmation
copy. This use case owns the **shared acknowledgement surface** — today a plain
`<p>` in `ReviewSession`, tomorrow a reusable primitive other features can use.

Derived from owner feedback 2026-08-16 and
[`study/34-review-report-and-acknowledgement-ux.md`](../study/34-review-report-and-acknowledgement-ux.md).

## Today

After a successful report, review session renders the confirmation string as
unstyled body text above the card (`role="status"`). It does not look like
feedback from the app — it reads like stray copy. Sync status and errors use
the same plain-text pattern (errors use danger colour only).

`ErrorCallout` exists for failures; there is no success/info analogue.

## Success looks like

- After a successful report, a **status banner** appears above the card with
  success styling — visibly distinct from body copy and from error callouts.
- The banner states what happened **and** what it means for this session
  (e.g. card stays in the current queue; scheduling stops from the next
  session).
- The banner does not steal focus; screen readers announce it (`role="status"`,
  `aria-live="polite"`).
- The banner can be dismissed or auto-clears when the learner grades and moves
  to the next card — product choice in study doc; must not stack with the next
  card's content.
- The same primitive can be reused anywhere a non-error acknowledgement is
  needed (report confirmation is the first consumer; sync success is **out of
  scope** for v1 unless trivial to share).
- Failure to report still uses danger styling — not this banner.

## Out of scope

- Toast notifications that float over the nav pill.
- `ErrorCallout` redesign — failures stay there.
- Push notifications or email receipts for reports.
- Banners that require a button to dismiss when the message is informational
  only (destructive confirmations still use `Dialog`).

## Undecided

- **Persistence across cards** — show until next grade vs until next report vs
  timed fade. Study doc recommends clear on next grade.
