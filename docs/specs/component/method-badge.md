# Method badge

<!-- id: SPEC-component-method-badge -->
<!-- use-case: UC-046 -->
<!-- status: active -->

Badge layout on **method cards**: shields left, effort right on one row under
`summary`. Detail badge band keeps effort right — see [`method-detail.md`](../page/method-detail.md).
Tier metric: [`../service/skill-tier.md`](../service/skill-tier.md). Card shield sizing:
[`skill-tier-badge.md`](skill-tier-badge.md); row polish:
[`../../reviews/design/DR-040-method-card-visual-polish.md`](../../reviews/design/DR-040-method-card-visual-polish.md).

## Scope

- **In:** tier shield row (≤3 + `+`), effort label + 1–3 dot scale; placement on
  `MethodCard` and detail badge band; token-only styling; accessible names.
- **Out:** evidence badge on cards (encoded in tier metal); readiness; duration
  and requirement chips.

Implementation: `features/method-menu/MethodBadge.tsx`.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Sees a method card | Shields left, effort right under summary |
| 2 | Opens method detail | Same tier rules at detail size + effort dots |
| 3 | Focuses a card link | `sr-only` summary states tiers and effort |

## Effort load

Fixed **"Effort"** / localized label (e.g. Anstrengung) + **three-dot scale** in
an accent pill — `bg-accent-soft text-accent font-semibold`, `rounded-pill`. Dots
**grow left to right** (`size-1.5` → `size-2` → `size-2.5`); filled through
`intensity` use `bg-accent`, rest `bg-line`. On **cards:** `size="card"` —
`text-sm`, `min-h-8`, **`layout="row"`** — shields left, effort right (`ml-auto`).
No `effortCard` words on the surface — anchor sentence in `aria-label` and
`title`.

## States

Non-interactive. Inside card links (`inLink`), visible row is `aria-hidden`;
`sr-only` carries the summary.

## Acceptance criteria

- [ ] Given a method card, when it renders, then tier shields and effort dots
      appear in that order above logistics chips.
- [ ] Given intensity 2, when the card renders, then effort shows the localized
      effort label and **two** filled accent dots (third empty).
- [ ] Given a card link, when a screen reader announces it, then the summary
      includes tier and effort — not evidence text.
- [ ] Given any badge, when it renders, then only token utilities are used.
- [ ] The rendered component tree has no axe-core violations in isolation.

## Check

`npm test -- method-badge`
