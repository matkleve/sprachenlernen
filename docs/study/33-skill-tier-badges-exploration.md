# 33 · Skill-tier badges — owner exploration (wood → platinum)

**Status:** exploration — not a spec. Owner direction captured 2026-08-16 after
methods detail redesign discussion. Supersedes nothing yet; tensions with
[27](27-method-badges.md) are called out explicitly.

---

## What the owner asked for

1. **Text-mask hero first** on method detail — title integrated with the section
   graphic before full-bleed fade hero.
2. **Skill-class badges** — one artsy badge per skill the method serves, with
   skill-specific imagery (e.g. headphones motif for listening).
3. **Five contribution tiers per skill** — wood through platinum, with visual
   quality escalating at each tier (not flat icons).
4. **Detail layout under the in-page title** (not the shell header):
   - **Left:** skill-tier badges for this method
   - **Right:** effort load
5. **Image exploration** — reference grid (4 skills × 5 tiers) before production
   assets. v3 brief in § Asset brief (use in a **new** ChatGPT chat).

Duration chip format (single range vs OR prose) deferred to UX review in
[`method-detail.supplement.md`](../specs/page/method-detail.supplement.md).

---

## UX designer review

### Verdict on the layout (skill badges left, effort right)

**Promising, with constraints.**

| Pro | Con |
| --- | --- |
| Answers "what is this for?" and "can I manage it?" in one scan under the title | Two-column row breaks on narrow phones unless badges stack |
| Mirrors study/27's orthogonal families (skill vs effort) without merging them | Shell header already shows truncated name — a dense badge row immediately below the hero risks visual noise before summary |
| Left/right split is a known pattern (metadata rail) | Effort alone on the right may look unbalanced when only one skill badge shows |

**Recommendation**

- Use a **single horizontal band** under the in-page `<h1>` and summary, not
  squeezed between title and summary:
  ```
  [hero / text-mask title]
  Summary paragraph (full width)

  ┌ Skill tier badges (wrap, start) ──── Effort (end) ┐
  └────────────────────────────────────────────────────┘

  Practical …
  ```
- On `< sm`, let effort **drop below** skill badges (left-aligned stack), not
  squeeze beside them.
- **Do not** repeat evidence in this row — keep evidence in the research
  disclosure (study/27). Three zones in one row is crowded.

### Verdict on wood → platinum (5 tiers × 4 skills)

**Conceptually aligned with study/27 if scoped correctly; risky if read as method rank.**

Study/27 scoped metals to **contribution per skill**, not global method quality,
and rejected metal *words* in UI. The owner now wants explicit tier names and
artsy badges. That is allowed **only if**:

| Rule | Why |
| --- | --- |
| Tier describes **how much this method trains that skill**, not "method quality" | UC-046, study/27 §6 |
| Weak methods show **low tiers honestly** (e.g. background listening → wood/slight listening) | Constitution honesty |
| Every badge has a **text label** (tier + skill), not icon alone | WCAG, study/27 §7 |
| Tiers are **not** learner rank, unlocks, or streak rewards | SDT, study/27 §2 |

**Proposed mapping (v1 — needs owner sign-off)**

| Tier | Internal | Meaning (one line) | Maps from today |
| --- | --- | --- | --- |
| Wood | 1 | Barely touches this skill | `slight` + weak `trains` |
| Bronze | 2 | Minor side benefit | `slight` |
| Silver | 3 | Clear secondary training | `secondary` |
| Gold | 4 | Primary reason to do this | `primary` |
| Platinum | 5 | Exceptional focus on this skill | *new — rare; catalogue flag only* |

Platinum should appear on **few** methods (e.g. narrow listening for listening).
Most methods show one gold + zero–two lower tiers.

**Alternative rejected by UX (for now):** one badge per method (single metal) —
same failure mode as study/27's rejected global medal.

### Verdict on artsy skill badges vs Lucide chips

**Worth exploring for detail; keep Lucide marks on list cards until assets ship.**

- **Cards (~53 items):** small Lucide skill marks + plain evidence/effort text
  stay scannable at catalogue scale (study/27 §5).
- **Detail (one method):** room for **one larger tier badge per active skill**
  (max four). Artsy assets justify the investment here first.
- Headphones-in-badge for listening is good gestalt **if** reading/speaking/writing
  get equally distinct motifs (book, mic, pen — not generic shields).

