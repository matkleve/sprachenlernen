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

## Reference patterns (industry, not Duolingo clone)

| Pattern | Source | We adopt |
| --- | --- | --- |
| One focal task per screen | Multi-step wizard UX | Already in runner steps |
| Progress always visible | VP0 / HIG wizards | Hero + bar under hero |
| Primary action in thumb zone, 48px+ | Mobile wizard guides | Footer primary `lg` |
| **Larger controls inside the task** | Duolingo, Brilliant, Khan | **Practice surface scale** |
| 3:1 non-text contrast on controls | WCAG 1.4.11 | `line-strong` borders on prep rows |
| Chrome vs content separation | Material “display” vs “body” | Two layers, two density rules |

Duolingo is not the spec — **confidence and legibility under stress** is. Learners
are producing language, not browsing settings.

## Two layers

```
┌─ Runner chrome (app density) ─────────────────────┐
│ Hero · progress · stop · step nav · primary CTA   │
│ Tokens: text-sm/xs labels, md nav chips         │
└───────────────────────────────────────────────────┘
┌─ Practice surface (task density) ─────────────────┐
│ Prompts · prep rows · inputs · capture · compare  │
│ Tokens: text-lg/xl prompts, 48px+ rows, chunky UI │
└───────────────────────────────────────────────────┘
```

**Chrome** = `ExerciseRunnerHero`, `ExerciseRunnerProgress`, `ExerciseRunnerFooter`.
**Surface** = everything inside `ExerciseStepBody`, built from practice-surface
primitives — never raw app-scale fields for the main task.

## Practice surface rules

1. **Lead copy** — `text-xl`/`text-lg`, `leading-relaxed`, `text-ink`. One block
   per step; no wall of labels.
2. **Interactive rows** — min height 48px, `border-line-strong`, `rounded-card`,
   `p-4`. Prep items are tappable-looking even when non-toggleable (visual honesty).
3. **Primary fields** — reuse `Field` + `Textarea` but inside surface wrapper
   (`text-base` input, generous `rows`).
4. **No fake checkboxes** — 1px `line` 16px squares fail WCAG and look broken.
   Use `PracticePrepRow` (2px `line-strong`, 24px box) or real controls later.
5. **i18n** — recipe carries `itemKeys` / `introKey`; no English in recipe JSON.
6. **Footer** — no extra `surface` panel; `border-t border-line` on `canvas` only.
7. **Anchored footer** — chrome bottom (`◀ ▶` + primary) stays at a fixed vertical
   position across steps; long content scrolls in the body zone with a canvas scrim
   above controls ([`exercise-runner.layout.md`](../specs/feature/exercise-runner.layout.md)).
8. **Content profiles** — `short` (prepare, type-with-word), `scroll` (long text,
   timed write), `paginated` (extensive reading, future). Authors size steps
   similarly where possible; layout contract handles the rest.

## Future step components

New exercise-step widgets (`cloze-type`, `minimal-pair`, …) ship as practice-surface
components first. App primitives (`Button`, `Dialog`) stay for chrome and offers.

## Open

- Timed-write countdown in footer thumb zone (today: header timer when `wait`).
- Extensive-reading **paginated** body (v2) — scroll profile ships first.
