# Design explorer — compare visual directions

<!-- id: SPEC-page-design-explorer -->
<!-- use-case: UC-067 -->
<!-- status: active -->

A dev-facing page at `/dev/design` where a product owner compares five coherent
visual directions before locking tokens into `app/globals.css`. Serves
[UC-067](../../use-cases/UC-067-choose-how-the-app-should-feel.md).

**Reuse: Button, Field, Input, Select** — primitives render inside scoped token
overrides so each preview uses the same contracts as production.

## Scope

- **In:** five preset directions; per-direction preview of typography, color
  swatches, buttons, a field with input, a card, and a badge; one selectable
  direction persisted in `localStorage`; metadata chips for font, radius and
  border weight.
- **Out:** applying a direction to the global theme; dark-mode previews; editing
  or exporting token files; navigation entry in the app shell (URL only).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/dev/design` | Five direction cards in a responsive grid, none selected on first visit |
| 2 | Reads a card | Sees the direction name, one-line rationale, font/radius/border chips, and a live preview |
| 3 | Clicks **Choose this direction** on a card | That card shows selected state; choice persists in `localStorage` |
| 4 | Returns later | The previously chosen card is still selected |
| 5 | Chooses a different card | New choice replaces the old one with no residue of the previous selection |

## States

| State | Trigger | Visual / behavioral effect | Terminal? |
| --- | --- | --- | --- |
| browsing | initial / no stored choice | No card marked selected | no |
| selected | user chooses a direction | One card has selected styling; key written to `localStorage` | no |

Loading, error and empty do not apply — presets are static data.

## Data

| Field | Source | Owner |
| --- | --- | --- |
| Preset definitions | `data/design-themes/presets.json` | build-time data |
| `design-explorer-choice` | `localStorage` | client |

## Acceptance criteria

- [ ] Given a first visit, when `/dev/design` loads, then five direction cards
  are visible and none is marked selected.
- [ ] Given any direction card, when the user reads it, then font family name,
  corner radius label and border weight label are visible as chips.
- [ ] Given any direction card, when the user reads the preview, then primary,
  secondary and ghost buttons, one field with input, one surface card and one
  badge are visible under that direction's tokens.
- [ ] Given no stored choice, when the user clicks **Choose this direction** on
  card B, then only card B shows selected state.
- [ ] Given card B was chosen, when the user reloads the page, then card B still
  shows selected state.
- [ ] Given card B was chosen, when the user chooses card D, then only card D
  shows selected state and card B does not.

## Check

`npm test -- features/design-explorer`
