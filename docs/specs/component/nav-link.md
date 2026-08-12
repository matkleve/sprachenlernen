# NavLink

<!-- id: SPEC-component-nav-link -->
<!-- use-case: UC-063 -->
<!-- status: active -->

A link that can be **the one you are on**. The primitive behind both the app
shell's three destinations and the method menu's context chips — two surfaces
that both need "a set of links, one of which is current", which is what earned
it a place in `components/ui/` rather than a copy in each feature.

## Scope

- **In:** an anchor with pill geometry, the `current` state and the
  `aria-current="page"` that must accompany it, and a hit target of at least
  44px regardless of the visual height.
- **Out:** an inline text link inside a paragraph — that is a different look
  (underlined, no pill) and still has no primitive; the two existing uses are on
  `/` and stay hand-styled until a third appears. Also out: any icon, badge or
  count slot. UC-063 forbids a count in navigation, and a component with a slot
  for one is an invitation.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Sees a link that is not current | Muted label, no fill |
| 2 | Hovers it | Tinted fill and full-strength label |
| 3 | Presses it | Compresses slightly, so it reads as pressed |
| 4 | Tabs to it | A focus ring, offset from the surface behind it |
| 5 | Sees the current one | Tinted fill and full-strength label at rest, and `aria-current="page"` |
| 6 | Taps anywhere within 44px of it | It activates — the target is larger than the pill |
| 7 | Taps another destination in the shell nav | Selection moves immediately to the tapped link (`pendingPolicy="nav"`) — the previous destination loses its fill before the route settles |

## States

No machine (`docs/STATE.md` §1): `current` is a prop derived by the caller from
the URL, and every other state is a CSS pseudo-class the browser owns. Shell
destinations wrap in `NavigationPendingProvider` so `current` follows the
pending href during client navigation.

**Four of the five interaction states, and the fifth does not exist here.** An
anchor has no `disabled`: a link with no destination is not a disabled link, it
is not a link, and `pointer-events-none` on an anchor leaves it in the tab order
announcing a destination it will not go to. Where a destination is unavailable,
render something that is not a link. `default`, `hover`, `active` and
`focus-visible` are all present and are not waivable.

`current` is a fifth state specific to navigation, and it is deliberately the
same fill as `hover` rather than a stronger one: the current item is where you
already are, so it is the one that needs the *least* pull.

## Data

Takes `href`, `current` and children. **Takes no number, and has no slot that
could hold one** — see § Scope. The `current` prop drives the class and the
ARIA attribute from one value, so a link cannot look current and fail to
announce it.

## Acceptance criteria

- [ ] Given `current`, when it renders, then the anchor carries
      `aria-current="page"`.
- [ ] Given no `current`, then the anchor carries no `aria-current` attribute at
      all — absent, not `"false"`.
- [ ] Given any props, then it renders an anchor with the `href` it was given,
      so middle-click and open-in-new-tab work.
- [ ] Given a `className` from the caller, then it overrides the component's own
      conflicting utility rather than being appended and losing.
- [ ] Given the rendered link, then it carries a visible focus-visible ring, and
      hover and active treatments that differ from the resting one.
- [ ] The rendered link has no axe-core violations.

## Check

`npm test -- nav-link`
