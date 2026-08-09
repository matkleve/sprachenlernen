# Specs

Implementation contracts. **This folder is the source of truth** — code
implements what is written here.

Format and size rules: [`../SPEC-FORMAT.md`](../SPEC-FORMAT.md).
Scaffold one: `npm run new:spec`.

## Taxonomy

| Folder | Holds | Rule of thumb |
| --- | --- | --- |
| `feature/` | one user-facing capability, end to end | mirrors `features/<name>/` |
| `component/` | a reusable primitive's contract | mirrors `components/ui/<Name>.tsx` |
| `page/` | a route's composition and page-level state | mirrors `app/<route>/` |
| `service/` | a boundary to something outside the app | mirrors `lib/<name>/` |

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

| ID | Spec | Use case | Status |
| --- | --- | --- | --- |
| `SPEC-feature-item-picker` | [feature/item-picker.md](feature/item-picker.md) | UC-001 | active |
| `SPEC-component-button` | [component/button.md](component/button.md) | UC-001 | active |
| `SPEC-component-field` | [component/field.md](component/field.md) | UC-002 | active |
| `SPEC-component-select` | [component/select.md](component/select.md) | UC-002 | active |
| `SPEC-component-dialog` | [component/dialog.md](component/dialog.md) | UC-002 | active |
| `SPEC-component-table` | [component/table.md](component/table.md) | UC-003 | active |
| `SPEC-service-lexicon` | [service/lexicon.md](service/lexicon.md) | UC-035 | active |
| `SPEC-service-scheduler` | [service/scheduler.md](service/scheduler.md) | UC-005 | active |
| `SPEC-service-method-catalogue` | [service/method-catalogue.md](service/method-catalogue.md) | UC-046 | active |
