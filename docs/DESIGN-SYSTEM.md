# Design system

**Tokens → primitives → features → pages.** Build from small to large. A color
is defined **once** as a token, a button **once** as a primitive. Nothing is
defined twice.

Three rules cover almost everything:

1. **No raw colors, radii or shadows in components.** Token utilities only
   (`bg-surface`, `text-ink`, `rounded-card`). New value → token first.
2. **No interactive element without all five states** (§ Interaction states).
3. **No copy hardcoded in JSX.** Text lives in `content.ts`.

Rules 1 and 3 are enforced by `npm run check:tokens`. Rule 2 is enforced by
review — it is the one most often skipped, and the one users feel most.

---

## Tokens

Defined in `app/globals.css` under `@theme`. Tailwind v4 turns each one into
utilities automatically: `--color-accent` → `bg-accent`, `text-accent`,
`ring-accent`, `border-accent`.

| Group | Tokens | Use for |
| --- | --- | --- |
| Surfaces | `canvas`, `surface`, `surface-raised` | page background, cards, elevated cards |
| Text | `ink`, `muted` | primary copy, secondary copy |
| Lines | `line`, `line-strong` | borders, dividers |
| Accent | `accent`, `accent-deep`, `accent-soft`, `accent-ink` | primary actions |
| Danger | `danger`, `danger-deep`, `danger-soft`, `danger-ink` | destructive actions, errors |
| Success | `success`, `success-soft`, `success-ink` | confirmations |
| Radius | `radius-card`, `radius-pill` | `rounded-card`, `rounded-pill` |
| Shadow | `shadow-soft`, `shadow-raised` | resting and lifted elevation |

The suffix convention, and the reason it exists:

- **`-deep`** — the darker tone for **hover/active**. We do *not* use
  `brightness()` or opacity for hover: on saturated colors the change is barely
  visible, and on dark backgrounds it goes the wrong way. A defined darker token
  is always visible and always themeable.
- **`-soft`** — the tinted background version (badges, subtle fills).
- **`-ink`** — the text color that is legible **on** that fill. Never guess
  whether white works on a background; use the `-ink` partner.
- **`surface`, not white.** `bg-surface` themes; `bg-white` does not.

Every token pair that can appear together is checked against WCAG AA by
`npm run check:contrast`. Adding a token means adding its pairs there.

### Dark mode

`app/globals.css` redefines the same token names under
`@media (prefers-color-scheme: dark)` and `:root[data-theme="dark"]`. Because
components only ever reference token names, **dark mode requires no component
changes** — and a component that hardcodes `#fff` is exactly the thing that
breaks it. That is the real reason for rule 1.

---

## Interaction states ⭐

Every clickable thing communicates its state. Without visible feedback the
interface feels broken even when it works.

| State | When | What happens |
| --- | --- | --- |
| **default** | at rest | base look |
| **hover** | pointer over | color deepens (`hover:bg-accent-deep`) + slight lift (`hover:-translate-y-px`) |
| **active** | pressed | back to `translate-y-0` + `active:scale-[0.98]` — it feels pressed |
| **focus-visible** | keyboard focus | `focus-visible:ring-2 ring-accent ring-offset-2`. **Never** `outline: none` without a replacement |
| **disabled** | unavailable | `opacity-50 pointer-events-none`, no shadow |

Reference implementation: [`components/ui/Button.tsx`](../components/ui/Button.tsx).
New interactive elements reuse that pattern — they do not reinvent it.

### The one exemption **[D — 2026-08-09]**

**A native form control may omit `hover` and `active`.** `<select>` and `<input>`
hand their pressed and hovered rendering to the platform: the option list is an
OS popup we cannot style, and a hover tint we add competes with the one the
system draws. Styling them anyway produces two disagreeing affordances, which is
worse than one.

**`focus-visible` and `disabled` are never exempt**, on anything, ever.
[`CONSTITUTION.md`](CONSTITUTION.md) §3 makes a visible focus state
non-waivable, and those two are the states that carry the accessibility weight —
hover and active are polish, and polish is what an exemption may cost.

This resolves a standing conflict rather than creating one: `Select.tsx` and
`Input.tsx` already implement exactly these four. It was the specs that were
short a row, and the boundary that admitted no exceptions. Both are now right.
The exemption is **narrow on purpose** — it names native form controls, not
"anything the platform helps with". A custom listbox is not a `<select>`.

Two things that are easy to get wrong:

- **`hover:` on touch devices does not stick, and you do not have to do
  anything about it.** Tailwind v4 compiles every `hover:` utility inside
  `@media (hover: hover)` — verified against the built stylesheet, where the
  whole hover block sits under that one at-rule. Wrapping it again by hand is
  a no-op, and an earlier note here asking for that was wrong.
  **What follows from it is the part that matters:** on a device with no
  hovering pointer the hover style never applies at all, so hover may never be
  the *only* signal that something is interactive or selected. That is why
  `current` in `NavLink` is a fill rather than a hover-shaped hint.
- **`focus` vs `focus-visible`.** Use `focus-visible`, or every mouse click
  leaves a ring behind and people will ask you to remove focus rings entirely —
  which breaks keyboard users.

