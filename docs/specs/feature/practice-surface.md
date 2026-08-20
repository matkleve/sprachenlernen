# Practice surface

<!-- id: SPEC-feature-practice-surface -->
<!-- use-case: UC-049 -->
<!-- status: active -->

Visual and interaction contract for **task content** inside the exercise runner
(`/practice`) and future practice steps. Runner **chrome** (hero belt on desktop,
mobile strip, footer segmented progress + nav, primary CTA) keeps app density;
everything the learner reads or taps to *do the task* uses practice-surface scale.

Research: [`study/41-practice-surface-ux.md`](../../study/41-practice-surface-ux.md),
[`study/42-exercise-mobile-fit-frame.md`](../../study/42-exercise-mobile-fit-frame.md).
Parent: [`exercise-runner.md`](exercise-runner.md).

## Scope

- **In:** typography scale; prep rows; wrapper for step bodies; WCAG non-text
  contrast on decorative controls; i18n keys for recipe-fed copy; footer chrome
  (no third surface panel).
- **Out:** shell header, method menu, Words review cards (different surfaces).

## Layers

| Layer | Owner components | Density |
| --- | --- | --- |
| Chrome top (mobile) | `ExerciseRunnerMobileStrip` | Step label `text-base font-semibold` + stop |
| Chrome top (desktop) | `ExerciseRunnerHero` | 5rem belt + metadata |
| Chrome bottom | `ExerciseRunnerProgressBar`, `ExerciseRunnerFooter` | Segmented bars; mobile: bars only + one control row |
| Surface | `PracticeSurface`, `PracticePrepList`, step components | `text-base` on `< md`; `text-lg` on `md+` |

Runner root: `practice-fit-frame` when `one-screen-exercise` — see
[`exercise-runner.layout.md`](exercise-runner.layout.md) § Fit-frame density.

## Practice surface tokens (class contract)

Applied via `PracticeSurface` wrapper — not new CSS color tokens.

| Role | Classes |
| --- | --- |
| Lead prompt | `practiceLeadClass`: `text-xl font-medium` desktop; `text-base font-semibold` mobile — reads above prep rows |
| Body | `text-lg leading-relaxed text-ink` |
| Secondary | `text-base text-muted` |
| Prep row | `min-h-11` flex row — `bg-surface`, **no border**; label left, checkbox right, `items-start`; checked: `bg-accent-soft` |
| Prep checkbox | Right end of row, `self-start` (first line); native `input` (visually hidden); marker `size-6 border-2 border-line-strong`, filled `accent-deep` + check when checked |

## Behaviour

| # | Element | Rule |
| --- | --- | --- |
| 1 | Step body | Wrapped in `PracticeSurface` |
| 2 | Prepare checklist | `PracticePrepList` — label left, checkbox right, top-aligned; optional row `bg-accent-soft` when checked; does not gate **Weiter** |
| 3 | Runner footer | `border-t border-line` only — no `bg-surface` panel on `canvas` |
| 4 | Primary CTA | `Button` `lg` desktop; `h-10` mobile; bottom-right with nav on one row on phone |
| 5 | New step UI | Must use practice-surface primitives before app-scale fields |
| 6 | Long text steps | `scroll` or `paginated` profile only — short steps never scroll |
| 7 | Scroll body | `p-1` on the overflow container so focused fields keep full ring visible |

## Acceptance criteria

In [`practice-surface.acceptance-criteria.md`](practice-surface.acceptance-criteria.md).

## Check

`npm test -- practice-surface exercise-runner`
