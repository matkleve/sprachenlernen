# Skill tier metric

<!-- id: SPEC-service-skill-tier -->
<!-- use-case: UC-042 -->
<!-- status: active -->

Per-skill **value tier** (wood → platinum) for method badges. Combines training
contribution, `evidence`, and honest yield (`trains`). Effort stays separate.
Display rules: [`skill-tier.display.md`](skill-tier.display.md).
Implementation: `lib/skill-tier.ts`.

## Tier meanings (owner 2026-08-18)

| Tier | Meaning |
| --- | --- |
| Wood | Minimal training — honest weak yield |
| Bronze | Some benefit / thin evidence |
| Silver | Clear benefit / moderate evidence |
| Gold | Strong benefit + solid evidence (B+) |
| Platinum | Primary focus + strongest evidence (A) |

## Derivation

Contribution from `lib/method-skill-badges.ts`; then `evidence` caps metal.
`intensity` does not affect tier. Zero training → no shield.

## Display

Wood shown only when fewer than three shields qualify; at ≥3 qualifying shields
wood is dropped. Rank platinum → wood; show top 3 + `+` overflow.

## Acceptance criteria

- [x] Given primary + evidence A + not weak trains, when tiers compute, then
      platinum is assigned.
- [x] Given background listening, when tiers compute, then listening is wood.
- [x] Given four qualifying shields, when the badge band renders, then three
      shields and `+` overflow appear.

## Check

`npm test -- skill-tier method-skill-badges`
