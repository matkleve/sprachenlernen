# Practice surface

<!-- id: SPEC-feature-practice-surface -->
<!-- use-case: UC-049 -->
<!-- status: active -->

Visual and interaction contract for **task content** inside the exercise runner
(`/practice`) and future practice steps. Runner **chrome** (hero, progress, nav,
primary CTA) keeps app density; everything the learner reads or taps to *do the
task* uses practice-surface scale.

Research: [`study/41-practice-surface-ux.md`](../../study/41-practice-surface-ux.md).
Parent: [`exercise-runner.md`](exercise-runner.md).

## Scope

- **In:** typography scale; prep rows; wrapper for step bodies; WCAG non-text
  contrast on decorative controls; i18n keys for recipe-fed copy; footer chrome
  (no third surface panel).
- **Out:** shell header, method menu, Words review cards (different surfaces).

## Layers

| Layer | Owner components | Density |
| --- | --- | --- |
| Chrome | `ExerciseRunnerHero`, `ExerciseRunnerProgress`, `ExerciseRunnerFooter` | App (`text-sm` labels, `Button` sm/md) |
| Surface | `PracticeSurface`, `PracticePrepList`, step components in `ExerciseStepBody` | Task (`text-lg`–`xl` leads, 48px+ rows) |

## Practice surface tokens (class contract)

Applied via `PracticeSurface` wrapper — not new CSS color tokens.

| Role | Classes |
| --- | --- |
| Lead prompt | `text-xl font-medium leading-snug text-ink` |
| Body | `text-lg leading-relaxed text-ink` |
| Secondary | `text-base text-muted` |
| Prep row | `min-h-12 rounded-card border border-line-strong bg-surface p-4 shadow-soft` — toggles to `border-accent bg-accent-soft` when checked |
| Prep checkbox | Native `input` (visually hidden); marker `size-6 border-2 border-line-strong`, filled `accent-deep` + check icon when checked |

## Behaviour

| # | Element | Rule |
| --- | --- | --- |
| 1 | Step body | Wrapped in `PracticeSurface` |
| 2 | Prepare checklist | `PracticePrepList` — learner can check each row; does not gate **Weiter** |
| 3 | Runner footer | `border-t border-line` only — no `bg-surface` panel on `canvas` |
| 4 | Primary CTA | `Button` `lg`, `w-auto`, bottom-right stack under nav chips |
| 5 | New step UI | Must use practice-surface primitives before app-scale fields |
| 6 | Long text steps | `scroll` or `paginated` profile — never grow the page past the footer |
| 7 | Scroll body | `p-1` on the overflow container so focused fields keep full ring visible |

## Acceptance criteria

In [`practice-surface.acceptance-criteria.md`](practice-surface.acceptance-criteria.md).

## Check

`npm test -- practice-surface exercise-runner`
