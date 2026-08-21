# 28 · Irregular borders: scalable edges without image sprawl

<!-- id: STUDY-028 -->
<!-- type: reasoning -->
<!-- status: active -->
<!-- related: STUDY-020, progression-explorer -->

## Thesis

Rough, non-straight card borders are achievable in the browser without a library
of raster images — but only if the edge is a **separate decorative layer** that
scales with its container, not a fixed traced path or a 9-slice asset per size.

## Evidence

Findings marked `[A]`–`[D]` appear inline. Web sources used for this chapter are
listed in [`STUDY-sources.md`](STUDY-sources.md) under *Web rendering — irregular
edges*.

---

## The problem, precisely

The progression reference sheet (Workshop → Library → Observatory) shows borders
that are not merely thick or rounded — they are **irregular**: chipped stone,
soft paper, brass-lit frames. A CSS `border: 2px solid` cannot produce that
silhouette.

Three constraints collide:

1. **Flexibility** — review cards, method cards, and dev previews change height
   with content; the edge must follow without new assets.
2. **Asset budget** — nine reference columns must not become nine PNG sets ×
   breakpoints × DPR.
3. **System fit** — colours and radii stay on tokens; stages may add ornament
   but must not move contrast-bearing tokens
   ([`progression-explorer.md`](../specs/page/progression-explorer.md)).

This chapter compares techniques found in current web practice (2024–2026) and
maps them to our two-layer progression model (chapter tokens + stage overlays).

---

## Option map

| # | Technique | How the edge is made | Scales with flex? | Assets | Perf (mobile) | Browser fit |
| --- | --- | --- | --- | --- | --- | --- |
| **1** | SVG filter displacement | `feTurbulence` + `feDisplacementMap` on a stroke rect | Yes — stretch SVG, filter on border layer only | 0 (one shared filter def) | Medium — GPU filter; cheap if stroke-only | Excellent |
| **2** | SVG procedural path | Catmull-Rom / Bezier wiggle path, `preserveAspectRatio="none"` | Yes — path reflows to box | 0 | Good — static path | Excellent |
| **3** | Rough.js stroke | Hand-drawn multi-stroke rectangle, redraw on resize | Yes — with `ResizeObserver` | 0 (+ ~9 kB JS) | Medium — JS + DOM on resize | Excellent |
| **4** | Rough Notation box | Annotation library wraps element | Yes — observes layout | 0 (+ ~4 kB JS) | Medium — same | Excellent |
| **5** | `border-image` + SVG 9-slice | One SVG sliced into corners/edges | Mostly — edges stretch; corners fixed | 1 SVG (or data URI) | Good | Good; `border-radius` ignored |
| **6** | `mask-image` / mask-border | Alpha silhouette clips content or border | Yes — mask stretches | 0–1 SVG mask | Medium — mask = extra compositing | Good |
| **7** | `clip-path` polygon | Algorithmic wavy polygon | Yes — `%` or `calc()` points | 0 | Good static; poor if animated | Good (~95%) |
| **8** | CSS Houdini Paint API | JS worklet draws border in `paint()` | Yes | 0 (+ worklet JS) | Good when supported | Partial — Chromium native; polyfill elsewhere |
| **9** | Canvas redraw | Draw rough rect each frame/size change | Yes | 0 | Medium — main thread on resize | Excellent |
| **10** | Tileable texture overlay | Small WebP noise/marble repeated | Yes — `background-size` | 1–3 tiles | Good static | Excellent |
| **11** | Raster 9-slice PNG | Corner/edge images | Fragile — aspect + DPR | Many | Good | Universal |
| **12** | Stacked `box-shadow` inset | Chamfer / depth, not true roughness | Yes | 0 | Good | Excellent |

