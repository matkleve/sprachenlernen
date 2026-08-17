# Specs

Implementation contracts. **This folder is the source of truth** — code
implements what is written here.

Format and size rules: [`../SPEC-FORMAT.md`](../SPEC-FORMAT.md).
Scaffold one: `npm run new:spec`.

**Index synced 2026-08-17.** 80 canonical specs — 71 active,
2 superseded, 7 draft. `npm run check:specs` verifies
bidirectional traceability to use cases; this index is for navigation. Regenerate
after adding specs: `node scripts/generate-specs-index.mjs`.

## Taxonomy

| Folder | Holds | Rule of thumb |
| --- | --- | --- |
| `feature/` | one user-facing capability, end to end | mirrors `features/<name>/` |
| `component/` | a reusable primitive's contract | mirrors `components/ui/<Name>.tsx` |
| `page/` | a route's composition and page-level state | mirrors `app/<route>/` |
| `service/` | a boundary to something outside the app | mirrors `lib/<name>/` |
| `system/` | cross-cutting gates and inventories | mirrors `scripts/` or repo-wide rules |

The folder mirrors the code path. When you cannot decide which folder a spec
belongs in, you have usually not decided where the code goes either — decide
that first.

## Rules

- **One canonical spec per thing.** Detail goes into linked sibling files, never
  into a second copy under a different folder.
- **A spec never restates another spec.** Link to it. Two copies of a rule means
  one of them is already wrong, you just don't know which.
- **Specs describe token names, never hex values.** Values live in
  `app/globals.css`.
- **Every spec names one runnable check.** "It builds" is not a check.

## Index

### component/ (18)

| ID | Spec | Use case | Status |
| --- | --- | --- | --- |
| `SPEC-component-button` | [button.md](component/button.md) | UC-001 | active |
| `SPEC-component-chip` | [chip.md](component/chip.md) | UC-045 | active |
| `SPEC-component-dialog` | [dialog.md](component/dialog.md) | UC-002 | active |
| `SPEC-component-disclosure` | [disclosure.md](component/disclosure.md) | UC-068 | active |
| `SPEC-component-error-callout` | [error-callout.md](component/error-callout.md) | UC-065 | active |
| `SPEC-component-field` | [field.md](component/field.md) | UC-002 | active |
| `SPEC-component-language-flag` | [language-flag.md](component/language-flag.md) | UC-025 | active |
| `SPEC-component-language-list-row` | [language-list-row.md](component/language-list-row.md) | UC-025 | active |
| `SPEC-component-method-badge` | [method-badge.md](component/method-badge.md) | UC-046 | active |
| `SPEC-component-method-card-header` | [method-card-header.md](component/method-card-header.md) | UC-045 | active |
| `SPEC-component-nav-link` | [nav-link.md](component/nav-link.md) | UC-063 | active |
| `SPEC-component-orbit-detail-card` | [orbit-detail-card.md](component/orbit-detail-card.md) | UC-031 | active |
| `SPEC-component-reflection-deck` | [reflection-deck.md](component/reflection-deck.md) | UC-004 | active |
| `SPEC-component-route-error-surface` | [route-error-surface.md](component/route-error-surface.md) | UC-065 | active |
| `SPEC-component-select` | [select.md](component/select.md) | UC-002 | active |
| `SPEC-component-skill-tier-badge` | [skill-tier-badge.md](component/skill-tier-badge.md) | UC-042 | active |
| `SPEC-component-status-banner` | [status-banner.md](component/status-banner.md) | UC-074 | active |
| `SPEC-component-table` | [table.md](component/table.md) | UC-003 | active |

### feature/ (22)

| ID | Spec | Use case | Status |
| --- | --- | --- | --- |
| `SPEC-feature-account-data` | [account-data.md](feature/account-data.md) | UC-024 | active |
| `SPEC-feature-app-shell` | [app-shell.md](feature/app-shell.md) | UC-063 | active |
| `SPEC-feature-app-update` | [app-update.md](feature/app-update.md) | UC-072 | active |
| `SPEC-feature-content-gap` | [content-gap.md](feature/content-gap.md) | UC-034 | draft |
| `SPEC-feature-content-traceability` | [content-traceability.md](feature/content-traceability.md) | UC-031 | draft |
| `SPEC-feature-demonstration-sentence` | [demonstration-sentence.md](feature/demonstration-sentence.md) | UC-050 | active |
| `SPEC-feature-exercise-runner` | [exercise-runner.md](feature/exercise-runner.md) | UC-049 | draft |
| `SPEC-feature-interaction-feedback` | [interaction-feedback.md](feature/interaction-feedback.md) | UC-068 | active |
| `SPEC-feature-item-picker` | [item-picker.md](feature/item-picker.md) | UC-001 | superseded |
| `SPEC-feature-method-material-setup` | [method-material-setup.md](feature/method-material-setup.md) | UC-046 | draft |
| `SPEC-feature-mobile-nav` | [mobile-nav.md](feature/mobile-nav.md) | UC-063 | superseded |
| `SPEC-feature-mobile-nav-v2` | [mobile-nav-v2.md](feature/mobile-nav-v2.md) | UC-063 | active |
| `SPEC-feature-page-layout` | [page-layout.md](feature/page-layout.md) | UC-063 | active |
| `SPEC-feature-privacy-consent` | [privacy-consent.md](feature/privacy-consent.md) | UC-011 | active |
| `SPEC-feature-pwa-install` | [pwa-install.md](feature/pwa-install.md) | UC-072 | active |
| `SPEC-feature-review-card-report` | [review-card-report.md](feature/review-card-report.md) | UC-073 | active |
| `SPEC-feature-review-horizon` | [review-horizon.md](feature/review-horizon.md) | UC-005 | active |
| `SPEC-feature-review-session` | [review-session.md](feature/review-session.md) | UC-011 | active |
| `SPEC-feature-vocabulary-orbit` | [vocabulary-orbit.md](feature/vocabulary-orbit.md) | UC-031 | active |
| `SPEC-feature-weekly-reflection` | [weekly-reflection.md](feature/weekly-reflection.md) | UC-004 | active |
| `SPEC-feature-word-detail` | [word-detail.md](feature/word-detail.md) | UC-038 | active |
| `SPEC-feature-words-home` | [words-home.md](feature/words-home.md) | UC-063 | active |

