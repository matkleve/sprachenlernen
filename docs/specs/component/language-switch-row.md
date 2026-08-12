# Language switch row

<!-- id: SPEC-component-language-switch-row -->
<!-- use-case: UC-025 -->
<!-- status: active -->

One rectangular language option in the shell switcher popover — endonym primary,
English beneath, **Active** chip when in focus. Each row is its own elevated
card; the popover stacks them with gaps rather than wrapping them in one box.

## Scope

- **In:** row geometry, active vs selectable states, accent outline + soft fill
  on the active row, **Active** chip (reuse [`chip.md`](chip.md)).
- **Out:** flags as identifiers; rows on profile or the picker (those surfaces
  own their own layout).

**Reuse: `Chip`** (`tone="accent"`, `border border-accent`).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Sees the active language row | Endonym + English + **Active** chip; row is not a button |
| 2 | Taps a non-active row | `onSelect(code)` fires once |

## States

| State | Visual |
| --- | --- |
| Active | Accent border + `bg-accent-soft`, chip top-right |
| Default | Bordered surface row, hover/focus/active on the button |
| Disabled | Muted, no pointer events (switch in flight) |

## Data

`code`, `isActive`, `activeLabel`, optional `onSelect`, optional `disabled`.

## Acceptance criteria

- [ ] Given an active language, when the row renders, then it shows the **Active**
      chip and is not focusable as a button.
- [ ] Given a non-active language, when the learner activates the row, then
      `onSelect` receives that language's code.

## Check

`npm test -- LanguageSwitchRow`