### Text-mask hero (owner: try this first)

**Good first step** before full-bleed fade hero.

- Section graphic fills a band behind or through the method name (`background-clip:
  text` or high-contrast overlay).
- Long names need a **fallback**: solid text on gradient scrim when mask hurts
  legibility.
- After mask ships, evaluate full-bleed fade as v2 (see supplement).

### Owner feedback on v1 grid (2026-08-16)

First ChatGPT grid landed the right **skill motifs** (book, headphones, mic, pen)
and **material progression** (wood grain → metals). Gap: from Bronze through
Platinum the **shield silhouette stays identical** — only the finish changes.

**Required for v2 assets:** both **material** and **shield frame** must level up:

| Tier | Shield frame (evolves each row) | Material / finish |
| --- | --- | --- |
| Wood | Plain rounded plaque, no point, rough edges | Matte wood grain |
| Bronze | Simple shield, single bottom point | Warm bronze metal |
| Silver | Same family, slightly taller, subtle side curves | Polished silver |
| Gold | Ornate shield, stronger point, small corner detail | Rich gold |
| Platinum | Most elaborate frame, crown or wing hints (subtle) | Luminous platinum |

Skill icon stays centered and recognizable; the **frame** carries tier prestige,
not a recoloured copy of the Bronze shape.

### Owner feedback on v2 grid (2026-08-16)

v2 improved **material** (wood grain → metals) and kept **skill motifs** stable
per column. Gaps remaining:

1. **Shield frame** — Bronze through Platinum still share the same outer
   silhouette; only finish changes.
2. **Skill icon** — book / headphones / mic / pen are **identical** at every tier;
   only the plaque material changes. Owner wants the **motif itself to upgrade**
   too (simpler → more refined → more detailed), while staying recognizable.

**Required for v3 assets — three things level up per row:**

| Tier | Shield frame | Plaque material | Skill motif (center) |
| --- | --- | --- | --- |
| Wood | Flat rounded plaque, no point | Raw wood grain | Carved/simple (e.g. line-art book) |
| Bronze | First true shield, one point | Bronze metal | Slightly more detail, bronze-tinted |
| Silver | Taller shield, side curves | Polished silver | Clearer form, cool highlights |
| Gold | Ornate heraldic frame | Rich gold | Fine detail, warm accent on icon |
| Platinum | Most elaborate frame | Luminous platinum | Richest detail; still readable at 48px |

All 20 cells must feel like **one family** — same lighting, same 3D style, same
proportions — not 20 unrelated illustrations.

### Design-system alignment (v3+)

Badges must sit beside section graphics, method cards, and token-based UI without
clashing. Rules for asset authoring and ChatGPT prompts:

| Rule | Source | Application |
| --- | --- | --- |
| Calm, editorial — not game medals | study/22 G1 | No cartoon shine bursts, no rank numbers |
| Colour carries meaning | study/22 G1, DESIGN-SYSTEM | Skill icon **hue family** per column; metals stay neutral |
| Never colour alone | study/22 G2, Constitution §3 | Shape + tier must differ even in greyscale; `aria-label` carries words |
| Skill token hues | `app/globals.css` | Reading warm brown `#6b5344`, listening cool slate `#44566b`, speaking warm `#6b4f44`, writing sage `#4f6b52` — use as **accent on the motif**, not flat fills |
| Section graphics | `method-section-*` webp | Same abstract/editorial 3D language; badges are the **micro** version of section headers |
| Dark mode | DESIGN-SYSTEM | Assets are mostly metal + embossed icons; avoid pure white hotspots that blow out on dark `canvas` |

**Cohesion checklist** (designer signs off before vectorizing):

- [ ] Same camera angle and light direction across all 20 cells
- [ ] Skill column hue matches token family at every tier
- [ ] Wood row is clearly **not** a recoloured metal shield
- [ ] Each row’s shield outline is visibly different from the row above
- [ ] Each row’s center motif is visibly more detailed than the row above (same column)
- [ ] Platinum is premium, not “video game legendary item”

---

## Asset brief (v3)

Current target for image exploration: **v3** (shields + motifs + design tokens).
Self-contained — v1/v2 were longer but repeated the same gaps; v3 is enough for
a new ChatGPT chat. Attach your latest grid image plus one line of critique if
iterating.

**v3 brief** (shields + skill motifs + design tokens):

