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
5. **Image exploration** — generate a reference grid (4 skills × 5 tiers) via
   ChatGPT before committing to assets or code.

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

---

## ChatGPT image-generation prompt

Copy everything between the lines into ChatGPT (DALL·E / image gen) or similar.
Ask for **one composite image** — a 4×5 grid of badge concepts.

**v2 prompt** (use this if v1 shields did not change enough between tiers):

---

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

1. Owner re-runs **v2 ChatGPT prompt** above → confirms shields change per row.
2. Designer vectorizes winners against design tokens (`text-skill-*` hues).
3. Update [`method-detail.supplement.md`](../specs/page/method-detail.supplement.md)
   → promote sections to active spec when accepted.
4. Implement text-mask hero (code) independent of badge assets.
