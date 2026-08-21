# 30 · UI wood grain: multi-scale horizontal layers

<!-- id: STUDY-030 -->
<!-- type: reasoning -->
<!-- status: active -->
<!-- related: STUDY-028, STUDY-029, wood-texture-lab -->

## Thesis

Wood surfaces in this app read as wood when **fine and coarse horizontal fibre
layers** stack over a colour wash — not when a shader models botanic growth
rings. **`docs/specs/` and the live implementation** (`app/wood-textures.css`,
`lib/wood-grain-ridges.ts`, `app/progression-skins.css`) **are the build
contract**; this study records reasoning and traps only. Do not implement from
this chapter without reading the spec and the code first.

## Evidence

Findings marked `[A]`–`[D]`. Background shader papers live in
[`STUDY-sources.md`](STUDY-sources.md) § *UI wood grain* — not required reading
for agents.

### What the reference board actually shows

**[D]** Workshop wood on `design/progression/reference-board.png` is **face-grain
plank**: horizontal fibres along the board, optional plank seams, warm tone
wash. There are **no visible tree rings**, no end-grain circles, no knot
hero shots. Match the board column — not a forestry textbook.

### The layer model (what to build)

**[D]** The visual read comes from **stacking grain at different scales**:

| Layer | Typical period | Role |
| --- | --- | --- |
| Base wash | full swatch | Species colour, matte vs oiled |
| Coarse streaks | ~7–20px | Broader fibre bands |
| Fine fibres | ~1–5px | Hairline grain |
| Structural break | ~72px (optional) | Plank seam — not on pill/stock bar |
| Lighting | radial gradient | Bench depth, oiled sheen |

**CSS path:** `repeating-linear-gradient(180deg, …)` stacks in
`app/progression-skins.css` and the archived line-stack in git history.
**Canvas path:** `/dev/wood-textures` uses `lib/wood-grain-ridges.ts` —
`ridgeCount` sets how many horizontal ridges fit the height; `warpAmount` /
`warpFrequency` add **irregularity within each scale**, not botanic ring
physics. Both paths honour the same invariant below.

### The one invariant every agent must keep

**[D]** Grain runs **left → right** (along the plank). **No vertical
brightness bands** — the defect flagged twice on this page. SVG
`feTurbulence` with **low `baseFrequency` on X** reads as vertical columns;
rejected. If noise is used, high frequency must be on the **grain axis** (X for
horizontal grain). See [`TRAPS.md`](../TRAPS.md) § *Wood grain studies locked
agents in*.

### Rounded corners

**[D]** Keep grain on the **same element** that carries `border-radius` (canvas
fill or `background-image`). The radius **clips** the fill; it does not rotate
the grain. Per-corner SVG or `border-image` desynchronises at curves — see
[STUDY-028](STUDY-028-irregular-borders.md).

### Canvas-specific trap: interrupted ridges

**[D]** If `warpAmount × warpFrequency` is too high for the rendered width,
ridges fold into tight zigzags instead of continuous left-to-right curves.
`stableWarpAmount()` in `lib/wood-grain-ridges.ts` caps this; regression-tested
in `lib/wood-grain-ridges.test.ts`. Pixel screenshots alone missed it twice —
test the field function, not only the PNG.

### Why ChatGPT textures look effortless

**[C]** Image models replay photographic grain at one resolution. We need a
**parameterised stack** (stage opacity, species palette, resize-safe canvas) that
works at every card size. Different problem — not a skill gap.

## Product consequences

- **Extend by adding layers at new periods** or tuning `ridgeCount` / speckle —
  not by importing GLSL ring shaders or Wilkie papers as requirements.
- **Progression skins** ([STUDY-029](STUDY-029-progressive-textures.md)): chapter
  = material preset; stage = opacity knobs on shared overlays.
- **Exit criterion:** owner pass against
  [`progression-reference-board.md`](../specs/feature/progression-reference-board.md)
  — not "implemented what STUDY-030 said".

## What we reject

| Alternative | Why |
| --- | --- |
| Treating this study (or any study) as an implementation spec | Spec + live code win — [`STUDY-FORMAT.md`](../STUDY-FORMAT.md) |
| Mandating growth-ring / Wilkie / domain-warp research for UI swatches | Background only; UI is layered horizontal fibres |
| `feTurbulence` with low-X/high-Y `baseFrequency` | Vertical stripe bug — twice |
| High-contrast vertical barcode banding on the bench | Board shows one warm continuous field |
| Nine PNG sets per stage | [`STUDY-029`](STUDY-029-progressive-textures.md) — optional one tile per chapter at most |

Shared rejection catalogue: [STUDY-009](STUDY-009-antipatterns.md).

## Open questions

- Canvas vs CSS line-stack for learner-facing progression — owner pass on
  `/dev/progression` is the gate; no change proposed here.

## Related

| Doc | Link |
| --- | --- |
| Build contract | [`specs/page/wood-texture-lab.md`](../specs/page/wood-texture-lab.md) |
| Visual target | [`specs/feature/progression-reference-board.md`](../specs/feature/progression-reference-board.md) |
| Progressive overlays | [STUDY-029](STUDY-029-progressive-textures.md) |
| Agent trap | [`TRAPS.md`](../TRAPS.md) |
| Live preview | `/dev/wood-textures`, `/dev/progression` |
