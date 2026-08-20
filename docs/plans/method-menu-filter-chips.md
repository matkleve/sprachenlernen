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

## Files

- `lib/method-menu-filter.ts` — parse/serialize/filter
- `components/ui/FilterPill.tsx` — optional leading icon slot
- `features/method-menu/filter-pill-icons.tsx` — icon map
- `features/method-menu/MethodFilter.tsx`, `RefineFilter.tsx`

## Verify

`npm run verify:scope -- method-menu`
