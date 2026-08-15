# Method badge

<!-- id: SPEC-component-method-badge -->
<!-- use-case: UC-046 -->
<!-- status: active -->

Three non-interactive badge families for method cards and detail pages: **skill
contribution**, **evidence grade**, and **effort load**. Replaces long-sentence
accent chips for evidence and intensity. Contract:
[`../../study/27-method-badges.md`](../../study/27-method-badges.md).

## Scope

- **In:** skill marks (four skills, three contribution levels), plain-language
  evidence and effort text badges; placement on `MethodCard` and `MethodDetail`;
  token-only styling; accessible names.
- **Out:** readiness state, per-learner effect, hosted/off-app, duration,
  requirements — those stay tag chips or prose. Interactive badges. Global
  quality metals (one gold/silver/copper per method). Counts on navigation.

Implementation: `features/method-menu/MethodBadge.tsx` (feature-local because
badge copy lives in `features/method-menu/content.ts`).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Sees a method card | Badge row shows skill marks, evidence label, effort label in fixed order |
| 2 | Opens method detail | Same three families in an "At a glance" panel plus tag chips for takes/needs |
| 3 | Focuses a card link (keyboard) | `sr-only` summary states skills, evidence, and effort; individual marks use `title` tooltips |

## Families

### Skill contribution

| Level | Visual | When |
| --- | --- | --- |
| Primary | Filled skill mark (Lucide icon) | Main target skill for the method |
| Secondary | Outlined / dashed border | Listed in `skills[]` but not primary |
| Slight | Dim mark | Weak contribution; detail may add the word "slight" |

Skills fixed order: reading, listening, speaking, writing. Only skills with
level ≠ none are rendered.

**v1:** derived by `lib/method-skill-badges.ts` from `section`, `skills[]`,
`trains` (see study/27). **v2:** `skillContribution` on catalogue entry overrides
derivation.

### Evidence grade

Renders `evidence` as a **plain-language card label** (`evidenceCard` from
`features/method-menu/content.ts` — e.g. "Thin evidence", not "Evidence C").
Letter grades (A–D) appear only in the full `evidence` sentence on the detail
page — never on cards.

### Effort load

Renders `intensity` 1–3 as a **plain-language card label** (`effortCard` — e.g.
"Light effort", "Needs focus", "Draining"). Detail page adds the `intensity`
anchor sentence after the label.

## States

Non-interactive — one visual state per family. No hover requirement beyond
focus-visible on the enclosing card link.

On cards inside a link (`inLink`), the visible badge row is `aria-hidden` and a
single `sr-only` line carries the full summary — avoids nested interactive
semantics and duplicate announcements.

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
- [ ] Given evidence C, when the card renders, then the badge shows "Thin
      evidence" — not a letter grade or multi-line pill.
- [ ] Given intensity 1, when the card renders, then the effort badge shows
      "Light effort" — not a dot scale.
- [ ] Given a card link with skill marks, when a screen reader announces the
      link, then the `sr-only` summary includes skill names, contribution levels,
      evidence gloss, and effort.
- [ ] Given any badge, when it renders, then only token utilities are used — no
      raw colors or radii.
- [ ] Given detail page, when evidence is shown, then the full sentence is prose
      outside the badge row, not a wrapping chip.
- [ ] The rendered component tree has no axe-core violations in isolation.

## Check

`npm test -- method-badge`
