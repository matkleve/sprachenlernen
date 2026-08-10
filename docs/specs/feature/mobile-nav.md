# Mobile navigation — hamburger drawer with icons

<!-- id: SPEC-feature-mobile-nav -->
<!-- use-case: UC-063 -->
<!-- status: active -->

Responsive navigation for the signed-in shell on phone-width viewports. Desktop
keeps horizontal destination links with icons; mobile collapses them behind a
hamburger that opens a labelled drawer.

**Parent:** [`app-shell.md`](app-shell.md). Still exactly Methods, Words, Progress
(ADR-0009). **No due-count badges** (UC-063).

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
| Methods | `Library` | Methods |
| Words | `BookOpen` | Words |
| Progress | `TrendingUp` | Progress |
| Menu control | `Menu` / `X` when open | Menu (visible text beside icon on mobile) |

## Scope

- **In:** breakpoint behaviour; hamburger; slide-in drawer; icon + label rows;
  `aria-expanded`, focus trap, Escape; sign-out in drawer on mobile; desktop
  icons; `prefers-reduced-motion` instant open/close.
- **Out:** bottom tab bar; profile destination; notification badges; marketing shell.

**Reuse:** `NavLink`, `Button`, shared `shellDestinations` in `destinations.ts`.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Viewport ≥ `md` | Horizontal nav with icon + label; sign-out in header |
| 2 | Viewport &lt; `md` | Hamburger visible; destination tabs hidden |
| 3 | Taps hamburger | Drawer opens; backdrop dims content; focus moves to first link |
| 4 | Taps a destination | Navigates; drawer closes |
| 5 | Taps backdrop or Escape | Drawer closes |
| 6 | Taps sign-out in drawer | Same `signOutAction` as desktop |

## States

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| `closed` | initial / dismiss / navigate | Hamburger only on mobile | no |
| `open` | hamburger activated | Drawer + backdrop | no |

## Accessibility

- Hamburger: `aria-controls`, `aria-expanded`.
- Drawer: `role="dialog"`, `aria-modal="true"`, labelled with `copy.navLabel`.
- Touch targets ≥ 44×44px.
- Focus trap while open; restore focus to hamburger on close.
- `prefers-reduced-motion`: no slide animation.

## Acceptance criteria

- [ ] Given viewport &lt; `md`, when signed in, then a hamburger is visible and
      horizontal destination tabs are not.
- [ ] Given the drawer is open, when the user taps Words, then `/words` loads and
      the drawer closes.
- [ ] Given any viewport, then exactly three destinations — no fourth, no
      due-count badge.
- [ ] Given viewport ≥ `md`, then destinations show icon + label without hamburger.
- [ ] Given the open drawer, when tested with axe-core, then no violations.

## Check

`npm test -- mobile-nav app-shell`
