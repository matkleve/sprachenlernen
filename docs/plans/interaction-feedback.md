# Plan — interaction feedback (press + pending everywhere)

**Status:** implemented on `cursor/interaction-feedback-d240`.
**Change class:** Standard (primitives + audit + one test file per phase).
**Use case:** [UC-068](../use-cases/UC-068-know-my-tap-was-received.md).

Owner request (2026-08-10): every button and control should immediately show
that the tap arrived and, when work continues, that something is happening in the
background.

## Contract

- Feature spec: [`../specs/feature/interaction-feedback.md`](../specs/feature/interaction-feedback.md)
- Design system: [`../DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md) — press states (existing) + pending (to add)
- Component updates: [`../specs/component/button.md`](../specs/component/button.md) — `pending` moves from Out → In

## Implementation phases

### Phase 1 — Primitives (unblocks everything)

| Area | Action |
| --- | --- |
| `Button.tsx` | `pending` prop: `aria-busy`, muted styles, `pointer-events-none`, optional spinner on `primary`/`danger` |
| `button.md` + `DESIGN-SYSTEM.md` | Document pending row; link to interaction-feedback |
| `ActionLink.tsx` (new, `components/ui/`) | `Link` + `useTransition`; applies `buttonVariants` or `navLinkVariants` + pending while navigating |
| `NavLink.tsx` | Optional `pending` when used inside `ActionLink`; or delegate entirely to wrapper |
| `globals.css` | `touch-manipulation` on button/link primitives if needed for iOS `:active` |
| Tests | `interaction-feedback.test.tsx`, extend `button.test.tsx` |

### Phase 2 — High-traffic async surfaces

| Surface | Today | Target |
| --- | --- | --- |
| Words → Start review | plain `Link` + `buttonVariants` | `ActionLink` pending |
| Sign out (header + float) | form, no status | `useFormStatus` or submit `pending` on `Button` |
| Auth sign-in / sign-up | forms | pending on submit `Button` |
| OAuth buttons | click handlers | pending per provider |
| Method detail → start session | `Link` | `ActionLink` |
| Session complete CTAs | `Link` + variants | `ActionLink` |
| Route error Retry | `Button` | `pending` on retry handler |

### Phase 3 — Audit (press only where instant)

| File | Issue | Fix |
| --- | --- | --- |
| `ReviewCard.tsx` flip | missing `active:scale` | add press tokens or extract `PressableCard` |
| `ItemPicker.tsx` | raw `<button>` | `Button` ghost or shared pressable cva |
| `MethodDetail.tsx` | text links | `NavLink` or link styles with active |
| `MethodFilter` / `RefineFilter` | `FilterPill` ✓ | verify active on touch |
| `FloatingShellChrome` | `Button floating` ✓ | wire sign-out pending (phase 2) |
| Marketing `PublicHeader` / `LandingHero` | partial active | align with NavLink pattern |

### Phase 4 — Gate (optional, after manual pass)

- Script or ESLint: flag `<button` outside `components/ui/` without exemption comment.
- `check:specs` already links UC-068 ↔ spec.

<<<<<<< HEAD
### Phase 5 — Disclosure shell press + panel motion (shipped)

**Status:** shipped — standard `surface-raised` card shell, shell press via
`:has(summary:active)`, `DisclosurePanel` grid animation. Call sites:
`LemmaCallout`, `MethodDetailFacts`, `RefineFilter`, `ErrorCallout`.
**Contract:** [`../specs/component/disclosure.md`](../specs/component/disclosure.md)

=======
### Phase 5 — Disclosure shell press + panel motion (queued)

**Status:** spec written; awaiting owner **go** before code.
**Trigger:** lemma callout on `/words` — only the summary text shrank on press;
expand/collapse was instant while the chevron already animated.
**Change class:** Standard.
**Contract:** [`../specs/component/disclosure.md`](../specs/component/disclosure.md)

| Area | Today | Target |
| --- | --- | --- |
| `Disclosure.tsx` | `pressScale` on `<summary>` only | Shell press via `[&:has(summary:active)]`; summary stays full-width, no local scale |
| `Disclosure.tsx` | body children unwrapped | export `DisclosurePanel` with grid `0fr → 1fr` + `interactionMotion` |
| `interaction-kernel.ts` | — | optional `disclosureShellPress` composed stack (or reuse `cardPressable` subset) |
| Call sites | raw `<p>` / `<div>` siblings | wrap in `DisclosurePanel`: `LemmaCallout`, `RefineFilter`, `ErrorCallout`, `MethodDetailFacts` |
| Tests | summary class smoke test | shell press classes; panel motion classes; `lemma-callout` press AC |
| Inventory + `words-home.md` | "instant toggle" | shell press + 150ms panel motion documented |

**Reuse:** `Disclosure` primitive — extend, do not fork `LemmaCallout`.

>>>>>>> origin/cursor/disclosure-press-spec-0b3f
**Will not touch:** grade-button spinners (explicit exemption), filter-chip pending,
UC-063 nav counts, visual redesign beyond feedback states.

## Verify

```bash
npm run verify
npm test -- interaction-feedback button nav-link app-shell
```

## LIVE CHECK (you) — after implement

1. Phone: tap **Start review** — button shows pressed instantly, then pending until cards load.
2. Tap **Sign out** — chip/button pending until landing page.
3. Method menu filter chip — presses visibly, list updates, no spinner.
4. Review: tap **Good** — card advances immediately, no grade spinner.
5. Desktop: same on auth submit and shell nav links.
6. No control feels "dead" on first tap.
