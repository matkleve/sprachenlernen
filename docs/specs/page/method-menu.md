# Methods — the catalogue, filtered by context

<!-- id: SPEC-page-method-menu -->
<!-- use-case: UC-045 -->
<!-- status: active -->

The app's front door at `/methods` ([ADR-0010](../../adr/0010-the-route-model.md)):
say where you are, and see only the ways of practising you can actually do
there — each as a compact, tappable card. Serves
[UC-045](../../use-cases/UC-045-practise-in-the-situation-im-in.md) and
[UC-046](../../use-cases/UC-046-discover-a-method-i-never-tried.md)'s
"the full catalogue is browsable" through its unfiltered state. Card tap opens
the method detail page ([SPEC-page-method-detail](method-detail.md)).

**This is not the Daily menu.** `docs/GLOSSARY.md` reserves that term for the
three Methods offered today, composed from budget, floors, effect and
preference. Two of those three keys do not exist yet — see § Open questions.

## Scope

- **In:** the seven shipped Context presets as one-tap choices; a **custom**
  situation builder where each context dimension and the time budget are chosen
  individually; Methods that fit the active context; the whole catalogue when
  none is chosen; a **compact Method card** using chips for durations,
  requirements, effort, evidence and hosted status, with `doesNotDo` as prose;
  navigation to `/methods/{id}` on card tap; the state where nothing fits.
- **Out:** the Daily menu's three cards; learner-specific fields (readiness,
  "last done", measured effect); starting a Method; saving custom presets to
  storage; the skill filter (UC-046's second dimension); Commitments on this
  list. Per-method detail content beyond what the catalogue ships is covered by
  [method-detail.md](method-detail.md).

**Reuse: Chip** (`docs/specs/component/chip.md`) for property labels and filter
values. **Reuse: NavLink** for preset and time-budget chips.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/methods` with no filter | Every Method, grouped by section; presets and time chips visible |
| 2 | Taps a preset | Only Methods performable in that preset's context. Absent, never greyed out |
| 3 | Taps a time budget chip | Narrows to Methods whose shortest duration fits that budget, combined with any active situation |
| 4 | Opens "Customise situation" | Chip rows for each context dimension; each tap updates the URL and refilters |
| 5 | Taps a method card | Navigates to `/methods/{id}`, carrying the current filter query string |
| 6 | Taps the chosen preset again, or "any situation" | Whole catalogue; filter residue cleared |
| 7 | Chooses a context nothing fits | The gap is named; no Method list |
| 8 | Opens `/methods?context=` with an unknown id | Says so; shows whole catalogue |

**Filter composition.** Preset `?context=` sets all dimensions including a
default time. Individual dimension params (`eyes`, `hands`, …, `time`) without
`context` form a custom context — every dimension must be present before the
custom filter applies; until then the situation row shows what is missing.
`time` alone without a situation filters by duration only across the whole
catalogue.

## States

**Single source of truth: URL search parameters** — not `useState`. List, chosen
preset, time chip, and custom dimension chips all derive from the same params in
one render (`docs/STATE.md` §6).

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| `all` | no `context` and no complete custom params and no `time` | Whole catalogue | no |
| `preset` | `context` names a shipped preset | Filtered; that preset marked chosen | no |
| `custom` | all dimension params + `time` present, no `context` | Filtered to that context | no |
| `time-only` | only `time` set | Methods fitting that budget, any situation | no |
| `nothing-fits` | active context, zero Methods | Gap named | no |
| `unknown-context` | `context` not shipped | Message + whole catalogue | no |
| `unavailable` | catalogue load failed | Error callout | no |

## Data

Reads `data/methods/*.json` through `loadCatalogue`, `loadPresets`,
`filterByContext`, `matchesContext`, `fitsTime` and `isMethod` from
[`../service/method-catalogue.md`](../service/method-catalogue.md). Writes
nothing learner-specific.

**Order** is the catalogue's own — this page does not rank.

**Commitments** never appear in this list.

## Card layout

Each card shows: **title** and **summary** on one screenful; a **chip row** for
durations (one chip per variant, or "open-ended"), requirement values (one chip
each), effort (one chip), evidence grade (one chip), and hosted / not-hosted
(one chip); **"What it does not do"** as one or two lines of muted prose below
the chips. The whole card is one link to `/methods/{id}`.

## Accessibility

- Presets and filter chips are links with `aria-current` on the active one.
- Evidence grade chips include the letter, not colour alone.
- Cards are list items; each card link has an accessible name from the method
  name.

## Acceptance criteria

See [method-menu.acceptance-criteria.md](method-menu.acceptance-criteria.md).

## Open questions

**⚠ SPEC GAP: the Daily menu's three cards** — unchanged; needs review log and
effect estimate.

**⚠ SPEC GAP: saving custom situations as named presets** — UC-045 wants
editable presets; storage and editing are not in this slice. Custom builder is
URL-only for now.

**⚠ SPEC GAP: "nearest thing" when nothing fits** — gap is named; distance
between contexts undefined.

## Check

`npm test -- method-menu`
