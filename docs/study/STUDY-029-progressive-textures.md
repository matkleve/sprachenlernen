# 29 · Progressive textures: surfaces that refine with stage

<!-- id: STUDY-029 -->
<!-- type: reasoning -->
<!-- status: active -->
<!-- related: STUDY-028, progression-explorer -->

## Thesis

Textures that **progress** from raw wood to smooth paper to lit marble should be
built as **layered procedural overlays** driven by stage variables — not as nine
image sets — and the web platform already documents how to do that with SVG
filters, blend modes, and optional single tiles.

## Evidence

Findings marked `[A]`–`[D]`. Sources in
[`STUDY-sources.md`](STUDY-sources.md) § *Web rendering — irregular edges* and
*Progressive textures*.

---

## What “progressive texture” means here

In the reference board, each column differs in **material** as well as border:

| Chapter | Stage feel | Material read |
| --- | --- | --- |
| Workshop 1–3 | Raw → sanded → oiled | Wood bench, rough stone card |
| Library 4–6 | Plaster → calmer → soft paper | Cool wall, smoother paper |
| Observatory 7–9 | Marble → more lamps → starry dome | Dark sky, brass glow |

Progression is **continuous within a chapter** (opacity, grain, bevel, glow) and
**discrete at chapter boundaries** (palette, skin class). That matches
`progression.json` today: numeric overlays plus `skin: "workshop-2"` etc.

---

## What the internet recommends

### 1 · Layer stack (most common production pattern)

**[A]** CSS-Tricks *Grainy Gradients* and freeCodeCamp’s SVG-filter guide describe
the same stack:

1. Base **linear/radial gradient** (material colour — wood plank direction, plaster wash, night sky).
2. **Procedural noise** as `background-image` (inline SVG `feTurbulence` data-URI).
3. **`filter: contrast() brightness()`** on the noise layer to crush it to monochrome grain.
4. **`mix-blend-mode: multiply`** (light backgrounds) or **`overlay`** (dark) so grain tints without new palette tokens.
5. **`isolation: isolate`** on a wrapper so blend does not bleed into the page.

**Progression knob:** `--stage-grain` controls overlay **opacity** only — chapter
colours unchanged. Workshop 1 = coarse grain visible; Library 6 = barely there.

zharr.is (*Grain of the Screen*, 2025) argues this is ideal for **token systems**:
one `::after` grain layer on a scope element; evolving the product means editing
opacity and filter params, not component structure.

### 2 · feTurbulence alone (cheap grain)

**[A]** MDN + CSS-Tricks *Creating Patterns With SVG Filters*:

| Parameter | Effect |
| --- | --- |
| `type="fractalNoise"` | Smooth, paper-like (prefer over `turbulence` for surfaces) |
| `baseFrequency` | Low = large blobs; high = fine sand. Paper often **0.04–0.8** depending on scale |
| `numOctaves` | Detail layers; **3–5** enough; higher burns CPU for little gain |
| `stitchTiles="stitch"` | Seamless repeat when used as tile background |
| Anisotropic frequency `"0.1 0.01"` | Stretched noise → **directional wood grain** |

Already approximated in-app via `repeating-linear-gradient` on `.progression-skin--workshop-*` and library plaster lines. Upgrade path: swap gradient grain for turbulence data-URI at same opacity knob.

### 3 · feTurbulence + feDiffuseLighting (bump / paper / marble)

**[A]** Codrops (Sara Soueidan, 2019) and SVG Filters crash course: chain noise →
light:

```svg
<feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise"/>
<feDiffuseLighting in="noise" lighting-color="white" surfaceScale="2">
  <feDistantLight azimuth="45" elevation="60"/>
</feDiffuseLighting>
```

Noise alpha acts as a **bump map**; lighting creates peaks and valleys — reads as
rough paper or matte stone. **`surfaceScale`** and **`numOctaves`** are the
progression levers: Workshop = higher scale (rougher); Library = lower; Observatory
may add **`feSpecularLighting`** for brass/marble sheen on card chrome only.