---

```
Create ONE composite reference image: a 4-column × 5-row grid of app badge
icons for a calm, editorial language-learning product (not a game).

COLUMNS — skill motif must UPGRADE in detail each row (same column, richer each tier):
1. Reading — book / pages (warm brown accent #6B5344 on the motif)
2. Listening — over-ear headphones (cool slate accent #44566B)
3. Speaking — studio microphone (warm terracotta accent #6B4F44)
4. Writing — fountain pen / ink (sage green accent #4F6B52)

ROWS — THREE things must change every row: (1) shield FRAME geometry,
(2) plaque MATERIAL, (3) center MOTIF detail level:

Row 1 WOOD:
- Frame: flat rounded wooden plaque, NO shield point, hand-carved edges
- Material: matte wood grain
- Motif: simplest carved version (minimal lines, low relief)

Row 2 BRONZE:
- Frame: NEW shape — classic shield with single bottom point (not wood plaque)
- Material: warm bronze metal
- Motif: same object, slightly more defined emboss

Row 3 SILVER:
- Frame: NEW shape — taller shield, subtle side curves (not same as bronze)
- Material: polished silver, cool reflections
- Motif: clearer detail, sharper edges

Row 4 GOLD:
- Frame: NEW shape — ornate heraldic shield, corner flourishes
- Material: rich gold
- Motif: fine detail, warm highlights on the skill object

Row 5 PLATINUM:
- Frame: NEW shape — most elaborate (subtle crown ridge or layered border)
- Material: luminous platinum / white-gold
- Motif: maximum detail, still readable at 48px — not overcrowded

CRITICAL:
- Do NOT reuse the same shield outline for bronze/silver/gold/platinum.
- Do NOT reuse the exact same center icon at every tier — the SKILL OBJECT
  must visibly gain detail and refinement each row (like leveling up craft).
- Do NOT make it look like a mobile game rank badge or military medal.
- One cohesive 3D style: same lighting direction, same camera, same proportions
  across all 20 cells so they feel like one set.
- Skill accent colours only on the center motif; metal frames stay true to tier.
- No text, numbers, or letters inside badges.
- White background; label rows/columns outside only.

Deliverable: mood-board grid for a designer to vectorize into SVG layers
(frame + motif) aligned with a muted, trustworthy learning app.
```

**v2 prompt** (shields only — archived; motifs did not upgrade):

```
Create ONE composite reference image: a 4-column × 5-row grid of app badge
icons for a language-learning product. Each cell is a distinct badge design.

COLUMNS (skill class — each column has a unique art motif woven into every tier):
1. Reading — open book motif
2. Listening — over-ear headphones motif
3. Speaking — studio microphone motif
4. Writing — fountain pen / ink line motif

ROWS (contribution tier — BOTH shield shape AND material must change per row):

Row 1 — WOOD:
- Shield: simple flat rounded square plaque, NO point, rough hand-carved edges
- Material: matte wood grain, muted brown
- Skill icon: embossed, simple

Row 2 — BRONZE:
- Shield: classic shield shape with a single bottom point (visibly different
  from wood — not the same outline recoloured)
- Material: warm bronze metal, basic polish
- Skill icon: embossed, slightly more detail

Row 3 — SILVER:
- Shield: taller shield, subtle side curves or flutes — clearly more elaborate
  than bronze, not the same silhouette
- Material: polished silver, cool reflections
- Skill icon: sharper emboss, more depth

Row 4 — GOLD:
- Shield: ornate heraldic shield, stronger point, small corner flourishes
- Material: rich gold, warm highlights, optional tiny gem accents at corners
- Skill icon: highly detailed emboss

Row 5 — PLATINUM:
- Shield: most elaborate frame — crown ridge, wing hints, or layered border
  (still calm, not game-cartoon)
- Material: luminous platinum / white-gold, highest gloss
- Skill icon: maximum detail, still readable at 64px

CRITICAL — do NOT reuse the same shield outline for bronze, silver, gold, and
platinum with only a colour swap. Each row must have a visibly different
frame geometry. Wood row must NOT be a metal shield — it is a wooden plaque.

Requirements:
- Skill motif must remain recognizable in every cell of its column.
- Style: modern, calm, editorial 3D — NOT cartoon game rank, NOT military medal,
  NOT emoji. Premium craft-app quality.
- Palette: restrained hue families per column (reading warm paper, listening cool
  teal, speaking coral, writing slate) on the skill icon only; metals stay true
  to tier.
- No text, numbers, or letters inside badges.
- Consistent lighting direction across all 20 cells.
- White background; thin gutters between cells.
- Label rows and columns OUTSIDE the art only: Wood, Bronze, Silver, Gold,
  Platinum; Reading, Listening, Speaking, Writing.

Deliverable: one mood-board grid where a designer can see 5 distinct shield
families × 4 skill motifs before vectorizing.
```

