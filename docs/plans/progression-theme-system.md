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
| **Material skins** | 9 CSS classes `.progression-skin--{chapter}-{1\|2\|3}` in `app/globals.css` — gradient stand-ins for wood / plaster / night dome |
| **Dev preview** | `/dev/progression` — real primitives under scope; **not wired to learner data** |
| **Shipped app theme** | Warm Scholar in `app/globals.css` — unchanged by progression work so far |
| **Irregular borders** | Not built — studied in STUDY-028; recommended: SVG filter on border layer only |
| **Optional tiles** | Spec allows PNG/WebP in `public/design/progression/` to replace CSS skins when supplied |

The reference board shows **nine columns** (3 per chapter). The product model maps
that to **9 stages × 3 chapters**, not nine independent themes.

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

Goal: `/dev/progression` reads close to the reference board at all 9 stages.

| ID | Work | Class | Files | Done when |
| --- | --- | --- | --- | --- |
| **T-PT0a** | **Irregular border spike** — `StageFrame` wrapper: SVG filter on border rect only; `--stage-edge-roughness` in `progression.json` (Workshop high → 0 by Library) | Standard | `features/progression-explorer/`, `lib/progression-stage.ts`, `app/globals.css` (filter def), spec AC | **Done 2026-08-21** — `StageFrame`, `ProgressionFilterDefs`, workshop stages 8→5→2 |
| **T-PT0b** | **Grain upgrade** — replace or augment CSS `repeating-linear-gradient` grain with shared inline SVG noise (`feTurbulence` data-URI) on preview overlay; `--stage-grain` still drives opacity | Standard | `ProgressionPreview.tsx`, optional `app/globals.css` | **Done 2026-08-21** — `.progression-stage-grain` in `globals.css` |
| **T-PT0c** | **Skin token hygiene** — document which skin hex values are dev-only exceptions; extract repeated gradients to CSS custom properties scoped under `.progression-skin` | Trivial | `app/globals.css`, `DESIGN-SYSTEM.md` supplement or spec note | No mystery raw colours outside dev skin block |
| **T-PT0d** | **Optional tile hook** — if `public/design/progression/workshop-1.webp` exists, skin uses it; else CSS fallback (spec already allows) | Standard | `globals.css` or skin module, `design/README.md` | One chapter tile provable without committing art |

**Exit gate:** product owner signs off at `/dev/progression` after walking stages 1, 3, 5, 7, 9.

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
