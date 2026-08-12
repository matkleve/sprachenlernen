# Interaction feedback — press and pending on every control

<!-- id: SPEC-feature-interaction-feedback -->
<!-- use-case: UC-068 -->
<!-- status: active -->

Every clickable control in the app communicates **press** (tap received) and,
when work continues after release, **pending** (something is happening). Parent:
[`DESIGN-SYSTEM.md`](../../DESIGN-SYSTEM.md) § Interaction states; inventory
[`interaction-inventory.md`](../system/interaction-inventory.md); machine list
[`interaction-registry.json`](../system/interaction-registry.json).

## Scope

- **In:** all signed-in and marketing surfaces; primitives from
  `components/ui/`; form submits; server actions; route navigations; CI gate
  `scripts/check-interaction-surfaces.mjs`.
- **Out:** haptics; route-level skeletons; redesigning copy or layout;
  spinners on grade buttons ([`review-write-queue`](../service/review-write-queue.md)
  — advance is the feedback); pending on filter chips (client-instant).

**Reuse:** `Button`, `ActionLink`, `NavLink`, `FilterPill`, `IconButton`,
`IconLink`, `TextLink`, `SurfaceLink`, `PressableCard`, `GradeButton`,
`LanguageSwitchRow`, `Disclosure`. Shared classes: `components/ui/interaction-kernel.ts`.

## Two layers

| Layer | When | What the user sees |
| --- | --- | --- |
| **Press** | finger/pointer down | `active:scale-[0.98]`, lift reset, fill deepens — DESIGN-SYSTEM five states |
| **Pending** | after release, until settled | control stays visually engaged: muted + `aria-busy`, optional inline spinner on primary actions; duplicate taps ignored |

Press is CSS via `interaction-kernel.ts`. Pending is React state (`useTransition`,
`useFormStatus`, or `pending` prop). Navigation links hold pending for at least
180ms so fast client navigations remain perceptible.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Presses any control | Press state visible before release |
| 2 | Releases on instant action (filter chip, grade) | Press ends; surface updates in the same frame — no pending |
| 3 | Releases on async action (form, server action, slow nav) | Pending state until success, error, or route change |
| 4 | Taps again while pending | Ignored — no double submit |
| 5 | Action fails | Pending clears; error surface owns the message |
| 6 | Uses keyboard | `focus-visible` ring; Enter/Space triggers same pending rules |

## Pending policies

| Policy | Use for | Effect |
| --- | --- | --- |
| `cta` (default) | primary/danger buttons and links | muted + spinner when applicable |
| `nav` | icon shell chips (`IconButton`, `IconLink`) | accent ring, no spinner |
| `none` | rare — opacity only | muted only |

## Exemptions

| Surface | Press | Pending | Why |
| --- | --- | --- | --- |
| Grade buttons | required | **no spinner** | Card advance within one frame |
| Filter / refine chips | required | none | Client-side filter, no I/O |
| Native `<input>` / `<select>` | platform | none | DESIGN-SYSTEM § exemption |
| Language switcher scrim | none | none | dismiss overlay, not a control |

## Surfaces

All production interactives use a registry primitive — see
[`interaction-inventory.surfaces.md`](../system/interaction-inventory.surfaces.md).
The gate fails on raw `<button>`, `buttonVariants`, or `gradeButtonClass`
outside `components/ui/`.

## Accessibility

- `aria-busy="true"` on pending controls; `aria-disabled` or real `disabled`
  while pending.
- Pending does not remove focus ring.
- Spinner (when used) is decorative (`aria-hidden`); label unchanged.

## Acceptance criteria

- [x] Given any `Button`, when pressed, then `active:scale` (or equivalent) is
      visible before release.
- [x] Given a `Button` with an async handler, when released, then it enters
      pending until the handler settles and ignores duplicate taps.
- [x] Given Start review (`/words` → `/words/review`), when tapped, then the
      control shows pending until the review route renders or errors.
- [x] Given sign-out on mobile or desktop, when submitted, then the control shows
      pending until redirect completes.
- [x] Given a grade button during review, when tapped, then the next card appears
      within one frame and **no** grade button shows a spinner.
- [x] Given a filter chip on the method menu, when tapped, then the list updates
      without a pending spinner.
- [x] Given the app grep for `<button` outside `components/ui/`, then every hit
      either uses a primitive or documents an exemption in this spec.
- [x] Given the interaction-feedback test fixture, then axe-core reports no
      violations.

## Check

`npm test -- interaction-feedback button nav-link` and `node scripts/verify.mjs interaction`
