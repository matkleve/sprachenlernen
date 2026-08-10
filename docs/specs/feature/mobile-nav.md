# Mobile navigation — hamburger drawer with icons

<!-- id: SPEC-feature-mobile-nav -->
<!-- use-case: UC-063 -->
<!-- status: draft -->

Responsive navigation for the signed-in shell on phone-width viewports. Desktop
keeps the current horizontal destination links; mobile collapses them behind a
hamburger control that opens a labelled drawer with icons.

**Parent:** [`app-shell.md`](app-shell.md). **Does not add destinations** —
still exactly Methods, Words, Progress (ADR-0009). **No due-count badges**
(UC-063).

## Research note (2026)

Industry practice for **3–5 primary sections** favours a **bottom tab bar**
within thumb reach (Material Design 3, Apple HIG, Nielsen Norman Group). Hamburger
menus hide navigation and reduce discoverability — acceptable for **secondary**
items, less ideal for daily destinations.

This spec chooses a **hamburger drawer** because:

1. The current shell is a top header; a bottom bar is a larger visual change.
2. Sign-out and future account links fit naturally at the drawer foot.
3. The owner validates on phone frequently and asked for an explicit hamburger
   pattern to review.

**Future option:** evolve to bottom tabs on `sm` only if user testing shows
drawer friction. Document that fork here before implementing.

Icons: **lucide-react** (already in the project). Pair every icon with its
text label — icons alone fail WCAG and usability studies (~20–30% faster scan
with labels).

Suggested mapping:

| Destination | Icon (lucide) | Label |
| --- | --- | --- |
| Methods | `Library` or `Compass` | Methods |
| Words | `BookOpen` | Words |
| Progress | `TrendingUp` | Progress |
| Menu control | `Menu` / `X` when open | Menu (visible text beside icon on mobile) |

## Scope

- **In:** breakpoint behaviour; hamburger button; slide-in drawer overlay;
  destination list with icon + label; `aria-expanded`, focus trap, Escape to
  close; sign-out in drawer on mobile; icons beside labels on desktop nav too;
  `prefers-reduced-motion` respects instant open/close.
- **Out:** bottom tab bar (deferred alternative); profile/settings destination;
  notification badges; changing destination order or count; marketing shell.

**Reuse:** `NavLink`, `Button`, `Destinations` destination list (single source
of truth for hrefs — do not fork the route table).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Viewport ≥ `md` (768px) | Horizontal nav: icon + label per destination; sign-out stays in header |
| 2 | Viewport &lt; `md` | Header shows app mark (optional) + hamburger; destinations hidden until opened |
| 3 | Taps hamburger | Drawer opens from the left; backdrop dims content; focus moves to first link |
| 4 | Taps a destination in drawer | Navigates, drawer closes, focus returns to hamburger |
| 5 | Taps backdrop or Escape | Drawer closes without navigation |
| 6 | Taps sign-out in drawer | Same `signOutAction` as desktop |

## States

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| `closed` | initial / after navigate / dismiss | Only hamburger visible on mobile | no |
| `open` | hamburger activated | Drawer + backdrop shown | no |

Mutually exclusive. Not persisted across reloads.

## Accessibility

- Hamburger: `aria-controls` → drawer id; `aria-expanded` true/false.
- Drawer: `role="dialog"` or navigation region with `aria-modal="true"`;
  labelled *"Destinations"* (reuse `copy.navLabel`).
- Touch targets: minimum **44×44px** on hamburger and every drawer row.
- Focus trap while open; restore focus to hamburger on close.
- `prefers-reduced-motion`: no slide animation — instant show/hide.

## Acceptance criteria

- [ ] Given viewport &lt; `md` and a signed-in session, when the shell renders,
      then a hamburger control is visible and the three text tabs are not.
- [ ] Given the drawer is open, when the user taps Words, then `/words` loads
      and the drawer closes.
- [ ] Given any viewport, then exactly three destinations render — no fourth, no
      due-count badge (UC-063 negative).
- [ ] Given viewport ≥ `md`, when the shell renders, then destinations show
      icon + label inline without a hamburger.
- [ ] Given the drawer, when tested with axe-core, then there are no violations.
- [ ] Given `prefers-reduced-motion: reduce`, when opening the menu, then no
      transform animation runs.

## Check

Deferred until implementation — see [`../../plans/mobile-nav.md`](../../plans/mobile-nav.md).
When the feature ships, add `mobile-nav.test.tsx` and wire the Check command then.

## Implementation plan

See [`../../plans/mobile-nav.md`](../../plans/mobile-nav.md).
