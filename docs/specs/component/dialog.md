# Dialog

<!-- id: SPEC-component-dialog -->
<!-- use-case: UC-002 -->
<!-- status: active -->

A modal built on the native `<dialog>` element.

## Scope

- **In:** open/close driven by a prop, Escape, backdrop dismissal, the title and
  description contract, an actions footer.
- **Out:** non-modal popovers, drawers, nested dialogs, and any dialog that owns
  its own open state. Open state belongs to the caller.

## Why native

`showModal()` supplies, from the platform: a focus trap, Escape to close, the
top layer (so no `z-index` can ever fight it), `inert` on everything behind it,
and a styleable `::backdrop`. Each of those is a well-known way to get a
hand-rolled modal wrong, and each costs zero lines here.

The cost is that jsdom implements none of it, so the test environment shims
`showModal`/`close` (`tests/setup.ts`). The shim deliberately does **not** fake
focus trapping — a shim that pretended to would let a broken modal pass. Focus
behavior is browser-verified, not unit-tested.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | `open` becomes true | Dialog shows modally; focus moves inside |
| 2 | Presses Escape | `onClose` fires |
| 3 | Clicks the backdrop | `onClose` fires, unless `dismissOnBackdrop` is false |
| 4 | Clicks inside the content | Nothing closes |
| 5 | `open` becomes false | Dialog closes; focus returns to the trigger |

## States

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| closed | `open === false` | not rendered to the user, not focusable | no |
| open | `open === true` | modal, background inert, focus trapped | no |

The element is driven **from** the prop and never mirrors its own state back
into React. One source of truth, so the DOM cannot disagree with the caller —
see [STATE.md](../../STATE.md).

## Accessibility

- `aria-labelledby` points at the title, which is always rendered.
- Closing is handled by the element's `close` event, not a keydown listener, so
  Escape and programmatic close take the same path.
- **`dismissOnBackdrop` must be `false` for destructive confirmations.** A stray
  click outside should never be the thing that resolves "delete everything?".
- The confirming action goes last in the footer; it reads as the endpoint of the
  row in both visual and focus order.

## Acceptance criteria

- [ ] Given `open` is true, then the dialog element shall be open.
- [ ] Given `open` becomes false, then the dialog shall close.
- [ ] When the element emits `close` (Escape included), `onClose` shall fire.
- [ ] Given a click on the dialog element itself, then `onClose` fires.
- [ ] Given a click on content inside the dialog, then `onClose` does **not** fire.
- [ ] Given `dismissOnBackdrop` is false, then a backdrop click does nothing.
- [ ] The dialog is labelled by its title.
- [ ] No axe-core violations while open.

## Check

`npm test -- dialog`
