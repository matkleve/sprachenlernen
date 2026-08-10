# Chip

<!-- id: SPEC-component-chip -->
<!-- use-case: UC-045 -->
<!-- status: active -->

A compact label for a single fact — duration, a requirement, evidence grade,
effort level. Used on **method cards** as non-interactive labels. Filter
controls on the method menu use the same pill geometry via **FilterPill**
(buttons), not Chip wrapped in a link.

## Scope

- **In:** pill geometry, `default` and `accent` tones, and text children only.
- **Out:** dismiss buttons, counts, icons, filter toggles, and `selected` state —
  filter pills are buttons in `features/method-menu/`, not Chip instances.

**Reuse: none.** First primitive at this layer; method cards use it; filter pills
reuse the geometry separately (`FilterPill`).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Sees a chip on a card | Reads the fact it carries; it is not interactive |

## States

Non-interactive chips have one state. Method-menu filter pills are separate
(`FilterPill` buttons) and inherit button interaction states.

## Data

Takes `children`, optional `tone` (`default` | `accent`), and optional
`className`. No `href` — callers use `FilterPill` or `NavLink` when interaction
is needed.

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
