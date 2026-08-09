# Chip

<!-- id: SPEC-component-chip -->
<!-- use-case: UC-045 -->
<!-- status: active -->

A compact label for a single fact — duration, a requirement, evidence grade,
effort level. Used on method cards and in the method-menu filter rows. Not a
button by default; filter chips that change the URL are links wearing chip
geometry.

## Scope

- **In:** pill geometry, `default` and `accent` tones, optional `href` when the
  chip navigates, and text children only.
- **Out:** dismiss buttons, counts, icons, and a `selected` variant for
  non-link chips — selection state on filter chips is owned by the link wrapper
  (`NavLink` or a plain anchor with `aria-current`), not by the chip itself.

**Reuse: none.** First primitive at this layer; method cards and filters both
need it.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Sees a chip on a card | Reads the fact it carries; it is not interactive |
| 2 | Sees a chip inside a filter link | The link owns hover, focus and navigation; the chip is visual only |
| 3 | Tabs to a filter link | Focus ring on the link, not lost inside the chip |

## States

Non-interactive chips have one state. Filter chips inherit the five link states
from their anchor (`docs/DESIGN-SYSTEM.md` § Interaction states via `NavLink`).

## Data

Takes `children`, optional `tone` (`default` | `accent`), and optional
`className`. No `href` — callers wrap in `Link` when needed.

## Acceptance criteria

- [ ] Given default tone, when it renders, then it uses token utilities only —
      no raw colours or radii.
- [ ] Given accent tone, when it renders, then it uses `bg-accent-soft` and
      `text-ink`.
- [ ] Given a `className` from the caller, then it overrides conflicting
      utilities via `cn()`.
- [ ] Given a chip on a method card, then it is a `span`, not a link.
- [ ] The rendered chip has no axe-core violations in isolation.

## Check

`npm test -- chip`
