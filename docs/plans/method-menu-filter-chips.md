# Method menu filter chips — icons + multi-select

**Task:** T-B10h · **Spec:** [`method-menu.md`](../specs/page/method-menu.md)

## Goal

Skill, energy, and refine filter pills on `/methods` should:

1. Show a Lucide icon before the label (skill tints match catalogue tokens).
2. Allow **multiple active pills per dimension** (toggle on/off; OR within dimension).

## URL

Comma-separated values, backward compatible with single values:

- `?skill=reading,listening`
- `?energy=low,medium`
- `?hands=none,one`

Clearing all selections in a dimension removes the param (same as “any”).

## Filter logic

| Dimension | Multi-select semantics |
| --- | --- |
| Skill | Method shown if `skills` includes **any** selected skill |
| Energy | Method shown if `intensity <= max` for **any** selected energy bucket |
| Refine | Per dimension: method fits **any** selected constraint value |

## UI

- Skill / energy: `FilterIconPill` — icon only, `aria-label` from localized copy.
- Any-skill / any-energy: `FilterPill` text only, no icon.
- No inner tint disc — pill background only; square `w-11` equal padding.
- Refine: text-only pills (unchanged).

## Verify

`npm run verify:scope -- method-menu`