**[A]** SVG filter displacement and mask-based edges are documented in MDN and
widely used in production blog posts (Ben Gammon 2024, Sara Soueidan / Codrops on
`feTurbulence`). **[A]** `vector-effect="non-scaling-stroke"` keeps stroke width
constant when an SVG stretches with its container (MDN, Stack Overflow consensus).
**[B]** Rough.js (~9 kB gzipped) is battle-tested via Excalidraw; redraw-on-resize
is the expected integration pattern. **[B]** CSS Paint API works in Chromium;
Safari/Firefox need polyfill or fallback (`@supports`, GoogleChromeLabs polyfill).
**[A]** Animating `mask-position` or re-computing `feTurbulence` every frame
hurts INP and paint count (idealo Tech Blog 2024, DEV Community 2024); static
rough edges avoid this. **[A]** `border-image` ignores `border-radius` (MDN) — a
real limitation for our `rounded-card` primitives.

---

## Technique notes (from research)

### 1 · SVG filter displacement (recommended baseline)

Procedural Perlin noise displaces pixels along a **simple geometric stroke** —
typically a `<rect>` with `width="100%" height="100%"` and
`preserveAspectRatio="none"`.

**Knobs:** `baseFrequency` (noise scale — higher = finer chip), `scale` on
`feDisplacementMap` (amplitude — higher = rougher), `numOctaves`, optional
`seed` for stable randomness per stage.

**Critical implementation detail:** apply the filter to a **border-only layer**,
not the whole card — otherwise text and icons warp. Expand filter region
(`x="-20%" width="140%"`) so displacement is not clipped at edges (Daring
Designs 2025).

**Progression fit:** `--stage-edge-roughness` maps directly to `scale`; Library
stages drive it toward 0; Observatory keeps straight edge + glow (existing
`--stage-rule`, lamps).

### 2 · Procedural wavy SVG path

Tools like the wiggly-border-generator pattern generate a closed path with
Catmull-Rom splines; the path control points are expressed as fractions of
viewBox width/height so stretching preserves relative waviness. `seed` gives
stable edges per card instance.

**Pros:** reads as "hand-drawn outline" more than noise warp. **Cons:** path
must be regenerated when width/height ratio changes a lot, or waviness looks
stretched unevenly on very tall cards.

### 3 · Rough.js / Rough Notation

Rough.js draws multiple slightly offset strokes — authentic sketch aesthetic.
Requires **`ResizeObserver`** (or similar) to call `rough.rectangle()` again when
the container size changes; the library does not auto-bind to DOM layout.

**Pros:** closest to "Excalidraw on a card". **Cons:** new dependency (AGENTS.md
boundary 7 — needs PR justification); sketch look may fight STUDY-020's
"well-made tool" promise at high stages; more JS than filter-only.

Rough Notation's `box` type is optimised for highlighting text spans, not
full flex cards — possible for small surfaces, awkward for variable-height
review cards.

### 4 · `border-image` with one SVG

CSS-Tricks and MDN document a single SVG sliced into nine regions — edges
`stretch`/`round`, corners fixed. Works for scroll/parchment UIs.

**Reject as default for us:** `border-radius` does not apply to border-image; our
cards use `rounded-card`. Would require a second background-layer hack or
rounded SVG source art.

### 5 · Masks and clip-path

**Mask:** irregular alpha defines visible silhouette — good for "torn paper" top
edge, less for a full frame. Mask compositing may force offscreen buffers in
Chromium (Grida SVG research).

**clip-path:** polygon with many points for waves — scales with `%` coordinates.
Spec notes clipping paths can perform better than masks for simple shapes. Poor
fit for heavy inset/chamfer looks; better for Library "soft tear" if ever needed.

### 6 · CSS Houdini Paint API

Worklet receives element size and custom properties; can draw arbitrary border
in `paint(myBorder)`. Polyfill exists; pseudo-element support in polyfill is
limited (12 Days of Web 2021).

**Reject for v1:** non-baseline API, extra JS bootstrap, overlaps with SVG filter
approach without clear win.

### 7 · Tileable texture (supporting role only)

One 128×128 WebP grain/marble at low opacity answers **surface material**, not
**edge silhouette**. Cheap, scales infinitely, already aligned with
`--stage-grain` direction in `ProgressionPreview`. Does not replace irregular
border; complements it.

### 8 · Raster 9-slice libraries

**Reject:** violates asset budget; DPR and aspect-ratio breakage; contradicts
token-first theming (dark mode needs second set).

