# Table

<!-- id: SPEC-component-table -->
<!-- use-case: UC-003 -->
<!-- status: active -->

A semantic data table: `Table`, `Th`, `Td`.

## Scope

- **In:** table semantics, the required caption, header scope, the responsive
  scroll region and its keyboard access.
- **Out:** sorting, filtering, pagination, selection, inline editing, virtualised
  rows. Each is a feature with its own state; this is the shell they build on.

## Three exports, on purpose

The two things that make a table usable without sight — a caption, and `scope`
on every header — are exactly the two a plain `<table>` lets you forget. Here
`caption` is a required prop and `Th` cannot be written without a `scope`. The
type system carries the accessibility rule so review does not have to.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Reads with a screen reader | Each cell is announced with its column, and its row header where set |
| 2 | Views on a narrow screen with `layout="scroll"` (default) | The table scrolls inside its own box; the page does not |
| 3 | Tabs to a scroll-layout table | The scroll region takes focus and arrow keys pan it |
| 4 | Views a `layout="fit"` table | Cells wrap inside the viewport; no nested horizontal scroll region |

## States

The table has none of its own. Loading and empty belong to the feature that
owns the data — and are mutually exclusive with content there, not here
([STATE.md](../../STATE.md)).

## Accessibility

- **`caption` is required**, and may be visually hidden with
  `showCaption={false}` when a visible heading already says the same thing.
  Hidden is fine; absent is not — it is the only orientation a non-visual user
  gets about what the table lists.
- **`layout="scroll"`** (default): `overflow-x-auto` wrapper, `tabIndex={0}`,
  `role="region"`, and a label — for genuinely wide tables (orbit word list).
- **`layout="fit"`**: no horizontal scroll wrapper — for destination-page tables
  whose columns wrap (`table-fixed`, `break-words`). Signed-in scrollable
  destinations must not nest horizontal scroll regions
  ([`page-layout.md`](../feature/page-layout.md) § Destination scroll).
- `Th scope="col"` for column headers, `scope="row"` for the first cell of a
  row. Without scope, a screen reader reads a flat stream of values and the
  user has to remember the column order.
- Row headers render at normal weight — the semantic role does not require
  shouting.

## Acceptance criteria

- [ ] The rendered output is a real `<table>` with a `<caption>`.
- [ ] Given `showCaption={false}`, then the caption is in the accessibility tree
      but visually hidden.
- [ ] Every `Th` shall carry a `scope` attribute; omitting it shall not compile.
- [ ] Given `layout="scroll"`, the scroll container shall be focusable and labelled.
- [ ] Given `layout="scroll"`, wide content shall scroll inside the container, not move the page.
- [ ] Given `layout="fit"`, the wrapper shall not use `overflow-x-auto`.
- [ ] No axe-core violations.

## Check

`npm test -- table`
