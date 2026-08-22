# Plan — progression theme system (chapters, stages, materials)

**Status: active queue.** Written 2026-08-21 after design-board review and
[STUDY-028](../study/STUDY-028-irregular-borders.md) / internet research on
scalable irregular edges and progressive textures.

**What this file owns:** how we evolve the **two-layer theme system** (chapter
tokens + stage overlays) from `/dev/progression` toward a shippable learner
progression — without image sprawl, without breaking `check:contrast`, and
without forking components.

**Parent queue:** [`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md).
**Normative behaviour:** [`specs/page/progression-explorer.md`](../specs/page/progression-explorer.md).
**Why:** [STUDY-020](../study/STUDY-020-visual-design.md), [STUDY-028](../study/STUDY-028-irregular-borders.md), [STUDY-029](../study/STUDY-029-progressive-textures.md).

---

## Where we are today

| Piece | State |
| --- | --- |
| **Chapter tokens** | 3 chapters in `data/design-themes/progression.json` — Workshop, Library, Observatory |
| **Stage overlays** | 9 stages — `glow`, `grain`, `bevel`, `rule`, `radiusCard`, `borderPx`, `stars` via `stageScopeStyle()` |
| **Wood recipe** | Measured against the reference board and validated; recorded below, not yet in the skins |
| **Material skins** | 9 CSS classes `.progression-skin--{chapter}-{1\|2\|3}` in `app/globals.css` — layer stacks (bands x rings x pores, gradient x tooth) blended with `background-blend-mode` |
| **Dev preview** | `/dev/progression` — real primitives under scope; **not wired to learner data** |
| **Shipped app theme** | Warm Scholar in `app/globals.css` — unchanged by progression work so far |
| **Irregular borders** | Built — `StageFrame` strokes a displaced `<rect>` on a sibling SVG layer, Workshop only |
| **Optional tiles** | Spec allows PNG/WebP in `public/design/progression/` to replace CSS skins when supplied |

The reference board shows **nine columns** (3 per chapter). The product model maps
that to **9 stages × 3 chapters**, not nine independent themes.

---

## Fixed in the first pass on the material skins

Four defects, found by rendering all nine stages rather than reading the CSS:

1. **Chromatic noise.** `feTurbulence` emits independent R/G/B channels. The
   grain overlay never desaturated them, so iOS Safari's rasteriser resolved the
   Library stages as soft pastel rainbow blotches. Every texture now ends with
   `feColorMatrix type='saturate' values='0'`, including the one feeding
   `feDisplacementMap` — chromatic noise there pushes x and y by uncorrelated
   amounts, which frays a stroke rather than chipping it.

2. **Border geometry.** `StageFrame` drew into `viewBox="0 0 100 100"` with
   `preserveAspectRatio="none"`. `feDisplacementMap`'s `scale` is in user units,
   so on a real card those 100 units stretched ~7x across and ~12x down and a
   scale of 8 became a ~56x96px ribbon wandering inside the card. The SVG now
   carries no viewBox — one user unit is one CSS pixel — and takes the radius as
   a number (`stageRadiusPx`). Stage roughness is retuned to px: 5 / 3 / 1.5.

3. **Ink against material.** Workshop's skin painted a mid-grey slab under the
   chapter's near-black ink: body copy at **1.4:1**. Slabs are now pale
   sandstone, chosen so `ink`/`muted` still clear AA *after* the tooth layer
   multiplies them down, and `muted` darkened to `#4f4437`.

4. **One ink for two surfaces.** Workshop's canvas is a dark wood bench and its
   cards are pale stone; a single `ink` cannot serve both, so everything drawn
   straight on the bench (shell title, filter pills, field labels) was invisible.
   `DesignThemeTokens` gains optional **`canvasInk`/`canvasMuted`** —
   `stageScopeStyle()` points `--color-ink` at the canvas pair on the scope root
   and `.progression-card` restores the surface pair. Controls deliberately keep
   the canvas pair: a skin may cut its buttons from the material itself, as
   Workshop's oiled-wood ones are.

Also: Observatory now redeclares the `--color-grade-*` and `--color-skill-*`
tokens. They are not part of `DesignThemeTokens`, so the light-theme pastels
were surviving into a dark room.

**Gate gap this exposed.** `check:contrast` reads `app/globals.css` only — it
never sees a chapter's tokens, which is why a 1.4:1 pair shipped under a green
gate. Both ink pairs are now asserted per chapter in
`lib/progression-stage.test.ts`, sharing the gate's own `scripts/lib/color.mjs`.

---

## Measured wood recipe — SUPERSEDED, do not build from this

**Stopped 2026-08-22 by the owner.** A 2-D FFT resynthesis from the reference
photo gets closer than this did, and needs none of the fitting below: it uses
the reference's actual spectrum rather than approximating it with four
parameterised noise layers. Keep this section as the record of what a
hand-fitted procedural stack could and could not reach — it is not the plan.

What survives the change of approach, because none of it is specific to
procedural generation:

- `scripts/texture-metrics.mjs` and STUDY-031 — the measuring apparatus, which
  is what identified the gaps in the first place and applies to marble, brass
  and paper equally. An FFT resynthesis still needs checking against the
  reference, and these are how.
- The `color-interpolation-filters="sRGB"` fix on all eight filters, and the
  Workshop chroma correction. Both are live and unrelated to this recipe.
- The finding that the reference bench has **no plank seams**.

### The recipe as it stood (historical)

Built against `design/progression/reference-board.png` column 1 and measured
with `scripts/texture-metrics.mjs`. Reasoning and the traps behind each choice:
[STUDY-031](../study/STUDY-031-texture-metrics.md). What wood should *look* like
is [STUDY-030](../study/STUDY-030-procedural-wood-grain.md)'s call, not this
file's — this is the arithmetic that hits it.

**Structure and colour are separate.** Every layer is grayscale and they are
summed inside *one* filter; a single ramp at the end turns that signal into
colour. This is what makes the colour exact: the ramp is solved from the
reference — signal value → its quantile → the reference's lightness there — and
authored in OKLCH, so hue and chroma are held by construction rather than
chased. It measures **hue −0°, chroma ±0.0000**.

Layering colour per-layer and correcting afterwards does not work: per-channel
histogram matching decorrelates R/G/B and turns the wood pink, and iterating a
lightness map over blended layers oscillates rather than converging (the blend
means output lightness is not a monotone image of any one ramp).

All layers `numOctaves="1"` (a stack of single-octave layers is band-limited
noise; multi-octave drags a power-law tail and cannot be made to peak), all with
`color-interpolation-filters="sRGB"`, all anisotropic at roughly **5:1** with the
long axis along the grain.

| Layer | Frequency (y) | Weight | Carries |
| --- | --- | --- | --- |
| Coarse octave | ~0.056 | 0.30 | the broader lighter areas that follow the grain |
| Grain | ~0.53 | 0.40 | the paired light/dark — the groove |
| Fine flow | ~1.19 | 0.18 | tooth, so no region is ever flat |
| Highlights | ~0.11 gated at 0.62 | 0.45 | the rare bright spots |

**Emboss** means one noise field offset up and down and differenced
(`feOffset` ×2 into `feComposite operator="arithmetic"`), which is what makes a
lit groove: its two walls are the same feature, so light and dark cannot drift
apart. Colour comes from an OKLCH ramp per layer, not an sRGB two-colour mix.

**No plank seams.** The reference bench is one continuous surface and so are its
cards; the lines that look like seams are the accent rule and a button edge.

Standing against the same-material noise floor (two patches of the same bench):

| | ours | floor | |
| --- | --- | --- | --- |
| sorted-curve lightness | 0.023 | 0.077 | inside |
| tone | +0.009 | −0.080 | inside |
| hue / chroma | −0° / ±0.0000 | — | exact |
| aspect | ×0.87 | ×1.03 | inside |
| pairing | −0.274 @2 | −0.235 / −0.087 | inside |
| scale | 1.60 | 0.87 | **outside** |
| tailHigh | 0.15 | 0.53 | **outside** |

Still open: the bright tail (the ramp's top stops compress the reference's steep
p99→p100 rise, so rare very bright pixels never appear), and the coarsest band —
bands 2–5 line up at 25/50/12/8 against 21/43/13/9, but band 1 reads 3 against
10, which is most of the remaining scale distance.

---

## Invariants (do not break)

1. **Stages never move contrast tokens** — `--color-ink`, `canvas`, `surface`, `muted` are chapter-only; `check:contrast` validates chapters only.
2. **Real primitives in preview** — no bespoke mock cards; progression must prove effect on shipped `Button`, `GradeButton`, etc.
3. **Decorative overlays only** — grain, glow, skins, rough edges, stars sit on wrapper layers; content stays sharp and accessible.
4. **Token-first** — new colours/radii/shadows go through `globals.css` or scoped chapter tokens, not raw hex in feature components (skins in `@layer` dev block are the current exception — see phase 2).
5. **Owner sign-off before learner-facing** — AGENTS.md boundary 6; `/dev/*` first always.

---

## Research summary (internet + codebase)

Full bibliography: [STUDY-sources.md](../study/STUDY-sources.md) § *Web rendering*.

### Irregular edges (STUDY-028)

- **Best default:** SVG `feTurbulence` + `feDisplacementMap` on a **border-only** stretched `<rect>` with `vector-effect="non-scaling-stroke"`.
- **Reject:** per-size PNG borders, filter on whole card (warps text), nine raster theme sets.

### Progressive textures (STUDY-029)

Industry pattern for “material that refines over time”:

| Technique | What it simulates | How progression maps |
| --- | --- | --- |
| **Layer stack** (gradient + grain overlay) | Paper, plaster, wood planks | `--stage-grain` opacity ↓; skin class swaps at chapter boundary |
| **`feTurbulence` grain** (CSS-Tricks, freeCodeCamp) | Fine grain / noise | `baseFrequency` ↑ = finer; opacity ↓ = “smoother room” |
| **`feTurbulence` + `feDiffuseLighting`** (Codrops / Sara Soueidan) | Rough paper, marble bumps | `numOctaves` + `surfaceScale` per stage; Observatory adds specular |
| **`mix-blend-mode: multiply`** on `::after` grain | Paper on light bg | Token `canvas` shows through; one procedural SVG, no PNG |
| **Directional `baseFrequency`** (`0.1 0.01`) | Wood grain lines | Workshop skins — already approximated with `repeating-linear-gradient` |
| **Optional single tile** (128px WebP) | Stone/marble colour variation | One asset per chapter max, not per stage |
| **Rough.js** | Hand-drawn sketch | Workshop stage 1 only if filter too digital; needs ResizeObserver + dep note |

**Performance:** static overlays only on dev/learner shells — do not animate turbulence; grain overlay at low opacity is cheap; full-card filters are not.

---

## How to work this plan

Follow [`WORKFLOW.md`](../WORKFLOW.md). **Standard** class for new wrappers/overlays;
**Sensitive** if ever wired to persisted learner stage.

Phases are sequential; do not wire learner data before dev preview is signed off.

---

## Phase 0 · Dev preview fidelity (current sprint)

Goal: `/dev/progression` **matches** the reference board at all 9 stages — owner
marks pass column by column. See
[`progression-reference-board.md`](../specs/feature/progression-reference-board.md).

| ID | Work | Class | Files | Done when |
| --- | --- | --- | --- | --- |
| **T-PT0a** | **Irregular border spike** — `StageFrame` wrapper: SVG filter on border rect only; `--stage-edge-roughness` in `progression.json` (Workshop high → 0 by Library) | Standard | `features/progression-explorer/`, `lib/progression-stage.ts`, `app/globals.css` (filter def), spec AC | **Done 2026-08-21** — `StageFrame`, `ProgressionFilterDefs`, workshop stages 8→5→2 |
| **T-PT0b** | **Grain upgrade** — replace or augment CSS `repeating-linear-gradient` grain with shared inline SVG noise (`feTurbulence` data-URI) on preview overlay; `--stage-grain` still drives opacity | Standard | `ProgressionPreview.tsx`, optional `app/globals.css` | **Done 2026-08-21** — `.progression-stage-grain` in `globals.css` |
| **T-PT0c** | **Skin token hygiene** — document which skin hex values are dev-only exceptions; extract repeated gradients to CSS custom properties scoped under `.progression-skin` | Trivial | `app/globals.css`, `DESIGN-SYSTEM.md` supplement or spec note | No mystery raw colours outside dev skin block |
| **T-PT0d** | **Optional tile hook** — if `public/design/progression/workshop-1.webp` exists, skin uses it; else CSS fallback (spec already allows) | Standard | `globals.css` or skin module, `design/README.md` | One chapter tile provable without committing art |

**Exit gate:** product owner signs off at `/dev/progression` after walking stages 1, 3, 5, 7, 9.

### Phase 0e · FFT photographic tiles (started 2026-08-22)

Owner breakthrough on wood-01 at native crack scale (`FEATURE_SCALE=1`).
Reference: `design/progression/breakthrough-wood-01-final.png`. Diary:
[`2026-08-22.md`](../diary/2026-08-22.md).

| ID | Work | Class | Done when |
| --- | --- | --- | --- |
| **T-PT0e1** | Land six source patches + synthesis script defaults | Standard | **Done** — PR #195 |
| **T-PT0e2** | `texture-metrics.mjs` — breakthrough tile vs board Workshop col 1 | Standard | Metrics within STUDY-031 bands + owner pass |
| **T-PT0e3** | Export `workshop-1.webp` from best tile → `public/design/progression/` | Standard | T-PT0d hook shows tile on `/dev/progression` |
| **T-PT0e4** | Per-species param overrides + knot pass (05/06) if board needs it | Standard | Spec gap closed in STUDY-032 first |

---

## Phase 1 · Data model for real progression

Goal: define how a learner’s stage is computed — **before** applying it in the shell.

| ID | Work | Blocked by |
| --- | --- | --- |
| **T-PT1a** | Use case + spec: what measurable progress maps to stage 1–9 (words held? days active? chapter completion?) | Owner decision |
| **T-PT1b** | `stageForLearner(account)` pure function + tests | T-PT1a |
| **T-PT1c** | Persist only if needed — prefer derived-from-existing metrics over new column | T-PT1a |

**⚠ Owner decision required:** stage mapping formula. Until answered, phases 2–3 stay dev-only.

---

## Phase 2 · Promote overlays into the design system

Goal: chapter + stage scoping works outside `/dev/progression` when approved.

| ID | Work | Class | Notes |
| --- | --- | --- | --- |
| **T-PT2a** | Extract `StageScopeProvider` + `StageFrame` from progression-explorer to `features/progression/` or `components/ui/` when second caller exists | Standard | Reuse check first |
| **T-PT2b** | Move dev skin colours into chapter token JSON or `@theme` aliases where they affect shipped surfaces | Standard | Contrast pairs added to `check-contrast.mjs` |
| **T-PT2c** | Shell wrapper opt-in — apply stage scope on signed-in layout root | Sensitive | Red-test-first; adversarial review |

---

## Phase 3 · Learner-facing (only after phase 0 sign-off + phase 1 spec)

| ID | Work | Notes |
| --- | --- | --- |
| **T-PT3a** | Apply `stageScopeStyle()` to app shell background / card chrome | Subtle — must not harm readability (STUDY-020) |
| **T-PT3b** | “Built vs lit” or equivalent return-after-absence dimming | Was in older 8-stage model; re-spec if still wanted |
| **T-PT3c** | `prefers-reduced-motion` + high roughness off | Straight borders, grain opacity 0 |

---

## Explicitly out of scope (for now)

- Changing Warm Scholar shipped tokens without `/dev/design` process
- Nine independent theme presets in `presets.json`
- Animated electric borders on live cards
- Rough.js dependency without PR justification
- Photoreal texture libraries per stage

---

## Open questions → IMPLEMENTATION-PLAN

Add to § "What needs a decision from you" when owner is ready:

1. **Stage mapping** — which learner metric drives stage 1–9?
2. **Irregular borders in production** — dev-only ornament or review-card wrapper?
3. **Tile assets** — design supplies WebP for `public/design/progression/` or CSS-only ship?
4. **Built/lit** — dim when away, or drop the dimension?

---

## Related files

| File | Role |
| --- | --- |
| `data/design-themes/progression.json` | Chapter + stage numbers |
| `lib/progression-stage.ts` | Scope style + skin class helpers |
| `app/globals.css` | `--stage-*` defaults + `.progression-skin--*` |
| `features/progression-explorer/` | Dev UI |
| `docs/study/STUDY-028-irregular-borders.md` | Edge techniques |
| `docs/study/STUDY-029-progressive-textures.md` | Surface / material techniques |
