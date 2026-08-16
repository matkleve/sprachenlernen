# Disclosure

<!-- id: SPEC-component-disclosure -->
<!-- use-case: UC-068 -->
<!-- status: active -->

Native `<details>` disclosure with a styled summary and animated panel. Used for
collapsible help (lemma callout), refine filters, error technical details, and
method practical facts. Serves
[UC-068](../../use-cases/UC-068-know-my-tap-was-received.md) via shell-level
press feedback ([`interaction-feedback.md`](../feature/interaction-feedback.md)).

Native on purpose — same rationale as `Select`: the platform owns expand/collapse
keyboard behaviour. We style the shell and animate the panel only.

## Scope

- **In:** `Disclosure`, `DisclosureSummary`, `DisclosurePanel` in
  `components/ui/Disclosure.tsx`; chevron in `DisclosureChevron.tsx`; kernel
  classes in `interaction-kernel.ts`.
- **Out:** custom accordion with multiple open sections; pending/async state
  (toggle is instant); replacing native `<details>` with a React state machine.

## Composition

```tsx
<Disclosure className="…optional shell overrides…">
  <DisclosureSummary>Trigger label</DisclosureSummary>
  <DisclosurePanel>
    …expanded content…
  </DisclosurePanel>
</Disclosure>
```

`DisclosurePanel` is required for animated expand/collapse. Body content must
not sit as a direct sibling of `DisclosureSummary` without the panel wrapper.

## Visual model

The **shell** (`<details>`) is the card the learner sees. The **summary** is the
focus target and hit area, but press feedback applies to the whole shell — same
pattern as `PressableCard`, `SurfaceLink`, and `LanguageListRow`
(`cardPressable`).

| Part | Element | Role |
| --- | --- | --- |
| Shell | `<details class="group">` | Card border, background, press scale, open state |
| Summary | `<summary>` | Label row + chevron; `focus-visible` ring; block-level, full width |
| Panel | animated wrapper | Height transition on open/close |
| Chevron | `DisclosureChevron` | Rotates 180° when `group-open` |

## States

| State | Trigger | Shell | Summary | Panel |
| --- | --- | --- | --- | --- |
| collapsed | initial / user closes | resting card | chevron down | `grid-rows-[0fr]`, content clipped |
| hover | pointer over summary | optional border deepen on soft fills | no local background pill | — |
| active / press | pointer down on summary | `scale-[0.98]` + border deepen (`:has(summary:active)`) | no local scale — avoids text-only shrink | — |
| focus-visible | keyboard on summary | — | `ring-2 ring-accent ring-offset-2` | — |
| expanded | user opens | resting card | chevron up (150ms rotate) | `grid-rows-[1fr]`, content visible |

Press and motion use `interaction-kernel.ts` (`touchTarget`, `interactionMotion`,
`pressScale`, `pressFill`). Timing: **150ms**, easing **`ease-out-soft`** — same
as every other interactive ([`DESIGN-SYSTEM.md`](../../DESIGN-SYSTEM.md)).

## Expand / collapse motion

Panel reveal uses the CSS grid height trick — not `max-height`, not JS:

1. `DisclosurePanel` outer: `grid` + `grid-rows-[0fr]` → `group-open:grid-rows-[1fr]`
2. Inner: `overflow-hidden`
3. `transition-[grid-template-rows]` with `interactionMotion` tokens

Chevron rotation and panel height share the same duration so open/close feels
coordinated. Toggle remains instant for assistive tech (`open` attribute); only
the visual height is animated.

## Acceptance criteria

- [x] Given a card-shaped `Disclosure` (e.g. lemma callout), when the learner
      presses anywhere on the summary row, then the **entire shell** scales to
      `0.98` before release — not the label text alone.
- [x] Given a `Disclosure`, when it opens or closes, then the panel height
      animates over 150ms with `ease-out-soft` and the chevron rotates in the
      same window.
- [x] Given keyboard focus on the summary, when Enter or Space is pressed, then
      the panel toggles with the same motion as pointer activation.
- [x] Given `DisclosurePanel` wraps body content, when the disclosure test suite
      runs, then panel motion classes are asserted.
- [x] Given `LemmaCallout` on viewport &lt; `md`, when the learner taps the
      callout, then press feedback matches other card controls on `/words`
      (Start review card, held/fragile tiles).

## Check

`npm test -- disclosure interaction-feedback lemma-callout`
