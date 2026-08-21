# Progression reference board — normative visual target

<!-- id: SPEC-feature-progression-reference-board -->
<!-- use-case: UC-080 -->
<!-- status: active -->

The nine-column progression board (Workshop 1–3, Library 4–6, Observatory 7–9)
**is** how the interface must look. It is not inspiration, not a mood board, and
not something to approximate with procedural guesses.

**Normative asset:** `design/progression/reference-board.png` — the owner-supplied
full board. Per-column crops optional at `design/progression/stage-NN.png`.
Synced copies may live under `public/design/progression/` for runtime display.

Agents **implement toward this image** until the owner marks pass on
`/dev/progression`. They do **not** invent grain direction, plank banding, palette,
or material reads. Studies and CSS tutorials are implementation hints only; when
they disagree with the board, the board wins.

## Scope

- **In:** visual definition of all nine stages; chapter boundaries; material reads
  (workshop wood/stone, library plaster/paper, observatory marble/sky); how dev
  pages (`/dev/progression`, `/dev/materials`, `/dev/wood-textures`) must use the
  board; owner sign-off before learner-facing wiring.
- **Out:** coupling to learner data; dark mode; replacing the board without owner
  approval.

## The nine columns (what each must look like)

| Stage | Chapter | Background | Card | Chrome |
| --- | --- | --- | --- | --- |
| 1 | Workshop | Raw wood planks — **horizontal** grain and seams; warm brown; matte | Rough stone; **square** corners; heavy border | Flat wood button |
| 2 | Workshop | Sanded wood — same horizontal read; softer seams | Sanded stone; slightly rounded; lighter border | Subtle button depth |
| 3 | Workshop | Oiled wood — richer tone; tight horizontal fibre | Refined stone; rounded; thin border | Richer button tone |
| 4 | Library | Cool plaster wall | Paper card; rounded | Calm field + buttons |
| 5 | Library | Calmer plaster | Smoother paper | Softer depth |
| 6 | Library | Soft paper wall | Generous radius; minimal border | Refined calm |
| 7 | Observatory | Night marble / sky | Dark marble; brass edge; soft glow | Star lamps begin |
| 8 | Observatory | More lamps | Warmer brass | Stronger glow |
| 9 | Observatory | Starry dome | Final refinement | Full brass + stars |

Within Workshop, **wood grain runs horizontally** (along the plank). The bench
read is one continuous warm field — not alternating dark/light plank stripes.

## Behavior

| # | Actor | System response |
| --- | --- | --- |
| 1 | Owner opens `/dev/progression` at stage N | Preview is comparable to column N of the reference board |
| 2 | Agent changes progression materials | Diff moves render toward the board column — not toward a new aesthetic |
| 3 | Render still mismatches board | Work stops at owner review — no merge claiming "close enough" |
| 4 | Reference file missing from repo | `⚠ SPEC GAP: commit design/progression/reference-board.png` — do not invent materials |

## Acceptance criteria

- [ ] Given `design/progression/reference-board.png` exists, when an agent touches
      workshop wood, stone, library plaster, or observatory marble, then they cite
      this spec and the column they are matching — not STUDY-029 open questions.
- [ ] Given stage 1 on `/dev/progression`, when the owner compares preview to column
      1, then wood grain reads horizontal and the bench has no high-contrast barcode
      banding — same read as the board.
- [ ] Given any stage 1–9, when compared to the matching column, then chapter,
      material family, corner radius, and border weight progress as the table above.
- [ ] Given an implementation choice (CSS gradient vs tile vs filter), when the
      owner has not marked pass, then the choice is reversible wiring only — the
      board remains the exit criterion.

## Check

Owner visual pass on all nine columns at `/dev/progression`. Automated gates do
not replace the board.

## Related

| Doc | Role |
| --- | --- |
| [`progression-explorer.md`](../page/progression-explorer.md) | Dev page that must match the board |
| [`material-explorer.md`](../page/material-explorer.md) | Isolated material stack — same columns |
| [`wood-texture-lab.md`](../page/wood-texture-lab.md) | Mark workshop wood species before promotion |
| [`STUDY-029`](../../study/STUDY-029-progressive-textures.md) | How to wire overlays — not what to draw |
