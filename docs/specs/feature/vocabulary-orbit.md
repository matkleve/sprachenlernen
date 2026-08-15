# Vocabulary orbit

<!-- id: SPEC-feature-vocabulary-orbit -->
<!-- use-case: UC-063 -->
<!-- status: active -->

App-Clip-style radial code on `/words`: language stripes at the center, eight
accent-gradient rings of segments that light up from the core outward as
vocabulary is held. Replaces the vocabulary atlas table as the default view.

## Scope

- **In:** `lib/vocabulary-orbit.ts` — ring layout from
  [`vocabulary-snapshot.md`](../service/vocabulary-snapshot.md) atlas points;
  `features/words/VocabularyOrbit.tsx` — slow spin, segment tap, detail card,
  scrollable list popover; wired from [`words-home.md`](words-home.md).
- **Out:** social compare / scan overlay; per-POS ring colors; form-recall
  cells on segments; corner brackets except in a future share mode.

**Reuse: `Table`, `Button`, `Dialog`** — list popover and detail patterns.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/words` | Orbit below counts/horizon; rings spin slowly unless reduced motion |
| 2 | Taps a word segment | Detail card under the orbit: lemma, translation, rank, stability, status |
| 3 | Taps an aggregate segment | Detail card names the rank range and held count |
| 4 | Taps **Show list** | Scrollable popover with the full frequency-sorted atlas (same columns as before) |
| 5 | `prefers-reduced-motion` | Orbit is static; segments still tappable |

### Rings

Eight rings, inner = highest frequency band. Segment **brightness** follows
bucket: mature/held bright, fragile half-lit, new ghost. Ring **track**
opacity reflects held+mature share in that band.

### Collapse

Each ring shows at most **24** individual segments; remaining words in the band
collapse into one aggregate segment.

## States

Client-only selection: `selectedSegmentId | null`. List popover `open | closed`.

## Acceptance criteria

- [ ] Given a starter deck, when `/words` renders, then an SVG orbit with eight
      rings and a striped center is present instead of the atlas table.
- [ ] Given a held lemma in the inner band, when the orbit renders, then its
      segment uses the lit fill tier.
- [ ] Given a fragile lemma, when rendered, then its segment is half-lit.
- [ ] Given a tap on a word segment, when the detail card opens, then lemma,
      translation, rank, and bucket are shown below the orbit.
- [ ] Given **Show list**, when opened, then all atlas rows are reachable in a
      scrollable popover.
- [ ] Given `prefers-reduced-motion`, when rendered, then the orbit does not spin.

## Check

`npm test -- vocabulary-orbit words`
