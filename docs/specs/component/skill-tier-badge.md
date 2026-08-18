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
| **Card** | `h-14` (56px tall) | Width follows PNG silhouette (`w-auto`); ornate tiers may be wider but **never shorter** |
| **Detail** | `h-14` (56px tall) | Same height rule as card — no per-tier frame width |
| **Overflow `+`** | `size-14` on cards | matches badge height |

Height is the single sizing axis. Wider gold/platinum silhouettes must not be
scaled down to fit a fixed-width box — that made higher tiers look smaller than
wood/bronze on the same row.

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
- [ ] Given wood and gold shields on the same card row, when they render, then
      both images use the same rendered height (`h-14`) — wider tiers do not
      appear shorter.
- [ ] Given any badge, when it renders, then no visible text label on the surface.
- [ ] The rendered component has no axe-core violations in isolation.

## Check

`npm test -- skill-tier method-detail-badge-band method-badge`