---

---

## Type

Tailwind's scale, but only these steps are in-system. A size that is not in this
table needs a reason, because every extra step makes the hierarchy less legible
rather than more precise.

| Utility | Size | Use for |
| --- | --- | --- |
| `text-4xl` | 36px | one page title, at most |
| `text-2xl` | 24px | section heading |
| `text-lg` | 18px | card or panel heading |
| `text-base` | 16px | body copy — the default for anything read in sentences |
| `text-sm` | 14px | dense UI: labels, table cells, secondary copy |
| `text-xs` | 12px | badges and counters **only** — never a sentence |

**14px is the floor for anything a user reads.** `text-xs` is below it: legible
as a two-word chip, not as a line of prose. This is the most common accessibility
regression in a design system, because 12px looks fine to the person who chose
it on a large screen.

**Line height is set in `globals.css`, not per component.** Tailwind's defaults
are tuned for UI labels and leave body copy too tight and headings too loose;
the overrides there fix both. Do not re-declare `leading-*` on body text.

**Measure:** cap paragraphs around 65–75 characters (`max-w-prose`, or
`max-w-2xl` at `text-base`). A full-width paragraph on a desktop screen is the
other half of why long text goes unread.

Weight carries hierarchy alongside size: `font-medium` for UI, `font-semibold`
for headings. Do not use `font-bold` and a size step to say the same thing twice.

---

## Spacing

Tailwind's 4px scale. The rhythm that keeps pages feeling like one system:

| Step | Use for |
| --- | --- |
| `1`–`2` (4–8px) | inside a control — icon to label |
| `3`–`4` (12–16px) | between related elements — label to input, row to row |
| `6`–`8` (24–32px) | between groups within a section |
| `page-content` | between a page header and its body |
| `page-top` / `page-bottom` | the page's own top and bottom padding |

Page-level rhythm goes through the `page-*` tokens, never a hardcoded `pt-28` —
changing how pages breathe should be one edit, not thirty.

Prefer `gap` on the parent over `margin` on children. Margins collapse,
compound, and have to be reset when the child is reused somewhere else; a gap is
owned by exactly one element (§ Ownership).

### Values that need no token

The rule is about *design decisions*, not every number. These stay raw:

- `1px` borders and outlines, `2px` focus rings — scaling a hairline with the
  font size adds blur, not accessibility.
- `0`, `100%`, `auto`, `min-content` and other layout keywords.
- One-off values inside a single component's internal geometry that no other
  component could ever share.

If you find yourself writing the same "one-off" twice, it was a token.

---

## Motion

| Duration | Use for |
| --- | --- |
| `duration-150` | hover, press, focus — anything that responds to the pointer |
| `duration-200` | a larger move: a panel sliding, an underline growing |
| `duration-300` | an entrance — something appearing that was not there |

Easing is `ease-out-soft` (fast in, gentle out). Anything else needs a reason.

**Name the properties you transition.** `transition-all` animates layout
properties too, which costs a repaint per frame and produces surprises when an
unrelated property changes. Write
`transition-[background-color,transform]`.

**Keep movement small** — a lift of 1–2px, a scale of ~2–3%. Subtle beats
playful, and it survives being seen a hundred times a day.

`prefers-reduced-motion: reduce` is handled globally in `globals.css`. Do not
re-implement it per component.

---

## Ownership

Most CSS bugs that survive review are ownership bugs: two places setting the
same thing, and whichever loses is invisible until a refactor flips the order.

- **One property, one owner.** Every visual property is set in exactly one place
  per purpose. If a parent sets the gap and a child also sets a margin for the
  same spacing, that is duplicate ownership, and it is a defect even while it
  looks right.
- **Two elements carry geometry:** the outermost layout owner and the innermost
  content element. Wrappers in between — context providers, ref holders, state
  layers — carry **no styling**. A wrapper that needs one property needs a
  comment saying why it cannot live on either end.
- **One stacking context per component.** Exactly one element declares
  `relative`; overlays are `absolute inset-0` against it. No `z-` value without a
  reason you could state — arbitrary `z-[9999]` is how stacking becomes
  unfixable.
- **Loading, error and empty are mutually exclusive**, and each has exactly one
  owner. If two can render at once, the state model is wrong — see
  [`STATE.md`](STATE.md), and fix the state rather than the CSS.

---

## Layout primitives

Use `PageShell` / `Container` for page padding. Do not hardcode `pt-28` on a
page — the page-level spacing tokens (`spacing-page-top`, `spacing-page-bottom`)
exist so that changing the rhythm is one edit, not thirty.

---

## The trap: utilities beat component classes

If you define component classes inside `@layer components` in `globals.css`,
Tailwind emits `utilities` **after** `components`. A utility therefore wins over
a component class **regardless of source order** — the class strings look
correct and the style silently doesn't apply.

Before adding a `shadow-*`, `bg-*` or `rounded-*` utility next to a component
class that already sets that property, check whether you are overriding the
design system by accident. `cn()` handles conflicts *within* utilities; it does
not help across layers.

This has shipped as a real bug before — see [`TRAPS.md`](TRAPS.md).
