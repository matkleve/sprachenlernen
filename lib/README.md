# lib/

Framework-free helpers. No React components, no fetch in top-level modules.
Given the same input, returns the same output.

Most files still live at the root of `lib/` for historical reasons. When adding
code, prefer the subfolder that matches the domain. A future pass may move
root files into these groups without changing behaviour.

## Subfolders (preferred home for new code)

| Folder | Domain |
| --- | --- |
| `db/` | Supabase client, queries, row types |
| `exercise-recipe/` | Per-method exercise step recipes |
| `exercise-runner/` | Runner state machine and step types |
| `exercise-step-components/` | Step component registry |
| `i18n/` | Locale helpers and message loading |
| `sentence-check/` | Sentence validation |
| `sentence-realizer/` | Lemma-table sentence generation |
| `simulation/` | Synthetic learners (see `docs/SIMULATION.md`) |

## Root files — domain map

Use this when grepping. Prefix is the first segment before `-` in the filename.

| Prefix / area | Examples | Notes |
| --- | --- | --- |
| **method-** | `method-catalogue.ts`, `method-session.ts`, `method-menu-filter.ts` | Catalogue, session contract, menu filters |
| **exercise-** | `exercise-recipe.ts`, `exercise-step-audio.ts` | Runner wiring (recipes in subfolder) |
| **content-** | `content-sources.ts`, `content-gap.ts`, `content-ingestion.ts` | Texts, sources, coverage |
| **adaptation-** / **learner-adaptation** | `adaptation-preview.ts`, `learner-adaptation.ts` | LLM adaptation pipeline |
| **review-** / **scheduler** | `scheduler.ts`, `review-horizon.ts`, `review-session-*` | FSRS and review session |
| **vocabulary-** / **lexicon** / **lemma** | `lexicon.ts`, `vocabulary-orbit.ts`, `lemma-table.ts` | Pools, orbit, lemma tables |
| **level-** / **skill-** | `level-model.ts`, `skill-tier.ts` | CEFR standing and badges |
| **progression-** / **wood-** / **material-** | `progression-stage.ts`, `wood-grain.ts`, `material-recipes.ts` | Progression materials |
| **form-** / **paradigm-** | `form-recall-pool.ts`, `paradigm-cells.ts` | Form drills |
| **routes** / **shell-** / **site-** | `routes.ts`, `shell-page-layout.ts`, `site-metadata.ts` | Routing and shell |
| **auth** / **supabase** / **safe-redirect** | `auth-error-code.ts`, `supabase-auth-cookie.ts` | Auth helpers |
| **i18n** (root files) | `localize-method-entry.ts`, `localize-card-description.ts` | Card copy resolution |
| **dev-pages** / **safari-bisect** | `dev-pages.ts`, `safari-bisect.ts` | Dev/QA tooling |

## Exceptions

Some `lib/` modules import React or touch the database client — usually
`lib/db/*`, canvas helpers (`wood-grain.ts`), or theme hooks used only from dev
pages. Do not add new React imports at the `lib/` root; put UI in `features/`.

**Dependency rule:** `lib/` never imports from `features/` or `app/`. See
[`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md).
