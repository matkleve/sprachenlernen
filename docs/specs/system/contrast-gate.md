# Contrast gate

<!-- id: SPEC-system-contrast-gate -->
<!-- use-case: UC-068 -->
<!-- status: active -->

Automated WCAG contrast checks for design tokens in both themes, plus looser
guards that interaction-state fills and opacity washes remain perceptible.

## Scope

- **In:** every `--color-*` token in `app/globals.css`; static fg/bg pairs;
  resting→hover/active fill deltas; disabled (`opacity-50`) and pending
  (`opacity-70`) composites from `interaction-kernel.ts`.
- **Out:** per-component class strings; runtime glass/backdrop stacks; motion.

## Behavior

`npm run check:contrast` runs three passes in light and dark:

| Pass | What | Threshold |
| --- | --- | --- |
| **Pairs** | Foreground on background that can co-exist | WCAG AA — 4.5:1 body, 3:1 large UI |
| **State deltas** | Resting fill vs hover/active/deep partner | ≥ 1.05:1 between the two fills |
| **Composites** | Foreground at reduced opacity over a surface | ≥ 3.0:1 primary ink; ≥ 2.0:1 muted secondary |

Pairs and composites use standard relative-luminance contrast (WCAG 2.x). State
deltas compare the two background tokens only — they catch hover/active fills
that are too close to rest, without requiring text-grade ratios on decoration.

Every token must appear in at least one pair or delta, or in `EXEMPT` when it
is decorative only (`line`).

## Data

- Token values: `app/globals.css` (`@theme` + dark overrides).
- Pair tables: `scripts/contrast-pairs.mjs`.
- Color math: `scripts/lib/color.mjs`.

## Acceptance criteria

- [ ] Given a new `--color-*` token, when `check:contrast` runs, then the gate
  fails until the token is covered or exempted.
- [ ] Given light and dark themes, when static pairs run, then every listed pair
  meets its minimum ratio in both themes.
- [ ] Given a resting/hover fill pair (e.g. `accent` → `accent-deep`), when the
  delta pass runs, then the two fills differ by at least 1.05:1 in both themes.
- [ ] Given `disabledState` (`opacity-50`) and `pendingBusy` (`opacity-70`),
  when composite pairs run, then blended foreground on surface still clears 3.0:1.

## Check

`npm run check:contrast` and `npm test -- color`.
