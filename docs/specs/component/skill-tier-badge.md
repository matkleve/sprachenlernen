# Skill tier badge

<!-- id: SPEC-component-skill-tier-badge -->
<!-- use-case: UC-042 -->
<!-- status: active -->

Arts shield badge for **one skill value tier** on method cards and detail. Icons
only — no visible tier/skill text. Tier metric:
[`../service/skill-tier.md`](../service/skill-tier.md). Card sizing rationale:
[`../../study/40-method-card-visual-polish.md`](../../study/40-method-card-visual-polish.md).

## Scope

- **In:** `SkillTierBadge`, `SkillTierBadgeRow`, `SkillTierOverflow` on cards
  and detail; PNG assets under `public/assets/skill-tier-badges/{skill}-{tier}.png`
  (vocabulary: SVG placeholder); `aria-label` with tier + skill; wood through
  platinum. Images use `unoptimized`.
- **Out:** learner progression; visible tier/skill text on badge surfaces.

Implementation: `features/method-menu/SkillTierBadge.tsx`,
`features/method-menu/skill-tier-badges.ts`, metric in `lib/skill-tier.ts`.

## Sizes

| Surface | Size | Notes |
| --- | --- | --- |
| **Card** | `h-10 w-8` (`aspect-[4/5]`), `p-0.5` | 40px long edge; portrait frame |
| **Detail** | `size-12` (48px) | square |
| **Overflow `+`** | matches badge height | `h-10 w-8` on cards |

Assets sliced with **≥12% inner margin** per grid cell
(`scripts/slice-skill-tier-badges.py`) so shield tips are not clipped.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Sees a method card | Up to 3 ranked tier icons + optional `+` |
| 2 | Opens method detail | Same rules at detail size |
| 3 | Screen reader focuses badge | Hears tier + skill via `aria-label` |

Display cap: [`../service/skill-tier.md`](../service/skill-tier.md).

## Acceptance criteria

- [ ] Given tier gold for listening on detail, when it renders, then the gold
      listening asset is shown with an accessible name.
- [ ] Given a card, when a shield renders, then rendered size is **≥40px**
      on the long edge.
- [ ] Given a card shield, when it renders, then the **full shield silhouette**
      is visible — no clipped point or frame corner.
- [ ] Given wood tier on a card with &lt;3 qualifying shields, when it renders,
      then the wood shield is shown at card size.
- [ ] Given any badge, when it renders, then no visible text label on the surface.
- [ ] The rendered component has no axe-core violations in isolation.

## Check

`npm test -- skill-tier method-detail-badge-band method-badge`