### page/ (12)

| ID | Spec | Use case | Status |
| --- | --- | --- | --- |
| `SPEC-page-brand-explorer` | [brand-explorer.md](page/brand-explorer.md) | UC-075 | active |
| `SPEC-page-design-explorer` | [design-explorer.md](page/design-explorer.md) | UC-067 | active |
| `SPEC-page-landing` | [landing.md](page/landing.md) | UC-011 | active |
| `SPEC-page-language-picker` | [language-picker.md](page/language-picker.md) | UC-025 | active |
| `SPEC-page-language-status` | [language-status.md](page/language-status.md) | UC-036 | active |
| `SPEC-page-method-detail` | [method-detail.md](page/method-detail.md) | UC-042 | active |
| `SPEC-page-method-menu` | [method-menu.md](page/method-menu.md) | UC-045 | active |
| `SPEC-page-practice` | [practice.md](page/practice.md) | UC-049 | draft |
| `SPEC-page-profile` | [profile.md](page/profile.md) | UC-024 | active |
| `SPEC-page-progress` | [progress.md](page/progress.md) | UC-004 | active |
| `SPEC-page-words` | [words.md](page/words.md) | UC-063 | active |
| `SPEC-page-words-review` | [words-review.md](page/words-review.md) | UC-063 | active |

### service/ (26)

| ID | Spec | Use case | Status |
| --- | --- | --- | --- |
| `SPEC-service-auth` | [auth.md](service/auth.md) | UC-011 | active |
| `SPEC-service-broken-card-detection` | [broken-card-detection.md](service/broken-card-detection.md) | UC-013 | active |
| `SPEC-service-coverage` | [coverage.md](service/coverage.md) | UC-007 | draft |
| `SPEC-service-discovery` | [discovery.md](service/discovery.md) | UC-011 | active |
| `SPEC-service-dose-band` | [dose-band.md](service/dose-band.md) | UC-004 | active |
| `SPEC-service-errors` | [errors.md](service/errors.md) | UC-065 | active |
| `SPEC-service-errors-boundaries` | [errors-boundaries.md](service/errors-boundaries.md) | UC-065 | active |
| `SPEC-service-errors-telemetry` | [errors-telemetry.md](service/errors-telemetry.md) | UC-066 | active |
| `SPEC-service-form-mastery-signal` | [form-mastery-signal.md](service/form-mastery-signal.md) | UC-041 | active |
| `SPEC-service-form-practice` | [form-practice.md](service/form-practice.md) | UC-041 | draft |
| `SPEC-service-form-recall-pool` | [form-recall-pool.md](service/form-recall-pool.md) | UC-041 | active |
| `SPEC-service-frequency-blocks` | [frequency-blocks.md](service/frequency-blocks.md) | UC-032 | active |
| `SPEC-service-learning-languages` | [learning-languages.md](service/learning-languages.md) | UC-025 | active |
| `SPEC-service-lexicon` | [lexicon.md](service/lexicon.md) | UC-035 | active |
| `SPEC-service-method-catalogue` | [method-catalogue.md](service/method-catalogue.md) | UC-046 | active |
| `SPEC-service-method-engines` | [method-engines.md](service/method-engines.md) | UC-046 | active |
| `SPEC-service-practice-model` | [practice-model.md](service/practice-model.md) | UC-010 | active |
| `SPEC-service-review-log` | [review-log.md](service/review-log.md) | UC-005 | active |
| `SPEC-service-review-write-queue` | [review-write-queue.md](service/review-write-queue.md) | UC-018 | active |
| `SPEC-service-scheduler` | [scheduler.md](service/scheduler.md) | UC-005 | active |
| `SPEC-service-session-builder` | [session-builder.md](service/session-builder.md) | UC-011 | active |
| `SPEC-service-spoken-language` | [spoken-language.md](service/spoken-language.md) | UC-069 | active |
| `SPEC-service-starter-deck` | [starter-deck.md](service/starter-deck.md) | UC-011 | active |
| `SPEC-service-task-state` | [task-state.md](service/task-state.md) | UC-005 | active |
| `SPEC-service-time-scale` | [time-scale.md](service/time-scale.md) | UC-045 | active |
| `SPEC-service-vocabulary-snapshot` | [vocabulary-snapshot.md](service/vocabulary-snapshot.md) | UC-005 | active |

### system/ (2)

| ID | Spec | Use case | Status |
| --- | --- | --- | --- |
| `SPEC-system-contrast-gate` | [contrast-gate.md](system/contrast-gate.md) | UC-068 | active |
| `SPEC-system-interaction-inventory` | [interaction-inventory.md](system/interaction-inventory.md) | UC-068 | active |

