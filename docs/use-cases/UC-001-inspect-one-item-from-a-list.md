# UC-001 — Inspect one item from a list

<!-- id: UC-001 -->
<!-- specs: SPEC-feature-item-picker, SPEC-component-button -->

**Who:** anyone browsing a set of records.
**Wants to:** pick one from a list and read its details.
**So that:** they can decide what to do about it without losing the list.

This ships as the base project's worked example. It is deliberately the smallest
use case that has a real contract behind it, and it stays until a project
replaces it.

## Today

The list and the details are two surfaces fed from separate props. Selecting a
row updates one of them. The other keeps showing the previous item — long enough
for someone to act on the wrong record.

## Success looks like

- Selecting a row shows that row's details.
- After selecting, **nothing anywhere on screen still refers to the previous
  selection.**
- Selecting the row that is already selected changes nothing — no reload, no
  flicker.
- The whole flow works with the keyboard alone, and a screen reader announces
  which row is selected.

## Out of scope

Loading data from a server, filtering, sorting, pagination, multi-select,
editing. This use case is about **coherence between surfaces**, and adding any of
those before that is solid just gives the incoherence more places to hide.
