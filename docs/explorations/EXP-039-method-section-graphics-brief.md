# 39 · Method section graphics — asset brief & cohesion checklist

<!-- id: EXP-039 -->
<!-- type: exploration -->
<!-- status: active -->

**Status:** exploration — assets missing; brief ready for designer / ChatGPT
**2026-08-18**

Companion to [`method-card-header.md`](../specs/component/method-card-header.md),
[33]](../reviews/design/DR-033-skill-tier-badges-exploration.md) (skill-tier shields), and
[35](EXP-035-logo-and-pwa-icon-exploration.md) (spiral-learning app mark).

---

## Problem

The methods catalogue expects **eight** decorative header images in
`public/assets/method-sections/`. `MethodCardHeader` and method detail hero both
use them. The folder is **empty** — cards render broken images. Skill-tier
shields and the spiral app mark exist; section graphics are the missing middle
layer that ties the catalogue together.

---

## Where this sits in the visual stack

| Layer | Role | Style |
| --- | --- | --- |
| **App mark** (spiral-learning) | Product identity, PWA, favicon | Flat 2-tone organic vector; accent on canvas |
| **Section graphics** (this brief) | Gestalt grouping across ~60 methods | Editorial abstract 3D; section hue accent |
| **Skill-tier shields** (study/33) | Per-method skill contribution | Heraldic micro-badges; same lighting family |
| **UI** | Navigation, states, copy | Flat tokens; Lucide icons |

**Rule:** The spiral **never** appears in section graphics or method UI. It is
the cover; section art is chapter atmosphere.

---

## Design-system alignment

From [22](../study/STUDY-020-visual-design.md) and [`DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md):

| Rule | Application |
| --- | --- |
| G1 — colour carries meaning | Each section uses **its** `--color-section-*` hue on the motif only — not the global accent |
| Calm, editorial — not a game | No mascots, confetti, rank medals, Duolingo energy |
| Warm Scholar base | Depth from shadow and material, not saturated full-bleed colour |
| Never colour alone | Section label text + distinct motif shape per section (G2) |
| Dark mode | Avoid pure-white specular hotspots; assets sit on `canvas` / `surface` fades |

**Cohesion with spiral-learning:** same earth-tone world (cream `#f7f4ef`, warm
browns, muted slates). Section graphics are **richer and more dimensional** than
the flat app mark — that contrast is intentional.

**Cohesion with skill-tier shields (v3):** same camera angle, same soft
top-left light, same “calm editorial product” — shields are the **badge** scale;
section graphics are the **banner** scale of the same family.

---

## The eight sections

Paths and labels from `features/method-menu/section-graphic.ts` and
`features/method-menu/content.ts`. Accent hex from `app/globals.css`
(`--color-section-*`).

| # | Section | UI label | Accent | Motif direction (abstract, not literal UI) |
| --- | --- | --- | --- | --- |
| 1 | `reading` | Reading | `#6b5344` | Stacked pages / folio edge; warm paper, soft fold |
| 2 | `listening` | Listening | `#44566b` | Headphone arc or sound ribbon; cool slate depth |
| 3 | `speaking` | Speaking | `#6b4f44` | Microphone silhouette or speech curve; terracotta warmth |
| 4 | `writing` | Writing | `#4f6b52` | Pen nib / ink stroke on ruled surface; sage restraint |
| 5 | `form` | Grammar and form | `#7a6558` | Paradigm lattice / conjugation grid as sculpture |
| 6 | `vocabulary` | Vocabulary | `#7a6f4f` | Lemma stack / indexed cards; lexical depth |
| 7 | `world` | Out in the world | `#4f6a72` | Doorway, path, or horizon; life outside the app |
| 8 | `commitments` | Standing commitments | `#6a4f72` | Recurring rhythm — calendar band, anchor, loop (not the app spiral) |

Each motif must read at **card** scale (**`h-24`** proposed — was `h-20`, ~80px)
and **hero** scale (`h-44`–`h-52`) after `object-cover` with
**`object-position: center 30%`** — favour a **wide** composition with the
subject in the **upper two-thirds** (lower third fades to surface).