---

## Performance and accessibility

**[A]** Static SVG filters on a thin decorative layer are acceptable for dev
exploration and for low-stage overlays on a few surfaces. **[B]** Do not animate
`feTurbulence` parameters on scroll or hover — animate `feOffset` on precomputed
noise if motion is ever required (lxb-studio.com 2025).

**[D]** Treat rough borders as **pure ornament**: `aria-hidden` on the frame SVG,
no information encoded only in edge shape. Focus rings stay on interactive
primitives unchanged.

**[D]** At `prefers-reduced-motion: reduce`, optionally set
`--stage-edge-roughness: 0` — straight border reads calmer; consistent with
stage overlay philosophy.

---

## Product consequences

**[D]** For Sprachenlernen, the default direction is:

1. **Primary — Option 1 (SVG filter on border layer)**  
   One `<filter id="stage-edge-rough">` in the app shell; a `StageFrame` wrapper
   (or progression preview only at first) draws a stretched stroke rect with
   `vector-effect="non-scaling-stroke"` and token stroke colour. Roughness is a
   stage variable, not a new palette.

2. **Secondary — Option 12 + existing overlays**  
   Inset chamfer (`--stage-bevel`), brass rule (`--stage-rule`), glow, grain
   already in `/dev/progression` — these cover depth and material without
   irregular silhouette.

3. **Optional later — Option 3 (Rough.js)**  
   Only if filter displacement reads too "digital" in review; only with explicit
   dependency note; likely Workshop stages 1–2 only.

4. **Supporting — Option 10 (one grain tile)**  
   If CSS gradient grain is insufficient for Workshop; still one asset, not nine.

**[D]** Do not ship all nine reference columns as distinct skins. The product
model is eight continuous stages across three chapters — roughness is a numeric
overlay, not a pick-one-of-nine theme switcher.

**[D]** Validate in `/dev/progression` before any learner-facing surface. Visual
design changes require owner approval (AGENTS.md boundary 6).

---

## What we reject

| Alternative | Why |
| --- | --- |
| Per-size PNG/WebP borders | Asset explosion; flex breakage; dark-mode duplication |
| Fixed hand-traced SVG paths per component | Does not follow variable card height |
| Filter on entire card including text | Warps content; accessibility and legibility risk |
| Animated turbulence on live UI | Paint/INP cost; "electric border" is not our aesthetic |
| Houdini-only border without fallback | Non-baseline; maintenance burden |
| `border-image` as primary card border | Conflicts with `rounded-card` token |
| Rough.js everywhere by default | New dependency; sketch tone conflicts with late-stage Observatory |
| Nine discrete theme files | Conflicts with progression spec and contrast gate |

Shared rejection catalogue: [STUDY-009](STUDY-009-antipatterns.md).

---

## Open questions

Pointers only — not decided here.

- Should `--stage-edge-roughness` live in `progression.json` alongside
  `bevel`/`rule`? → spec change to
  [`progression-explorer.md`](../specs/page/progression-explorer.md) if yes.
- Is filter displacement "stone" enough, or does Workshop stage 1 need Rough.js?
  → judge on `/dev/progression` with product owner ([STUDY-020](STUDY-020-visual-design.md)).
- Which learner surfaces (if any) get a frame beyond dev preview? → use case /
  IMPLEMENTATION-PLAN; default **none** until exploration approves.
- One shared filter vs per-chapter filter seeds? → implementation detail once
  roughness token exists.

---

## Related

| Doc | Link |
| --- | --- |
| Visual design constraints | [STUDY-020](STUDY-020-visual-design.md) |
| Progression model (chapter + stage) | [`specs/page/progression-explorer.md`](../specs/page/progression-explorer.md) |
| Progressive textures | [STUDY-029](STUDY-029-progressive-textures.md) |
| Work plan | [`plans/progression-theme-system.md`](../plans/progression-theme-system.md) |
| Live preview | `/dev/progression` |
| Design tokens | [`DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md) |
| Web sources for this chapter | [STUDY-sources](STUDY-sources.md) |
