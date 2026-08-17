# Skill tier badge

<!-- id: SPEC-component-skill-tier-badge -->
<!-- use-case: UC-042 -->
<!-- status: active -->

Arts shield badge for **one skill contribution tier** on method detail. Icons
only — no visible tier or skill text. Contract:
[`../../study/33-skill-tier-badges-exploration.md`](../../study/33-skill-tier-badges-exploration.md).

## Scope

- **In:** `SkillTierBadge` on method detail; assets under
  `public/assets/skill-tier-badges/{skill}-{tier}.svg`; `aria-label` with tier
  and skill in words; bronze–platinum only (wood computed but never shown).
  Images use `unoptimized` — SVG assets must not fail SSR via the optimizer.
- **Out:** cards (Lucide marks until arts assets ship to cards); learner
  progression; global method rank; visible wood tier.

Implementation: `features/method-menu/SkillTierBadge.tsx`,
`features/method-menu/skill-tier-badges.ts`, metric in `lib/skill-tier.ts`.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens method detail | Badge band shows tier icons for skills at bronze+ |
| 2 | Screen reader focuses badge | Hears tier + skill via `aria-label` |

## States

Non-interactive — one visual state per skill/tier pair.

## Data

| Input | Source |
| --- | --- |
| `skill` | `Skill` |
| `tier` | `SkillTier` (bronze–platinum) |

## Acceptance criteria

- [ ] Given tier gold for listening, when it renders, then the gold listening
      asset is shown with an accessible name mentioning gold and listening.
- [ ] Given tier wood, when detail renders, then no badge is shown for that skill.
- [ ] Given any badge, when it renders, then no visible text label appears on the
      badge surface.
- [ ] Given any badge, when it renders, then only token utilities are used in
      fallback styling — no raw colours or radii.
- [ ] The rendered component has no axe-core violations in isolation.

## Check

`npm test -- skill-tier`
