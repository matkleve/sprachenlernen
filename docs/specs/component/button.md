# Button

<!-- id: SPEC-component-button -->
<!-- use-case: UC-001 -->
<!-- status: active -->

The one button primitive. Every clickable action in the app uses it — a bespoke
`<button>` with hand-written classes is a bug, not a shortcut. Also serves
[UC-068](../../use-cases/UC-068-know-my-tap-was-received.md) via the `pending`
action state ([`interaction-feedback.md`](../feature/interaction-feedback.md)).

## Scope

- **In:** visual variants, sizes, the five interaction states, a `pending` action
  state ([`interaction-feedback.md`](../feature/interaction-feedback.md)),
  rendering as a different element via `asChild`-style composition, disabled
  handling.
- **Out:** icon-only sizing rules, split buttons, anything that needs its own
  spec. Add those as variants here rather than as new components.

## Variants

| Variant | Use for | Fill / text |
| --- | --- | --- |
| `primary` | the one main action on a surface | `bg-accent` / `text-accent-ink` |
| `secondary` | supporting actions | `bg-surface` + `border-line` / `text-ink` |
| `floating` | floating shell chips (mobile corners) | `bg-surface` + `border-line` / `text-ink` + `shadow-soft` |
| `ghost` | low-emphasis, dense contexts, toolbars | transparent / `text-ink` |
| `danger` | destructive, irreversible actions | `bg-danger` / `text-danger-ink` |

| Size | Visual height | Target height | Use for |
| --- | --- | --- | --- |
| `sm` | 2rem (32px) | 2.75rem (44px) | dense toolbars |
| `md` | 2.5rem (40px) | 2.75rem (44px) | default |
| `lg` | 3rem (48px) | 3rem (48px) | primary page actions |

The **visual** box and the **interactive target** are separate. Sizes below
44px grow their target with a transparent pseudo-element rather than padding, so
a compact control stays compact without being hard to hit.

Do not implement this with `min-height`: `min-height` beats `height` in CSS, so
it silently collapses every size variant into one box — the variants stay in the
source and stop doing anything.

**At most one `primary` per surface.** Two primaries means neither is.

## States

All five are required — see [DESIGN-SYSTEM.md](../../DESIGN-SYSTEM.md) §
Interaction states for the canonical table.

| State | Effect |
| --- | --- |
| default | variant's resting fill |
| hover | fill deepens to the `-deep` token, lifts by 1px |
| active | returns to `translate-y-0`, scales to `0.98` |
| focus-visible | `ring-2 ring-accent ring-offset-2` |
| disabled | `opacity-50`, `pointer-events-none`, no lift |
| pending | muted fill, `aria-busy`, no second fire; optional spinner on `primary`/`danger` |

Hover uses a **defined darker token**, never `brightness()` or opacity: on
saturated fills a filter is barely visible, and on dark surfaces it moves the
wrong way.

## Accessibility

- Renders a real `<button>` with `type="button"` unless told otherwise — a `div`
  with `onClick` is not keyboard operable and never will be.
- `disabled` sets the DOM attribute; it does not just look faded. A button that
  looks disabled and still fires is worse than one that fires.
- Interactive target ≥ 44×44px at every size. WCAG 2.2 AA (2.5.8) requires
  24×24; 44×44 is the AAA and mobile-practice figure, and it is what this
  component holds itself to.
- Vertically stacked buttons need at least `gap-3`, or the expanded targets of
  adjacent `sm` buttons will overlap and steal each other's taps.
- Icon-only usage requires `aria-label`. Enforced by `eslint-plugin-jsx-a11y`.

## Acceptance criteria

- [ ] When rendered without props, the button shall be `variant="primary"`,
      `size="md"`, and `type="button"`.
- [ ] Given a disabled button, when it is clicked, then `onClick` is not called.
- [ ] When focused by keyboard, the button shall show a visible focus ring; when
      focused by mouse click, it shall not.
- [ ] Given a `className` prop that conflicts with the variant's own classes,
      then the caller's class wins (via `cn()`).
- [ ] Each size shall render a **different** visual height — no rule may
      collapse them into one box.
- [ ] Every variant/size combination has no axe-core violations.
- [ ] Given `pending={true}`, when clicked, then `onClick` is not called and
      `aria-busy` is true.

## Check

`npm test -- button`
