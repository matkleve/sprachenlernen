# Practice surface

<!-- id: SPEC-feature-practice-surface -->
<!-- use-case: UC-049 -->
<!-- status: active -->

Visual and interaction contract for **task content** inside the exercise runner
(`/practice`) and future practice steps. Runner **chrome** (hero belt on desktop,
mobile strip, footer segmented progress + nav, primary CTA) keeps app density;
everything the learner reads or taps to *do the task* uses practice-surface scale.

Research: [`reviews/design/DR-041-practice-surface-ux.md`](../../reviews/design/DR-041-practice-surface-ux.md),
[`reviews/design/DR-043-exercise-mobile-fit-frame.md`](../../reviews/design/DR-043-exercise-mobile-fit-frame.md).
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
| Prep row | `min-h-11 items-center` flex row — `bg-surface`, **`border-x border-line-strong`**, `px-4 py-3`; label left `font-semibold`, checkbox right; checked: `bg-accent-soft` |
| Prep checkbox | `Checkbox` `md` at row end — sr-only input; marker `size-6 border-2 border-line-strong rounded-md` |

## Behaviour

| # | Element | Rule |
| --- | --- | --- |
| 1 | Step body | Wrapped in `PracticeSurface` |
| 2 | Prepare checklist | `PracticePrepList` — label left, checkbox right, vertically centered; optional row `bg-accent-soft` when checked; does not gate **Weiter** |
| 3 | Runner footer | `border-t border-line` only — no `bg-surface` panel on `canvas` |
| 4 | Primary CTA | `Button` `lg` desktop; `h-10` mobile; bottom-right with nav on one row on phone |
| 5 | New step UI | Must use practice-surface primitives before app-scale fields |
| 6 | Long text steps | `scroll` or `paginated` profile only — short steps never scroll |
| 7 | Scroll body | `p-1` on the overflow container so focused fields keep full ring visible |

## Acceptance criteria

In [`practice-surface.acceptance-criteria.md`](practice-surface.acceptance-criteria.md).

## Check

`npm test -- practice-surface exercise-runner`
