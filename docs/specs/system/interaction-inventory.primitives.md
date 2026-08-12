# Interaction inventory — primitives

<!-- parent: SPEC-system-interaction-inventory -->

Per-primitive state matrix. Symbols: D H A F X P C — see parent
[`interaction-inventory.md`](interaction-inventory.md) § State legend.

## Clickable primitives

| Primitive | D | H | A | F | X | P | C | Notes |
| --- |:-:|:-:|:-:|:-:|:-:|:-:|:-:| --- |
| `Button` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | `floating`: A adds `pressFill`. Spinner on P when policy `cta` + primary/danger |
| `SubmitButton` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ auto | — | Wraps `Button`; P from `useFormStatus` |
| `ActionLink` | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | P ≥180ms. Policies: `cta` (default), `nav` (ring), `none` |
| `NavLink` | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | `current` → `bg-accent-soft`, `aria-current="page"` |
| `FilterPill` | ✓ | ✓ | ✓ | ✓ | ✓ | — | via `aria-pressed` | Same classes as `navLinkVariants` |
| `TextLink` | ✓ | ✓ | ✓ | ✓ | — | — | — | Tones: `accent`, `muted`, `ink`. No nav pending |
| `IconButton` | ✓ | ✓ | ✓+fill | ✓ | ✓ | ✓ ring | — | 44×44 round floating. Default policy `nav` |
| `IconLink` | ✓ | ✓ | ✓+fill | ✓ | — | ✓ ring | — | `ActionLink` + `iconButtonClass` + policy `nav` |
| `SurfaceLink` | ✓ | ✓ | ✓+fill | ✓ | — | ✓ | — | Card block link; P ≥180ms |
| `PressableCard` | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | `interactive={false}` → static, no H/A |
| `GradeButton` | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | Grade-tinted; no spinner (exemption) |
| `LanguageSwitchRow` | ✓ | ✓ | ✓ | ✓ | ✓ | — | active=div | Active row is non-interactive `<div>` |
| `Disclosure` | ✓ | ✓ | ✓ | ✓ | — | — | open state | Summary only; `<details>` toggle is platform |

## Native form controls (DESIGN-SYSTEM exemption)

| Primitive | D | H | A | F | X | P | Notes |
| --- |:-:|:-:|:-:|:-:|:-:|:-:| --- |
| `Input` | ✓ | platform | platform | ✓ | ✓ | — | `aria-invalid:border-danger` |
| `Textarea` | ✓ | platform | platform | ✓ | ✓ | — | Same `control` classes as Input |
| `Select` | ✓ | platform | platform | ✓ | ✓ | — | Chevron is `pointer-events-none` |

## Pending policies (`Button` / `ActionLink`)

| Policy | Visual on P | Spinner |
| --- | --- | --- |
| `cta` | `pendingBusy` (opacity) | primary / danger only |
| `nav` | `pendingNavRing` | never |
| `none` | `pendingBusy` | never |

## Non-interactive (no state contract)

| Component | Role |
| --- | --- |
| `Chip` | Label inside cards, filters, rows |
| `LanguageFlag` | Decorative glyph; borrows chip sizing only |
| `Spinner` | Decorative inside pending controls (`aria-hidden`) |
| `ErrorCallout` | Alert container; optional `retry` slot |
| `Dialog` | Native modal; footer children carry interaction |
| `Field` | Label/description wiring for controls |

## Implementation files

| Primitive | Path |
| --- | --- |
| Kernel | `components/ui/interaction-kernel.ts` |
| Pending hook | `components/ui/use-pending-navigation.ts` |
| Registry | `docs/specs/system/interaction-registry.json` |
| Gate | `scripts/check-interaction-surfaces.mjs` |
