# Practice surface UX — Duolingo-scale task UI vs app chrome

**Status:** owner-reviewed direction 2026-08-18. Implements
[`practice-surface.md`](../specs/feature/practice-surface.md).

## Problem

The exercise runner mixes **navigation chrome** (hero, progress, stop, step nav)
with **task content** (prompts, inputs, prep lists). Task content reused app
density — small text, decorative 16px boxes, English microcopy in German UI —
so sessions feel like a settings form, not a practice room.

The white footer panel appeared because we added `bg-surface/80 backdrop-blur` to
separate controls from scrolling content. On `canvas` it reads as a floating card
for no reason. **Chrome should not introduce a third surface**; separation is the
top border and safe-area padding.

## Fit-frame standard (owner 2026-08-18)

**Invariant:** during a practice session, nothing scrolls except **reading steps**
(`text-display`, long passages). Prepare, type, capture, offers — everything
interactive — must fit in the fixed frame without a body scrollbar.

### Frame budget

```
100svh (mobile: minus shell float reserves)
├─ Hero belt (~5rem)                                shrink-0
├─ Task zone (flex-1)                               overflow-hidden | scroll
└─ Footer (segmented progress · nav · primary)      shrink-0, anchored
```

Desktop: `--height-practice-session` = viewport below flat nav; page rhythm
padding lives **inside** that box — never subtract it twice in the height token.

### Content profiles

| Profile | When | Body overflow | Author rule |
| --- | --- | --- | --- |
| **short** | prepare, type, capture, gap-fill, offers | `overflow-hidden` | ≤2 prep rows, one prompt, one field — fits frame |
| **scroll** | long `material-preview` | `overflow-y-auto` + scrim | passage only |
| **paginated** | `text-display` (v2 turns) | scroll until pagination ships | reading Methods |

**Legibility without scroll:** practice-surface scale stays — but chrome is
**slim** (`--height-practice-hero` 5rem) and short-step density is **fit-frame**
(min-h-11 prep rows, `text-lg` leads, textarea 3 rows).

### Chrome belt (not method-card header)

Session hero is **not** a catalogue card crop. It is a **belt**: section WebP
faded full-bleed, titles on gradient, stop top-right, method title `text-lg`–`xl`.
**Segmented step progress** (one bar per recipe step, **Schritt n/m** label,
timer pill when `wait` is active) lives in the **anchored footer** above ◀ ▶ and
the primary CTA — not under the hero belt.

## Reference patterns (industry, not Duolingo clone)

| Pattern | Source | We adopt |
| --- | --- | --- |
| One focal task per screen | Multi-step wizard UX | Already in runner steps |
| Progress always visible | VP0 / HIG wizards | Footer segmented bars + label |
| Primary action in thumb zone, 48px+ | Mobile wizard guides | Footer primary `lg` |
| **Larger controls inside the task** | Duolingo, Brilliant, Khan | **Practice surface scale** |
| **No scroll on short steps** | Khan lesson cards | **Fit-frame** profile |
| 3:1 non-text contrast on controls | WCAG 1.4.11 | `line-strong` border on checkbox marker (not row card) |
| Chrome vs content separation | Material “display” vs “body” | Two layers, two density rules |

Duolingo is not the spec — **confidence and legibility under stress** is. Learners
are producing language, not browsing settings.

## Two layers

```
┌─ Runner chrome top (app density) ─────────────────┐
│ Hero belt · stop                                   │
├─ Practice surface (task density) ─────────────────┤
│ Prompts · prep rows · inputs · capture · compare   │
├─ Runner chrome bottom (app density) ───────────────┤
│ Segmented progress · ◀ ▶ · primary (bottom-right)  │
│ Tokens: text-sm/xs labels, md nav chips            │
└────────────────────────────────────────────────────┘
```

**Chrome** = `ExerciseRunnerHero`, `ExerciseRunnerProgress`, `ExerciseRunnerFooter`.
**Surface** = everything inside `ExerciseStepBody`, built from practice-surface
primitives — never raw app-scale fields for the main task.

## Practice surface rules

1. **Lead copy** — `text-lg`, `leading-snug`, `text-ink`. One block per step.
2. **Interactive rows** — min height 44px (`min-h-11`), `items-center`, `px-4 py-3`,
   `font-semibold` label left, `Checkbox` right, `border-x border-line-strong` inset
   (no top/bottom stroke). Checked: `bg-accent-soft`. WCAG contrast on the marker.
3. **Primary fields** — `Field` + `Textarea`, 3 rows default in short steps.
4. **Checkboxes** — `Checkbox` primitive (`components/ui/Checkbox.tsx`) — 2px
   `line-strong`, 24px box (`md`), no native browser painting.
5. **i18n** — recipe carries `itemKeys` / `introKey`; no English in recipe JSON.
6. **Footer** — no extra `surface` panel; `border-t border-line` on `canvas` only.
7. **Anchored footer** — chrome bottom stays fixed; only scroll profile scrolls.
8. **Content profiles** — enforced in `lib/exercise-runner/content-profile.ts`.

## Future step components

New exercise-step widgets (`cloze-type`, `minimal-pair`, …) ship as practice-surface
components first. App primitives (`Button`, `Dialog`) stay for chrome and offers.

## Open

- Timed-write countdown in footer thumb zone (today: header timer when `wait`).
- Extensive-reading **paginated** body (v2) — scroll profile ships first.
