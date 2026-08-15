# Vocabulary orbit

<!-- id: SPEC-feature-vocabulary-orbit -->
<!-- use-case: UC-031 -->
<!-- use-case: UC-063 -->
<!-- status: active -->

App-Clip-style radial code on `/words`: a fixed **surface hub** with a compact
language-stripe badge at the center, eight concentric rings of rounded ink dashes
and dots that light up from the core outward as vocabulary is held. Replaces the
vocabulary atlas **table** as the default view; the full deck remains reachable
via **Show list**.

## Scope

- **In:** `lib/vocabulary-orbit.ts`, `lib/orbit-geometry.ts`,
  `lib/language-stripes.ts`; `features/words/VocabularyOrbitField.tsx`,
  `VocabularyOrbitSvg.tsx`, `OrbitDetailCard.tsx`, `OrbitListPopover.tsx` —
  wired from [`words-home.md`](words-home.md). Layout derives from
  [`vocabulary-snapshot.md`](../service/vocabulary-snapshot.md) atlas points.
- **Out:** social compare / scan overlay; per-POS ring colors; form-recall cells
  on segments; corner brackets except in a future share mode.

**Reuse: `Table`, `Button`** — list popover and detail patterns.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/words` | Orbit below counts/horizon; **center hub and stripe badge stay fixed**; each of the eight rings spins at its own speed and direction unless reduced motion |
| 2 | Taps a word segment | [`orbit-detail-card.md`](../component/orbit-detail-card.md) under the orbit |
| 3 | Taps an aggregate segment | Detail card names the rank range and held count |
| 4 | Taps **Show list** | Scrollable popover with the full frequency-sorted deck (word, rank, status) |
| 5 | `prefers-reduced-motion` | All rings static; segments still tappable |

### Rings

Eight rings, inner = highest frequency band. Segments are **rounded-cap stroke
arcs** (dots and dashes), ink on light — not filled wedges. Brightness follows
bucket: mature/held dark, fragile muted, new ghost. Decorative ghost ticks fill
sparse slots (**5–8** per ring). Rings are **phase-offset** so ticks do not line
up radially.

### Center hub

A `surface` disc with a `line` stroke and a small inset stripe badge (not a
full-bleed flag fill) so the hub matches the minimal dash rings.

### Collapse

Each ring shows at most **8** individual word segments; remaining words in the
band collapse into one aggregate segment.

### Size

The SVG fills the content column width up to **42rem** on large screens so the
orbit reads as the page hero, not a small inset graphic.

### Segment focus

Tapping or keyboard-focusing a segment highlights the **dash stroke** in accent.
No rectangular browser focus ring — `outline-none` on the interactive group;
`focus-visible` thickens/recolors the arc only.

### Detail card

Selection opens [`orbit-detail-card.md`](../component/orbit-detail-card.md)
below the orbit.

## States

Client-only selection: `selectedSegmentId | null`. List popover `open | closed`.

## Acceptance criteria

- [ ] Given a starter deck, when `/words` renders, then an SVG orbit with eight
      rings and a fixed surface hub with stripe badge is present instead of the
      atlas table.
- [ ] Given a held lemma in the inner band, when the orbit renders, then its
      segment uses a dark ink stroke.
- [ ] Given a fragile lemma, when rendered, then its segment is muted relative to
      held.
- [ ] Given `prefers-reduced-motion`, when rendered, then no ring spins and the
      center stripes do not move.
- [ ] Given a tap on a word segment, when the detail card opens, then lemma,
      translation, rank, stability, and bucket chip are shown below the orbit.
- [ ] Given **Show list**, when opened, then all atlas rows are reachable in a
      scrollable popover.

## Check

`npm test -- vocabulary-orbit words`
