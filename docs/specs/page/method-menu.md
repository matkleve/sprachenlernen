# Methods — the catalogue, filtered by context

<!-- id: SPEC-page-method-menu -->
<!-- use-case: UC-045 -->
<!-- status: active -->

The app's front door at `/methods` ([ADR-0010](../../adr/0010-the-route-model.md)):
say where you are, and see only the ways of practising you can actually do
there — each as a compact, tappable card. Serves
[UC-045](../../use-cases/UC-045-practise-in-the-situation-im-in.md) and
[UC-046](../../use-cases/UC-046-discover-a-method-i-never-tried.md)'s
browse-and-filter goals. Hosted method cards **open the session directly**; off-app
cards open the detail page ([SPEC-page-method-detail](method-detail.md)).

**This is not the Daily menu.** `docs/GLOSSARY.md` reserves that term for the
three Methods offered today.

## Scope

- **In:** seven context presets; custom situation builder; **time** and **skill**
  filter chips; saved custom presets in browser storage; compact chip cards;
  hosted cards → session route; off-app cards → detail page; nothing-fits state.
- **Out:** Daily menu composition; learner-specific card fields; syncing saved
  presets across devices (local storage only in this slice); Commitments on this
  list; skill values beyond the four in `SKILLS`.

**Reuse: Chip**, **Reuse: NavLink**.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/methods` unfiltered | Whole catalogue, grouped by section |
| 2 | Taps a preset / time / skill chip | List narrows; params in URL |
| 3 | Customises situation | Dimension chips update URL; filters when complete |
| 4 | Saves a custom situation with a name | Stored locally; appears as a preset chip |
| 5 | Taps a **hosted** method card | Opens that method's session — no detail page, no duration picker |
| 6 | Taps an **off-app** card | Opens `/methods/{id}` detail |
| 7 | Clears filters | Whole catalogue; no residue |

**Filter composition:** context (preset or custom) ∩ time ∩ skill. Each dimension
is optional except a complete custom context requires every dimension + time.

## States

URL search parameters are the single source of truth (`docs/STATE.md` §6).

## Data

Reads catalogue via `loadCatalogue` / `loadPresets`. Saved presets read/write
`localStorage` in a client island only — not authoritative, not synced.

## Check

`npm test -- method-menu`

## Open questions

**⚠ SPEC GAP: Daily menu three cards** — needs review log and effect estimate.

**⚠ SPEC GAP: "nearest thing" when nothing fits** — distance undefined.

## Acceptance criteria

See [method-menu.acceptance-criteria.md](method-menu.acceptance-criteria.md).
