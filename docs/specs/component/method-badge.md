# Method badge

<!-- id: SPEC-component-method-badge -->
<!-- use-case: UC-046 -->
<!-- status: active -->

Three non-interactive badge families for method cards and detail pages: **skill
contribution**, **evidence grade**, and **effort load**. Replaces long-sentence
accent chips for evidence and intensity. Contract:
[`../../study/27-method-badges.md`](../../study/27-method-badges.md).

## Scope

- **In:** skill marks (four skills, three contribution levels), evidence letter
  badge, effort dot row; placement on `MethodCard` and `MethodDetail`; token-only
  styling; accessible names.
- **Out:** readiness state, per-learner effect, hosted/off-app, duration,
  requirements — those stay tag chips or prose. Interactive badges. Global
  quality metals (one gold/silver/copper per method). Counts on navigation.

Implementation: `features/method-menu/MethodBadge.tsx` (feature-local because
badge copy lives in `features/method-menu/content.ts`).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Sees a method card | Badge row shows skill marks, evidence grade, effort dots in fixed order |
| 2 | Opens method detail | Same three families in an "At a glance" panel plus tag chips for takes/needs |
| 3 | Focuses a badge (keyboard) | `aria-label` states skill + level, evidence sentence stub, or effort anchor |

## Families

### Skill contribution

| Level | Visual | When |
| --- | --- | --- |
| Primary | Filled skill mark | Main target skill for the method |
| Secondary | Outlined / half fill | Listed in `skills[]` but not primary |
| Slight | Dim mark | Weak contribution; detail may add the word "slight" |

Skills fixed order: reading, listening, speaking, writing. Only skills with
level ≠ none are rendered.

**v1:** derived by `lib/method-skill-badges.ts` from `section`, `skills[]`,
`trains` (see study/27). **v2:** `skillContribution` on catalogue entry overrides
derivation.

### Evidence grade

Renders `evidence` as letter + short gloss (`evidenceShort` from
`features/method-menu/content.ts` on cards; full `evidence` sentence as prose on
detail — never inside a chip).

### Effort load

Renders `intensity` 1–3 as one to three filled dots. Card: dots only. Detail:
dots + `intensity` sentence as prose.

## States

Non-interactive — one visual state per family. No hover requirement beyond
focus-visible on the enclosing card link.

## Data

| Prop / input | Source |
| --- | --- |
| `skillMarks` | derived or `skillContribution` |
| `evidence` | `MethodEntry.evidence` |
| `intensity` | `MethodEntry.intensity` |

Optional `className` via `cn()`.

## Acceptance criteria

- [ ] Given a method card, when it renders, then the badge row appears above
      tag chips and contains skill marks, evidence, and effort in that order.
- [ ] Given evidence C, when the card renders, then the badge shows a letter and
      short gloss — not a multi-line pill.
- [ ] Given intensity 1, when the card renders, then exactly one effort dot is
      filled.
- [ ] Given a primary listening mark, when a screen reader announces it, then the
      accessible name includes "listening" and "primary".
- [ ] Given any badge, when it renders, then only token utilities are used — no
      raw colors or radii.
- [ ] Given detail page, when evidence is shown, then the full sentence is prose
      outside the badge row, not a wrapping chip.
- [ ] The rendered component tree has no axe-core violations in isolation.

## Check

`npm test -- method-badge`
