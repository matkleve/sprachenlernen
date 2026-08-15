# Vocabulary orbit

<!-- id: SPEC-feature-vocabulary-orbit -->
<!-- use-case: UC-031 -->
<!-- use-case: UC-063 -->
<!-- status: active -->

App-Clip-style radial code on `/words`: language stripes at a **fixed** center,
eight concentric rings of rounded ink dashes and dots that light up from the core
outward as vocabulary is held. Replaces the vocabulary atlas **table** as the
default view; the full deck remains reachable via **Show list**.

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
| 1 | Opens `/words` | Orbit below counts/horizon; **center stripes stay fixed**; each of the eight rings spins at its own speed and direction unless reduced motion |
| 2 | Taps a word segment | Detail card under the orbit: lemma, translation, rank, stability, status |
| 3 | Taps an aggregate segment | Detail card names the rank range and held count |
| 4 | Taps **Show list** | Scrollable popover with the full frequency-sorted deck (word, rank, status) |
| 5 | `prefers-reduced-motion` | All rings static; segments still tappable |

### Rings

Eight rings, inner = highest frequency band. Segments are **rounded-cap stroke
arcs** (dots and dashes), ink on light — not filled wedges. Brightness follows
bucket: mature/held dark, fragile muted, new ghost. Decorative ghost ticks fill
sparse slots (**8–16** per ring). Rings are **phase-offset** so ticks do not line
up radially.

### Collapse

Each ring shows at most **12** individual word segments; remaining words in the
band collapse into one aggregate segment.

## States

Client-only selection: `selectedSegmentId | null`. List popover `open | closed`.

## Acceptance criteria

- [ ] Given a starter deck, when `/words` renders, then an SVG orbit with eight
      rings and a fixed striped center is present instead of the atlas table.
- [ ] Given a held lemma in the inner band, when the orbit renders, then its
      segment uses a dark ink stroke.
- [ ] Given a fragile lemma, when rendered, then its segment is muted relative to
      held.
- [ ] Given `prefers-reduced-motion`, when rendered, then no ring spins and the
      center stripes do not move.
- [ ] Given a tap on a word segment, when the detail card opens, then lemma,
      translation, rank, and bucket are shown below the orbit.
- [ ] Given **Show list**, when opened, then all atlas rows are reachable in a
      scrollable popover.

## Check

`npm test -- vocabulary-orbit words`
