# 34 · Review report popover and acknowledgement banner — UX review

**Date:** 2026-08-16  
**Participants:** product owner (async), UX designer (this document)  
**Triggers:** review-session flag is one-tap; confirmation is plain text; grade
row crowded the nav pill (spacing fix shipped separately in PR #99).  
**Use cases:** [UC-073](../use-cases/UC-073-explain-what-is-wrong-with-a-card.md),
[UC-074](../use-cases/UC-074-know-my-report-was-received.md) — children of
[UC-023](../use-cases/UC-023-report-something-wrong.md).

---

## Problem statement

Learners who find a bad card need to **report without leaving flow** and **know
it worked**. UC-023 is only half-delivered: the flag persists, but the moment
feels like shouting into a void — no questions, no visible receipt.

---

## UX designer review

### 1. Flag control → popover (not dialog)

| Option | Pros | Cons | Verdict |
| --- | --- | --- | --- |
| **A. Keep one-tap flag** | Fastest path | No signal for maintainers; violates UC-023 "though both can be given" | Reject |
| **B. Modal dialog** | Focus trap, accessible | Blocks the card; feels heavy for an optional note | Reject for v1 |
| **C. Anchored popover** | Card stays visible; matches language switcher / orbit list patterns | Positioning near top-right flag on small screens | **Recommend** |
| **D. Bottom sheet** | Thumb-friendly | New pattern; fights one-screen runner height budget | Defer |

**Recommendation:** **C** — popover anchored below the flag `IconButton`, max
width ~20rem, scroll inside if keyboard open. Reuse dismiss rules from
`LanguageSwitcher` (Escape, outside tap). Scrim: **light** (no full blur) so the
card remains readable — reporting is "about this card."

### 2. Popover content structure

```
┌─────────────────────────────────────┐
│  Report this card                   │  ← title, not a question
│  What’s wrong? (optional)           │
│  ┌─────────┐ ┌─────────┐ …        │  ← single-select chips OR radio group
│  │ Wrong   │ │ Audio   │          │
│  │ trans.  │ │ issue   │          │
│  └─────────┘ └─────────┘          │
│  ┌─────────────────────────────┐    │
│  │ Anything else? (optional)   │    │  ← Field + textarea, 280 char cap
│  └─────────────────────────────┘    │
│  ☐ Stop showing after this session  │  ← see §3 — default ON
│                                     │
│  [ Cancel ]  [ Report ]             │  ← Report is primary; works with zero
└─────────────────────────────────────┘      selections
```

**Category chips (v1 proposal):**

| Value | Label | When |
| --- | --- | --- |
| `wrong-translation` | Wrong translation | Back face does not match |
| `audio` | Audio issue | Clip missing or mismatched (future-proof) |
| `confusing` | Confusing | Not wrong, but hard to learn from |
| `not-relevant` | Not relevant to me | Subjective; still valid signal |
| `other` | Other | Catch-all |

Categories are **optional** and **single-select** — multiple problems → free
text. Storing `null` when skipped is fine.

### 3. Scheduling intent — "still want to see this card?"

Owner asked whether learners can keep seeing a card after reporting. Three
interpretations:

| Interpretation | Already true? | Needs build? |
| --- | --- | --- |
| Finish **this** session | No — reported card exits with a short animation and the runner advances without a grade |
| Keep **future** scheduling | No — flag excludes from next build | Yes — new mode |
| **Feedback only** — no flag | No | Yes — new row type or flag bit |

**UX recommendation for v1:**

- **Default checked:** "Stop scheduling this card after today's session" (plain
  language for UC-023 behaviour).
- **Unchecked:** submit stores feedback **without** inserting `card_content_flag`
  — requires schema + product **GO** (not in current table).
- **Do not ship unchecked path without owner GO** — half a toggle is worse than
  none.

If owner declines the toggle, popover copy should state the outcome explicitly:
*"We'll stop scheduling this card from your next session and skip it now."*

### 4. Acknowledgement — status banner (not ErrorCallout)

| Surface | Role | Styling |
| --- | --- | --- |
| `ErrorCallout` | Failures, reference id, retry | `danger-soft` |
| **Status banner (new)** | Success / info acknowledgement | `success-soft` or `accent-soft` |
| Plain `<p>` | Today | None — **replace for report** |

**Banner anatomy:**

- One or two sentences max.
- No dismiss button for report success — clears on **next grade** (learner
  already moved on mentally).
- `role="status"` + `aria-live="polite"`.
- Sits **between** session header and card — same slot as today's plain text.

**Copy (report success):**

> **Report received.** We won't schedule this card again. Moving to the next
> card.

(Error path stays inline danger text or `ErrorCallout` if we add retry later.)

### 5. Mobile one-screen constraints

[`page-layout.md`](../specs/feature/page-layout.md) `one-screen-runner` forbids
page scroll on `< md`. Adding a popover + banner must not push grades under the
nav pill.

Mitigations (already partially shipped):

- Compact grade row: smaller buttons + `pb-3` above nav pill (PR #99).
- Popover opens **over** the card (z above card, below language switcher).
- Banner is one line on mobile when possible; two lines max.
- If banner + popover + card exceed height, **card flex-shrinks** — never the
  grade row.

### 6. Accessibility

- Flag button: `aria-expanded`, `aria-controls` → popover id.
- Popover: `role="dialog"` **or** `role="group"` with labelled title — prefer
  dialog semantics if focus moves inside; if focus stays on trigger, use
  `aria-haspopup="dialog"`.
- Categories: real `radio` group or `Chip` with `aria-pressed` single-select.
- Primary **Report** is last in tab order; Cancel does not flag.

### 7. Data model (for implementer, pending GO)

Current:

```sql
card_content_flag (user_id, word_id, spoken_language, flagged_at)
```

Proposed extension (migration only after GO):

```sql
alter table card_content_flag add column category text;
alter table card_content_flag add column note text;
-- optional: feedback-only rows → separate table or schedule_exempt boolean
```

Categories enforced by check constraint or app enum — not free text.

---

## Open questions for owner (need GO)

1. **Scheduling toggle** — ship v1 with flag-only (no "keep scheduling"), or
   wait until feedback-only path is spec'd?
2. **Category list** — approve five chips above or edit labels?
3. **Banner lifetime** — clear on next grade (recommended) vs stay until
   session end?
4. **Reuse** — status banner v1 only on review report, or also sync success
   later?

---

## Recommended implementation order

| Step | Deliverable | Change class |
| --- | --- | --- |
| 1 | `StatusBanner` component + spec | Standard |
| 2 | Wire report confirmation in `ReviewSession` | Standard |
| 3 | `CardReportPopover` + `review-card-report` feature spec | Sensitive |
| 4 | DB columns for `category` + `note` | Sensitive |
| 5 | Scheduling-intent toggle (if GO) | Sensitive |

Do **not** start step 3 until steps 1–2 are reviewed — the banner proves the
acknowledgement pattern before the popover adds state.

---

## References

- [UC-023](../use-cases/UC-023-report-something-wrong.md)
- [`broken-card-detection.md`](../specs/service/broken-card-detection.md)
- [`review-session.md`](../specs/feature/review-session.md) behaviour row 8
- [`error-callout.md`](../specs/component/error-callout.md) — explicit out of scope
- Popover patterns: `LanguageSwitcher`, `OrbitListPopover`
