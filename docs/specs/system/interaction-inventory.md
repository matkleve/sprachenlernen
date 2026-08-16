# Interaction inventory

<!-- id: SPEC-system-interaction-inventory -->
<!-- use-case: UC-068 -->
<!-- status: active -->

Living map of every interactive control in production: which primitive it
uses, which interaction states apply, and known gaps. Normative behaviour stays
in [`interaction-feedback.md`](../feature/interaction-feedback.md); machine
list in [`interaction-registry.json`](interaction-registry.json).

**Keep this doc in sync** when adding a primitive, migrating a surface, or
documenting an exemption. The gate `scripts/check-interaction-surfaces.mjs`
enforces the registry; this file is the human-readable mirror.

## Scope

- **In:** all production interactives in `app/` and `features/`; primitives in
  `components/ui/`; kernel classes in `interaction-kernel.ts`.
- **Out:** test fixtures; design-explorer preview-only demos; platform chrome on
  native form controls.

## State legend

| Symbol | State |
| --- | --- |
| D | default (at rest) |
| H | hover |
| A | active / press |
| F | focus-visible |
| X | disabled |
| P | pending (async) |
| C | current (`aria-current`, nav only) |
| — | not applied / exempt / platform |

**Five-state rule** (DESIGN-SYSTEM): D, H, A, F, X on every clickable control.
Native `<input>`, `<textarea>`, `<select>` omit H and A (platform). Pending (P)
is a sixth layer for async work — see [`interaction-feedback.md`](../feature/interaction-feedback.md).

## Kernel (`components/ui/interaction-kernel.ts`)

| Export | Role |
| --- | --- |
| `touchTarget` | `touch-manipulation` — reliable `:active` on touch |
| `interactionMotion` | Named-property transitions, 150ms |
| `focusRing` | `focus-visible:ring-2 ring-accent ring-offset-2` |
| `pressScale` | `active:scale-[0.98]` |
| `pressFill` | `active:bg-accent-soft` — icon chips, card links |
| `navCurrentFill` | accent fill at rest for text nav links (`NavLink`, `ActionLink` `current`) |
| `iconChipCurrentFill` | accent fill at rest for bordered icon chips (`IconLink` `current`) |
| `hoverLift` | `hover:-translate-y-px hover:shadow-raised` |
| `cardPressable` | `cardInteractive` + `pressFill` — card-shaped buttons and links |
| `disabledState` | opacity + `pointer-events-none` |
| `pendingBusy` | muted + blocks clicks |
| `pendingNavRing` | accent ring for icon nav pending |
| `hitAreaPseudo` + `hitAreaExpand*` | 44px+ target without visual inflation |
| `interactiveEmphasis` | `font-semibold` + heavier Lucide stroke on labels/icons |

Navigation pending minimum: **180ms** (`MIN_PENDING_DISPLAY_MS` in
`use-pending-navigation.ts`).

## Primitives

Authoritative list: [`interaction-registry.json`](interaction-registry.json).
Per-primitive state matrix:
[`interaction-inventory.primitives.md`](interaction-inventory.primitives.md).

| Primitive | Element | Pending |
| --- | --- | --- |
| `Button` | `<button>` | `pending` prop; policies `cta` / `nav` / `none` |
| `SubmitButton` | `<button type="submit">` | auto via `useFormStatus` |
| `ActionLink` | `<Link>` as button | `usePendingNavigation`; default `cta` |
| `NavLink` | `<Link>` pill | `usePendingNavigation` |
| `FilterPill` | `<button>` | none (instant client filter) |
| `TextLink` | `<Link>` inline | none |
| `IconButton` | round `<button>` | default policy `nav` |
| `IconLink` | round `<Link>` | policy `nav` |
| `SurfaceLink` | card `<Link>` | `usePendingNavigation` |
| `PressableCard` | flip `<button>` | none |
| `GradeButton` | grade `<button>` | none (spec exemption) |
| `LanguageListRow` | row `<button>` or card | disabled while parent pending |
| `Disclosure` | `<details>` + `<summary>` + `DisclosurePanel` | none (instant toggle; 150ms panel motion) |
| `Input` / `Textarea` / `Select` | native | platform H/A; F + X styled |

Non-interactive: `Chip`, `LanguageFlag` (decorative), `ErrorCallout` (container;
retry slot uses `Button`), `Dialog` (shell; actions in footer).

## Production surfaces

Per-route control list:
[`interaction-inventory.surfaces.md`](interaction-inventory.surfaces.md).

## Known gaps

| Control | Issue | Fix when touched |
| --- | --- | --- |
| `TextLink` | No navigation pending | Accept or add opt-in `usePendingNavigation` |
| `MethodDetail` back | `hover:bg-transparent` override on ghost `ActionLink` | Intentional — text-link look |
| Skip to content (`layout.tsx`) | Raw `<a>`, focus-only | Intentional a11y pattern — see exemptions |
| `Table` scroll region | `tabIndex={0}` focus ring only | Keyboard scroll container, not a click target |

## Exemptions (registry)

| Location | Pattern | Reason |
| --- | --- | --- |
| `LanguageSwitcher.tsx` | `language-switcher-scrim` | Full-screen dismiss overlay |
| `app/layout.tsx` | Skip to content `<a>` | Focus-only keyboard skip link |
| `error-callout.test.tsx` | `<button` | Test fixture only |

## Acceptance criteria

- [x] Given a new interactive in `app/` or `features/`, when merged, then it
      uses a registry primitive or adds an exemption to
      `interaction-registry.json` and a row to
      `interaction-inventory.surfaces.md`.
- [x] Given a new primitive in `components/ui/`, when merged, then
      `interaction-registry.json`, `interaction-inventory.primitives.md`, and
      this file's primitive table are updated in the same change.
- [x] Given `node scripts/check-interaction-surfaces.mjs`, then zero violations
      against the registry.
- [x] Given the primitive matrix, then every registry primitive lists D, H, A,
      F, and X (or documents platform/native exemption).

## Check

`node scripts/verify.mjs interaction` and `npm test -- interaction-feedback`
