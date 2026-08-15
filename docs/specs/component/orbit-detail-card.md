# Orbit detail card

<!-- id: SPEC-component-orbit-detail-card -->
<!-- use-case: UC-031 -->
<!-- status: active -->

The selection panel under the vocabulary orbit on `/words`. Surfaces the tapped
word or aggregate band with glanceable hierarchy — lemma first, status chip,
then supporting stats. Wired from [`vocabulary-orbit.md`](../feature/vocabulary-orbit.md).

## Scope

- **In:** `features/words/OrbitDetailCard.tsx`; copy in `features/words/content.ts`.
- **Out:** review actions, edit controls, navigation to a lemma page.

**Reuse: `Chip`** — bucket status badge.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Taps a word segment | Card appears below the orbit with lemma, translation, rank, stability, and a status chip |
| 2 | Taps an aggregate segment | Card names the rank range, word count, and held count |
| 3 | Selection changes | Card content updates in place (`aria-live="polite"`) |

## Layout

### Word

1. **Header row** — lemma (`text-2xl font-semibold`) left; status **Chip** right.
2. **Translation** — `text-lg text-muted` when present.
3. **Stats row** — three equal columns separated by `border-line` dividers on
   `sm+`: frequency rank (with `#` prefix), stability (days, one decimal, or em
   dash), and a short rank-band caption derived from the lemma's rank.

Chip tone follows bucket: **accent** for held/mature, **accent-soft fill** for
fragile (via `className` override), **default** for new.

### Aggregate

Heading with rank range; body with total words and held count. Same raised
card shell as the word variant.

## States

Renders only when a non-tick segment is selected. No loading or error states.

## Acceptance criteria

- [ ] Given a word segment, when the card renders, then lemma, translation,
      rank, stability, and status chip are visible.
- [ ] Given a mature or held word, when the card renders, then the chip uses
      accent tone.
- [ ] Given a fragile word, when the card renders, then the chip uses the
      accent-soft bucket styling from Words home counts.
- [ ] Given an aggregate segment, when the card renders, then rank range and
      held/total copy are shown.
- [ ] Given a selection change, when the card updates, then the region is
      `aria-live="polite"`.

## Check

`npm test -- orbit-detail vocabulary-orbit words`