**Cost:** heavier than flat grain — restrict to preview card surfaces, not full viewport.

### 4 · feColorMatrix + feBlend (material tinting)

**[B]** Vanguard Wooden UIKit (open-source reference) chains `feTurbulence` →
`feColorMatrix` → `feDiffuseLighting` for **procedural wood species** with zero
PNG assets. Species = different colour matrices, not different files.

**Product mapping:** three chapter “species” (workshop wood, library plaster, observatory marble) as three filter presets; stages adjust `surfaceScale` and opacity inside the chapter.

### 5 · mask-image (weathering on the content itself)

**[B]** Google Chrome *modern-web-guidance* — `mask-image` with a repeating texture
makes **content appear worn**, not just overlaid. Progressive: mask opacity ↑ on
lower stages (rougher silhouette).

**Caution:** masks can force offscreen compositing (Chromium research). Use for
optional hero surfaces, not every review card.

### 6 · Single tileable WebP (optional escalation)

**[D]** When procedural noise cannot read as marble or oiled wood, one **128–256px
seamless tile** per chapter (`background-size: 128px`) beats nine full borders.
Stages only change **opacity** and **blend mode** of the tile layer.

Spec already allows `public/design/progression/` — CSS remains default.

### 7 · What not to do for progressing textures

| Anti-pattern | Why |
| --- | --- |
| Nine full-screen background photos | Bandwidth, DPR, dark mode duplication |
| Animated `feTurbulence` every frame | INP / paint cost (idealo 2024) |
| Texture baked into component backgrounds | Breaks token theming and dark mode |
| Different unrelated CSS per stage (×9) | Unmaintainable; use skin class + numeric knobs |

---

## Mapping to our stage variables

| Variable | Texture role | Typical direction 1 → 9 |
| --- | --- | --- |
| `skin` | Chapter material preset (gradient stack / filter id) | Changes at 3→4 and 6→7 |
| `grain` | Noise overlay opacity | High → low |
| `glow` | Light pool from above | Low → high (Observatory) |
| `bevel` | Inset highlight (worked surface) | 0 → 3 |
| `rule` | Brass/accent hairline ornament | 0 → 0.95 |
| `stars` | Observatory sky dots | 0 → 20 |
| *(proposed)* `edgeRoughness` | SVG displacement on border | High → 0 (STUDY-028) |

Within one chapter, **only numeric vars change** — the eye reads refinement without a palette review.

---

## Product consequences

**[D]** Default implementation order:

1. Keep **CSS gradient skins** as fallback (already in `globals.css`).
2. Add **one shared grain overlay** (turbulence data-URI + `--stage-grain`).
3. Add **chapter-specific filter presets** only if gradients fail owner review.
4. Add **optional tiles** per chapter when design supplies art — not per stage.
5. Wire to learners only after `/dev/progression` sign-off ([`plans/progression-theme-system.md`](../plans/progression-theme-system.md)).

**[D]** Textures must stay **behind** content with `pointer-events: none` and must
not reduce text contrast — if grain darkens canvas, that is a chapter token
change, not a stage overlay.

---

## What we reject

- Nine PNG background sets
- Full-viewport SVG lighting filters on every page
- Houdini Paint API as the only path (non-baseline)
- Photoreal 3D renders in the live app (fine for method-card art lab, not chrome)

---

## Open questions

None for workshop wood, observatory marble wiring, or tile vs CSS — the reference
board and owner pass on `/dev/progression` are the gates. See
[`progression-reference-board.md`](../specs/feature/progression-reference-board.md).

---

## Related

| Doc | Link |
| --- | --- |
| Irregular borders | [STUDY-028](STUDY-028-irregular-borders.md) |
| Work plan | [`plans/progression-theme-system.md`](../plans/progression-theme-system.md) |
| Spec | [`specs/page/progression-explorer.md`](../specs/page/progression-explorer.md) |
| Live preview | `/dev/progression` |
