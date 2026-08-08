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
| 2 | Views on a narrow screen | The table scrolls inside its own box; the page does not |
| 3 | Tabs to the table | The scroll region takes focus and arrow keys pan it |

## States

The table has none of its own. Loading and empty belong to the feature that
owns the data — and are mutually exclusive with content there, not here
([STATE.md](../../STATE.md)).

## Accessibility

- **`caption` is required**, and may be visually hidden with
  `showCaption={false}` when a visible heading already says the same thing.
  Hidden is fine; absent is not — it is the only orientation a non-visual user
  gets about what the table lists.
- The scroll container is `tabIndex={0}` with `role="region"` and a label. A
  scrollable box that only a mouse can pan is a WCAG failure, not a nicety.
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
- [ ] The scroll container shall be focusable and labelled.
- [ ] Wide content shall scroll inside the container, not move the page.
- [ ] No axe-core violations.

## Check

`npm test -- table`
