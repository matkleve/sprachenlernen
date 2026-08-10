# Interaction feedback — press and pending on every control

<!-- id: SPEC-feature-interaction-feedback -->
<!-- use-case: UC-068 -->
<!-- status: draft -->

Every clickable control in the app communicates **press** (tap received) and,
when work continues after release, **pending** (something is happening). Parent:
[`DESIGN-SYSTEM.md`](../../DESIGN-SYSTEM.md) § Interaction states; primitives
[`button.md`](../component/button.md), [`nav-link.md`](../component/nav-link.md).

## Scope

- **In:** all signed-in and marketing surfaces; `Button`, `NavLink`,
  `FilterPill`, link-as-button (`buttonVariants` on `Link`); form submits;
  server actions; route navigations that take perceptible time; audit of bespoke
  `<button>` / styled links; `touch-action: manipulation` on interactive
  primitives for reliable `:active` on touch.
- **Out:** haptics; route-level skeletons; redesigning copy or layout;
  spinners on grade buttons ([`review-write-queue.acceptance-criteria.md`](../service/review-write-queue.acceptance-criteria.md)
  — advance is the feedback); pending on filter chips (client-instant).

**Reuse:** `Button`, `NavLink`, `FilterPill`. **Gap:** `Button` `pending` prop;
`ActionLink` client wrapper for `Link` + `useTransition` pending (new primitive
or feature helper — decide at implement).

## Two layers

| Layer | When | What the user sees |
| --- | --- | --- |
| **Press** | finger/pointer down | `active:scale-[0.98]`, lift reset, fill deepens — DESIGN-SYSTEM five states |
| **Pending** | after release, until settled | control stays visually engaged: muted + `aria-busy`, optional inline spinner on primary actions; duplicate taps ignored |

Press is CSS. Pending is React state (`useTransition`, `useFormStatus`, or
`pending` prop).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Presses any control | Press state visible before release |
| 2 | Releases on instant action (filter chip, grade) | Press ends; surface updates in the same frame — no pending |
| 3 | Releases on async action (form, server action, slow nav) | Pending state until success, error, or route change |
| 4 | Taps again while pending | Ignored — no double submit |
| 5 | Action fails | Pending clears; error surface owns the message |
| 6 | Uses keyboard | `focus-visible` ring; Enter/Space triggers same pending rules |

## Exemptions

| Surface | Press | Pending | Why |
| --- | --- | --- | --- |
| Grade buttons | required | **no spinner** | Card advance within one frame; sync line only after 500 ms ([`review-write-queue`](../service/review-write-queue.md)) |
| Filter / refine chips | required | none | Client-side filter, no I/O |
| Native `<input>` / `<select>` | platform | none | DESIGN-SYSTEM § exemption |

## States (async control)

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| `idle` | at rest | default look | no |
| `pressed` | pointer down | active styles | no |
| `pending` | async started | `aria-busy`, muted, no second fire | no |
| `settled` | success or error | returns to idle or disabled | yes |

## Surfaces (implement order)

1. `Button` + forms (auth, cookie consent, sign-out, retry)
2. `ActionLink` / link-as-button (Start review, method session, session complete CTAs)
3. `NavLink` + pill segments (shell navigation)
4. Audit: `ReviewCard` flip, `ItemPicker` rows, `MethodDetail` text links, marketing header links

## Accessibility

- `aria-busy="true"` on pending controls; `aria-disabled` or real `disabled`
  while pending.
- Pending does not remove focus ring.
- Spinner (when used) is decorative (`aria-hidden`); label unchanged.

## Acceptance criteria

- [ ] Given any `Button`, when pressed, then `active:scale` (or equivalent) is
      visible before release.
- [ ] Given a `Button` with an async handler, when released, then it enters
      pending until the handler settles and ignores duplicate taps.
- [ ] Given Start review (`/words` → `/words/review`), when tapped, then the
      control shows pending until the review route renders or errors.
- [ ] Given sign-out on mobile or desktop, when submitted, then the control shows
      pending until redirect completes.
- [ ] Given a grade button during review, when tapped, then the next card appears
      within one frame and **no** grade button shows a spinner.
- [ ] Given a filter chip on the method menu, when tapped, then the list updates
      without a pending spinner.
- [ ] Given the app grep for `<button` outside `components/ui/`, then every hit
      either uses a primitive or documents an exemption in this spec.
- [ ] Given the interaction-feedback test fixture, then axe-core reports no
      violations.

## Check

`npm test -- interaction-feedback button nav-link`
