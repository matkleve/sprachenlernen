# UC-003 — Scan a table of records

<!-- id: UC-003 -->
<!-- specs: SPEC-component-table -->

**Who:** anyone comparing several records at once.
**Wants to:** scan a set of rows and find the one that needs attention.
**So that:** they can act on it without opening each record in turn.

## Today

The table is a grid of `<div>`s, so a screen reader reads a flat stream of
values with no idea which column each belongs to. On a phone it pushes the
whole page sideways. Nothing says what the table is a list *of*.

## Success looks like

- Every cell's column — and where relevant its row — is announced with it.
- The table can be read on a phone without the page itself scrolling sideways.
- The horizontal scroll region can be reached and moved with a keyboard.
- The table states what it lists, whether or not that is visible on screen.

## Out of scope

Sorting, filtering, pagination, selection, inline editing, virtualised rows.
Each is a feature with its own state and its own spec; this is the semantic and
responsive shell they would be built on.