---

## Technical delivery

| Item | Spec |
| --- | --- |
| Format | **WebP** (lossy OK; target &lt; 80 KB each) |
| Pixel size | **1600 × 500** (3.2∶1) — survives centre crop on narrow and wide viewports |
| Safe zone | Keep the motif inside the centre **70%** width × **80%** height — edges are cropped |
| Background | Soft depth gradient toward Warm Scholar `canvas` (`#f7f4ef`) — not pure white |
| File names | `method-section-{section}.webp` in `public/assets/method-sections/` |
| `alt` | Decorative — handled in code; assets need no baked-in text |

Card header applies `bg-gradient-to-t from-surface/90` (card) or
`from-canvas/90` (hero). Motifs should remain legible **through** the bottom
fade where the section label sits (lower-left).

---

## Cohesion checklist (sign-off before ship)

Designer or owner ticks each before files land in `public/`:

- [ ] All eight share **one** lighting direction (recommend soft top-left)
- [ ] All eight share **one** material language (matte editorial 3D, not glossy game art)
- [ ] Each section’s accent matches its `--color-section-*` token (table above)
- [ ] No section reuses another’s silhouette — gestalt grouping depends on distinction
- [ ] Readable at **80px height** when cropped (squint test on card mock)
- [ ] No spiral, no owl, no streak flame, no “level up” cues
- [ ] No text baked into the image (label is CSS overlay)
- [ ] Dark-mode preview: no blown-out white reflections on `canvas` dark theme
- [ ] Side-by-side with spiral app icon + one bronze skill shield — feels like one brand, two scales

---

## Asset brief (copy into a new ChatGPT / designer chat)

Attach: spiral-learning app icon (`design/logo/directions/spiral-learning.svg`)
and one skill-tier shield for scale reference. Iterate with one line of critique
per round.

```
Create ONE composite reference image: a 4-column × 2-row grid (8 cells) of
WIDE banner illustrations for a calm, editorial language-learning app (NOT a game).

Each cell is a landscape banner (~3:1 aspect). Same camera, same soft top-left
light, same matte editorial 3D style across all 8. Background fades to warm cream
#F7F4EF at the edges. No text in any cell.

ROW 1 (skill sections — use accent on the motif only):
1. READING — stacked pages / folio; warm brown accent #6B5344
2. LISTENING — headphone arc or sound ribbon; cool slate accent #44566B
3. SPEAKING — microphone or speech curve; terracotta accent #6B4F44
4. WRITING — pen nib / ink on ruled paper; sage accent #4F6B52

ROW 2 (catalogue sections):
5. GRAMMAR AND FORM — abstract paradigm lattice / conjugation grid sculpture; #7A6558
6. VOCABULARY — stacked lemma cards / indexed depth; #7A6F4F
7. OUT IN THE WORLD — doorway or path to horizon; #4F6A72
8. STANDING COMMITMENTS — recurring rhythm (calendar band or anchor), NOT a spiral; #6A4F72

AVOID: mascots, medals, rank numbers, confetti, neon, Duolingo green, literal app UI
screenshots, words or letters readable in the image.

Deliverable: one mood-board grid; winning cells exported as 1600×500 WebP each.
```

---

## After exploration

1. Owner picks winners per section (note cell # in diary). **v1 grid shipped 2026-08-18**
   — `design/method-sections/sources/method-sections-grid-v1.png`; export via
   `python3 scripts/build-method-section-graphics.py`.
2. Export WebP → `public/assets/method-sections/`.
3. `npm test -- method-card-header` — images resolve.
4. Visual check on `/methods` (card) and one method detail (hero).
5. Optional: add source PNGs under `design/method-sections/sources/` (same
   pattern as `design/logo/sources/`).

---

## Open questions

- [ ] Photographic texture vs pure 3D render? (Recommend **render** for consistency with shields.)
- [ ] Should `form` / `vocabulary` / `world` / `commitments` pick up skill hues where
      semantically close (e.g. vocabulary → reading brown)? **Default: no** — use
      section tokens so colour stays meaningful at catalogue scan distance.