**v1 prompt** (archived — same as first iteration; shield shape not emphasised):

<details>
<summary>v1 prompt (click to expand)</summary>

```
Create ONE composite reference image: a 4-column × 5-row grid …
(higher tiers add detail, depth, lighting, and material quality — not just a
color swap.)
…
```

</details>

---

## Relationship to existing specs

| Doc | Current rule | This exploration |
| --- | --- | --- |
| [27-method-badges.md](27-method-badges.md) | 3 contribution levels; no metal words in UI | 5 tiers with wood→platinum names — **owner override pending** |
| [method-badge.md](../specs/component/method-badge.md) | Lucide icon marks on cards only | Detail may add tier badges; cards unchanged until assets exist |
| [method-detail.md](../specs/page/method-detail.md) | No badge row on detail | Proposes badge band under hero title |
| [GLOSSARY.md](../GLOSSARY.md) | primary / secondary / slight | May add tier names as display layer over same data |

**Before implementation:** owner picks grid winners; tier **metric** and **display
rules** below are decided (2026-08-16).

---

## Owner decisions (2026-08-16, confirmed)

| Topic | Decision |
| --- | --- |
| **Which badges to show** | **Only skills the method improves** — bronze tier or higher. Wood and “none” are **not shown** (no dimmed slots, no empty columns). |
| **Tier metric** | **Five tiers** (wood → platinum) computed per skill per method from catalogue data **from day one**. Wood exists in the metric but stays **off the UI**. |
| **Why hide wood** | A method can be excellent overall while contributing little to one skill. Showing a wood badge would read as “bad method” and discourage use. The metric is honest; the display is selective. |
| **Badge labels** | **Icons only** — shield + skill motif, no “Gold · Listening” text. Screen readers get `aria-label` / `title` with tier + skill in words. |
| **Shield + material** | Both evolve per tier (see v2 prompt). |
| **Cards vs detail** | Detail first; cards keep Lucide until final assets exist. |

### Skill tier metric (v1)

Computed once per method from catalogue fields (`section`, `skills[]`, `trains`,
`intensity`, optional future `skillContribution`). Internal only — learners
never see “wood” on a badge.

| Tier | Shown on UI? | Meaning | Derivation (v1) |
| --- | --- | --- | --- |
| Wood | **No** | Barely touches this skill | `slight` + weak `trains` pattern |
| Bronze | Yes | Minor but real benefit | `slight` without weak trains |
| Silver | Yes | Clear secondary training | `secondary` |
| Gold | Yes | Primary reason to do this | `primary` |
| Platinum | Yes | Exceptional focus on this skill | `primary` + section-primary skill + `intensity` 3, or explicit catalogue flag (v2) |

**Display rule:** render a tier badge only when `tier ≥ bronze` for that skill.
If no skill qualifies, the left side of the badge band is empty (effort still
shows on the right).

**Phase note (owner: “do B, then immediately A”):** ship the **full five-step
metric** in data/code first (A); the **UI** only ever renders bronze–platinum
icons (B — wood never appears). No phased “four tiers then add platinum later”.

---

## Open questions (remaining)

1. Asset pipeline: SVG components (frame + icon layers) vs flat webp per cell?
2. Platinum v1: derive from rule above, or require explicit `skillContribution` on ~10 borderline methods?

---

## Next steps

1. Owner / designer produces v3 grid from § Asset brief (outside chat) → shields
   AND center motifs upgrade per row.
2. Designer checks **cohesion checklist** (§ Design-system alignment) → vectorizes.
3. Export 20 SVGs (or layered frame + motif) mapped to `skill-tier-badges.ts`.
4. Update [`method-detail.supplement.md`](../specs/page/method-detail.supplement.md)
   → promote sections to active spec when accepted.
5. Implement text-mask hero (code) independent of badge assets.
