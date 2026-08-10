# Item picker

<!-- id: SPEC-feature-item-picker -->
<!-- use-case: UC-001 -->
<!-- status: superseded -->

**Superseded by [`review-session.md`](review-session.md)** and
[`account-data.md`](account-data.md) (2026-08-10, T-B5). The Grundriss
`item-picker` demo code is retired; state coherence is demonstrated by the
review session FSM.

## Historical contract

- **In:** selection, keyboard operation, the coherence guarantee between list
  and detail panel, empty state before a first selection.
- **Out:** data fetching, filtering, sorting, pagination, multi-select, editing.
  Items are a static array passed in as a prop.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Loads the surface | List renders all items, none selected, detail panel shows its empty state |
| 2 | Clicks a row | That row becomes selected; the detail panel shows its title and body |
| 3 | Clicks the selected row again | Nothing changes — no re-render of the panel, no flicker |
| 4 | Presses `Tab` | Focus moves to the list, then through the rows |
| 5 | Presses `Enter` or `Space` on a focused row | Same as clicking it |

## States

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| `empty` | initial, `selectedId === null` | Detail panel shows a prompt to pick an item | no |
| `selected` | a row is activated | Detail panel shows that item; the row is visually and semantically marked | no |

`empty` and `selected` are mutually exclusive and both derive from one value —
there is no third state where the panel shows something stale.

## Data

`items: Item[]` passed as a prop. `Item = { id: string; title: string; body: string }`.
`id` is unique and stable; it is the only thing selection stores.

## Wiring — the contract

**One piece of state: `selectedId: string | null`.** The selected item, the
panel's title, and the panel's body are all *derived* from it. No surface holds a
copy, so no surface can lag behind another.

```tsx
const [selectedId, setSelectedId] = useState<string | null>(null);
const selected = items.find((i) => i.id === selectedId) ?? null;  // derived
```

Activating a row sets **only** `selectedId`. This makes the incoherence bug
structurally impossible rather than merely tested-against: there is no code path
that could update one surface without the other, because neither owns selection.

## Accessibility

- The list is a `<ul>`; each row is a `<button>` inside an `<li>`.
- The selected row carries `aria-current="true"`.
- The detail panel is `aria-live="polite"` so a change is announced.
- Focus stays on the activated row — selecting must not move focus to the panel,
  or keyboard users lose their place in the list.

## Acceptance criteria

- [ ] Given no selection, when the surface renders, then the detail panel shows
      the empty prompt and no item's body.
- [ ] Given item A is selected, when I select item B, then the panel shows B's
      title and body **and no text from A appears anywhere in the output**.
- [ ] Given item B is selected, when I activate item B again, then the rendered
      output is unchanged.
- [ ] Given the list has focus, when I press `Enter` on a row, then that row is
      selected and retains focus.
- [ ] Given the list has focus, when I press `Space` on a row, then that row is
      selected and retains focus. Nothing implements this beyond the row being a
      real `<button>`, which is the reason it is asserted rather than assumed.
- [ ] When an item is selected, its row shall carry `aria-current="true"` and no
      other row shall.
- [ ] The rendered surface has no axe-core violations.

## Check

`npm test -- review-session account-data`
