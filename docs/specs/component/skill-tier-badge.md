# Skill tier badge

<!-- id: SPEC-component-skill-tier-badge -->
<!-- use-case: UC-042 -->
<!-- status: active -->

Arts shield badge for **one skill value tier** on method cards and detail. Icons
only — no visible tier/skill text. Tier metric:
[`../service/skill-tier.md`](../service/skill-tier.md).

Card polish: [`../../study/40-method-card-visual-polish.md`](../../study/40-method-card-visual-polish.md).

## Scope

- **In:** `SkillTierBadge`, `SkillTierBadgeRow`, `SkillTierOverflow` on cards
  and detail; PNG assets under `public/assets/skill-tier-badges/`; `aria-label`
  with tier + skill; wood through platinum. Images use `unoptimized`.
- **Out:** learner progression; visible tier/skill text on badge surfaces.

Implementation: `features/method-menu/SkillTierBadge.tsx`,
`features/method-menu/skill-tier-badges.ts`, metric in `lib/skill-tier.ts`.

## Sizes

| Surface | Size | Notes |
| --- | --- | --- |
| **Card** | `h-14 w-auto` (max `4.5rem`) | 56px tall; width follows PNG silhouette; row `gap-1` |
| **Detail** | `size-14` (56px) | unchanged |
| **Overflow `+`** | `size-14` on cards | matches badge height |

PNG assets: **256×256** normalised canvas, shield **≤50%** fill — ≥21% transparent
margin (`scripts/slice-skill-tier-badges.py`, ornate source grid).

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
- [ ] Given a card, when a shield renders, then rendered size is **≥48px** on the
      long edge.
- [ ] Given a card shield, when it renders, then the **full shield silhouette**
      is visible — no clipped tips.
- [ ] Given wood tier on a card with &lt;3 qualifying shields, when it renders,
      then the wood shield is shown at card size.
- [ ] Given any badge, when it renders, then no visible text label on the surface.
- [ ] The rendered component has no axe-core violations in isolation.

## Check

`npm test -- skill-tier method-detail-badge-band method-badge`
