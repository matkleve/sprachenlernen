# Method card

<!-- id: SPEC-component-method-card -->
<!-- use-case: UC-045 -->
<!-- status: active -->

Compact tappable **catalogue card** for one method. Shell, header (with
destination marker), badge row, and chips. Visual polish:
[`../../reviews/design/DR-040-method-card-visual-polish.md`](../../reviews/design/DR-040-method-card-visual-polish.md).

## Scope

- **In:** `MethodCard` on `/methods` and daily-three; `LandingPreviewMethodCard`
  reuses summary typography; **destination marker** on card header.
- **Out:** filter controls; detail page layout; hosted/off-app chip on cards.

Implementation: `features/method-menu/MethodCard.tsx`,
`lib/method-session.ts` (`cardDestinationMarker`, `isRunnableFromMenu`).

## Body typography

| Element | Class | Notes |
| --- | --- | --- |
| Method name (`h3`) | `text-xl sm:text-2xl lg:text-3xl font-semibold leading-tight text-ink` | Smaller on phone; full scale from `lg` (3-col) |
| Summary | `text-sm text-ink line-clamp-1 sm:line-clamp-2` | One line on phone; two from `sm` |
| Body padding | `p-2.5 sm:p-3` | Tighter on phone |
| Section gaps | `mt-1.5 sm:mt-2` between badge row, chips, does-not-do | Catalogue scan density |
| Does-not-do | `hidden sm:block line-clamp-2` | Omitted on phone — detail page carries full copy |
| Badge row | See [`method-badge.md`](method-badge.md) | `layout="row"` — shields left, effort right |
| Property chips | [`chip.md`](chip.md) | `size="card"`; duration + requirements only |

Header + destination marker: [`method-card-header.md`](method-card-header.md).

## Destination marker

Two values, derived from `cardHrefForMethod` — not from `hosted` alone:

| Marker | When | Tap target |
| --- | --- | --- |
| **Start** | `isRunnableFromMenu` | Card engine → session route; exercise runner → **method overview** (`/methods/{id}`) |
| **Info** | else (off-app or hosted-not-built) | Detail route |

Placement: top-right of card header — quiet text only (`text-muted` for Info,
`font-medium text-ink` for Start). Not a button.

## Acceptance criteria

- [ ] Given any method card, when it renders, then the method name uses
      `text-xl` on viewports below `sm`, `text-2xl` from `sm` to below `lg`, and
      `text-3xl` from `lg` — primary identity scales with card width.
- [ ] Given any method card, when it renders, then the header graphic uses the
      card header rules in [`method-card-header.md`](method-card-header.md).
- [ ] Given a runnable exercise method, when the card renders, then the header shows
      **Start** and the link `href` is the **method overview** (`/methods/{id}`), not
      `/practice`.
- [ ] Given a non-runnable method, when the card renders, then the header shows
      **Info** and the link `href` is the detail route.
- [ ] Given any method card, when it renders, then `summary` uses `text-ink` and
      no hosted/off-app chip appears in the property row.

## Check

`npm test -- method-menu method-card-header method-badge method-session`
