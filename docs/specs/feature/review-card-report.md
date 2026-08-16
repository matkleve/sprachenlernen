# Review card report

<!-- id: SPEC-feature-review-card-report -->
<!-- use-case: UC-073 -->
<!-- status: active -->

Popover on the review-session flag control: optional category + note, submit
to flag per [`broken-card-detection.md`](../service/broken-card-detection.md),
then acknowledgement via [`status-banner.md`](../component/status-banner.md).

**Sensitive** — persisted learner input + session UI state.

UX: [`study/34-review-report-and-acknowledgement-ux.md`](../../study/34-review-report-and-acknowledgement-ux.md).

## Scope

- **In:** `CardReportPopover` (or equivalent) in `features/review-session/`;
  anchored popover on flag tap; optional category + note; server action
  extension; wires confirmation to `StatusBanner` via `ReviewSession`.
- **Out:** reporting from non-review surfaces; moderator queue; scheduling-
  intent toggle until owner GO (study doc §3); partial-field reports.

**Reuse: `IconButton`, `Button`, `Field`, `Chip` or radio group,
`StatusBanner`**.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Taps flag on active card | Popover opens anchored to flag; card stays visible |
| 2 | Taps **Report** with no selections | Popover closes; flag row inserted (idempotent); success banner shown |
| 3 | Selects category and/or enters note | Same as 2; optional fields stored when schema ships |
| 4 | Taps **Cancel**, Escape, or outside | Popover closes; **no** flag |
| 5 | Same card, current session | Card remains in queue (UC-023) |
| 6 | Next session build | Flagged `word_id` excluded for spoken language |

## States

Popover `open | closed`. Report action `idle | pending | done | error`.
Banner owned by parent — see status-banner spec.

## Data

Reads `word_id`, spoken language from session. Writes `card_content_flag` (+ optional
`category`, `note` columns after migration). Categories: enum in study doc §2.

## Acceptance criteria

- [ ] Given prompting phase, when flag is tapped, then popover opens and grades
      remain usable after dismiss without a flag.
- [ ] Given **Report** with empty optional fields, when submit succeeds, then
      `card_content_flag` row exists and success banner copy matches study doc.
- [ ] Given duplicate report on same key, when **Report** again, then no error
      and same acknowledgement.
- [ ] Given submit failure, when action returns error, then danger message — no
      success banner.
- [ ] Given viewport `< md` on one-screen runner, then no page scroll is
      introduced by open popover.

## Open questions

None for v1 — scheduling-intent toggle deferred per study/34 §3.

## Check

`npm test -- card-report-popover review-session`
