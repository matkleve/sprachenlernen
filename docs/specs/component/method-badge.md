# Method badge

<!-- id: SPEC-component-method-badge -->
<!-- use-case: UC-046 -->
<!-- status: active -->

Badge row on **method cards**: **skill-tier shields** + **effort** (label + dot
scale). Detail uses the same effort control plus tier shields in the badge band —
see [`method-detail.md`](../page/method-detail.md). Tier metric:
[`../service/skill-tier.md`](../service/skill-tier.md). Card shield sizing:
[`skill-tier-badge.md`](skill-tier-badge.md); row polish:
[`../../study/40-method-card-visual-polish.md`](../../study/40-method-card-visual-polish.md).

## Scope

- **In:** tier shield row (≤3 + `+`), effort label + 1–3 dot scale; placement on
  `MethodCard` and detail badge band; token-only styling; accessible names.
- **Out:** evidence badge on cards (encoded in tier metal); readiness; duration
  and requirement chips.

Implementation: `features/method-menu/MethodBadge.tsx`.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Sees a method card | Badge row shows tier shields and effort dots |
| 2 | Opens method detail | Same tier rules at detail size + effort dots |
| 3 | Focuses a card link | `sr-only` summary states tiers and effort |

## Effort load

Short **effort label** from `effortCard` (e.g. "Light effort", "Leichte
Anstrengung") in an **accent pill** — `bg-accent-soft text-accent
font-semibold`,
`rounded-pill`. On **cards:** `size="card"` — `text-sm`, `min-h-8`,
**right-aligned** (`ml-auto`); shields stay left. No dot scale; the words carry
the level. `aria-label` adds `(N of 3)` and the `intensity` anchor sentence;
`title` shows the anchor.

## States

Non-interactive. Inside card links (`inLink`), visible row is `aria-hidden`;
`sr-only` carries the summary.

## Acceptance criteria

- [ ] Given a method card, when it renders, then tier shields and effort dots
      appear in that order above logistics chips.
- [ ] Given intensity 2, when the card renders, then effort shows the
      `effortCard` short label (e.g. "Needs focus") in an accent pill.
- [ ] Given a card link, when a screen reader announces it, then the summary
      includes tier and effort — not evidence text.
- [ ] Given any badge, when it renders, then only token utilities are used.
- [ ] The rendered component tree has no axe-core violations in isolation.

## Check

`npm test -- method-badge`
