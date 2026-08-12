# Language list row

<!-- id: SPEC-component-language-list-row -->
<!-- use-case: UC-025 -->
<!-- status: active -->

One full-width language card — endonym primary, English beneath, optional
standing line, **Active** chip or a switch action. Shared by
[`profile.md`](../page/profile.md) (learning and spoken languages), and the
shell switcher popover so both surfaces stay visually identical.

Supersedes the shell-only `language-switch-row` shape.

## Scope

- **In:** `languageListRowSurfaceClass` geometry (`p-4`, `gap-4`, full width),
  standing + text link to `/progress`, **Active** chip ([`chip.md`](chip.md)),
  profile `actionSlot` or switcher `onSelect`.
- **Out:** flags as identifiers; picker tiles.

**Reuse: `Chip`**, Next `Link` for progress (inline text link, not a button).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Sees the active row | Endonym + English + optional standing + **Active** chip |
| 2 | Taps a selectable row in the switcher | `onSelect` fires once |
| 3 | Profile non-active row | Caller supplies `actionSlot` (e.g. Switch to this) |

## States

Active rows use the same surface as inactive — only the chip differs. Switcher
rows use `cardPressable` on the whole card when `onSelect` is set (lift on hover,
accent fill on press — same as method cards).

## Data

`code`, optional `names` (for spoken-language codes outside the learning map),
`isActive`, `activeLabel`, optional standing, optional progress link,
optional `actionSlot` or `onSelect`.

## Acceptance criteria

- [ ] Given any surface, when the row renders, then it uses `p-4` padding and
      spans the caller's full width.
- [ ] Given standing data, when the row renders, then progress is a text link,
      not a filled button.
- [ ] Given `onSelect`, when the learner activates the row, then it fires once.

## Check

`npm test -- LanguageListRow`
