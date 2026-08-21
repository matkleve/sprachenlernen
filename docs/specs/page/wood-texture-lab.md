# Wood texture lab — mark four horizontal-grain species

<!-- id: SPEC-page-wood-texture-lab -->
<!-- use-case: UC-080 -->
<!-- status: active -->

A dev-facing page at `/dev/wood-textures` where a product owner marks the four
wood textures from the progression reference board before wiring them into
`/dev/progression`.

## Scope

- **In:** four labelled swatches (raw planks, sanded bench, oiled timber, stock
  bar); horizontal-grain note; bullet marks per swatch; CSS in
  `app/wood-textures.css`.
- **Out:** stone or card overlays; wiring to learner data; navigation entry in
  the app shell. Account required: **no** — `/dev/*` is public.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/dev/wood-textures` | Four wood swatch cards in a responsive grid |
| 2 | Reads a card | Sees number, name, texture preview, and mark bullets |
| 3 | Reads the page intro | Sees that all four use horizontal grain |

## Acceptance criteria

- [ ] Given a signed-out visitor, when `/dev/wood-textures` is requested, then
      the page renders without redirecting to sign-in.
- [ ] Given the page, when it loads, then four wood texture cards are visible.
- [ ] Given any card, when the user reads it, then a horizontal-grain swatch
      and at least one mark bullet are visible.

## Check

`npm test -- features/wood-texture-lab`
