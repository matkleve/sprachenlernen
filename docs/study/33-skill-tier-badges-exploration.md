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

---

## ChatGPT image-generation prompt

Copy everything between the lines into ChatGPT (DALL·E / image gen) or similar.
Ask for **one composite image** — a 4×5 grid of badge concepts.

---

```
Create ONE composite reference image: a 4-column × 5-row grid of app badge
icons for a language-learning product. Each cell is a distinct badge design.

COLUMNS (skill class — each column has a unique art motif woven into every tier):
1. Reading — book / page / letterform motif
2. Listening — headphone / ear / sound-wave motif
3. Speaking — microphone / speech / voice motif
4. Writing — pen / ink / line motif

ROWS (contribution tier — visual quality and prestige increase top to bottom):
Row 1 (lowest): Wood — raw, matte, simple craft, muted browns
Row 2: Bronze — warm metal, basic polish
Row 3: Silver — refined metal, subtle shine
Row 4: Gold — rich metal, gem accents optional
Row 5 (highest): Platinum — highest polish, luminous, premium feel

Requirements:
- Each badge is a rounded squircle or shield suitable for mobile UI (~64–96px).
- Skill motif must remain recognizable at every tier (e.g. headphones shape
  evolves but stays identifiable in the listening column).
- Higher tiers add detail, depth, lighting, and material quality — not just a
  color swap.
- Style: modern, calm, editorial — NOT cartoon game rank icons, NOT military
  medals, NOT emoji. Think premium fintech or craft-app quality.
- Palette: restrained; skill columns may have subtle hue families (reading =
  warm paper, listening = cool teal, speaking = coral, writing = slate).
- No text, no numbers, no letters inside badges.
- Consistent lighting direction across all 20 cells.
- White or very light neutral background; thin gutters between cells.
- Label each row and column OUTSIDE the badge art with tiny captions only
  (Wood, Bronze, Silver, Gold, Platinum; Reading, Listening, Speaking, Writing).

Deliverable: one clean mood-board grid a product designer can pick from before
vectorizing winners.
```

---

## Relationship to existing specs

| Doc | Current rule | This exploration |
| --- | --- | --- |
| [27-method-badges.md](27-method-badges.md) | 3 contribution levels; no metal words in UI | 5 tiers with wood→platinum names — **owner override pending** |
| [method-badge.md](../specs/component/method-badge.md) | Lucide icon marks on cards only | Detail may add tier badges; cards unchanged until assets exist |
| [method-detail.md](../specs/page/method-detail.md) | No badge row on detail | Proposes badge band under hero title |
| [GLOSSARY.md](../GLOSSARY.md) | primary / secondary / slight | May add tier names as display layer over same data |

**Before implementation:** owner picks grid winners, confirms 5-tier mapping, and
explicitly revises study/27 § "Do not use copper, silver, gold" or documents
wood→platinum as the approved display vocabulary.

---

## Open questions

1. Show **all four** skill columns on every method (dimmed wood for inactive
   skills) or **only skills with tier ≥ bronze**?
2. Platinum: catalogue field or derived only for `primary` + demanding methods?
3. Do tier badges appear on **cards** eventually, or detail-only forever?
4. Asset pipeline: one SVG set with tier variants, or raster webp per badge?

---

## Next steps

1. Owner runs ChatGPT prompt → picks 1–2 directions per skill column.
2. Designer vectorizes winners against design tokens (`text-skill-*` hues).
3. Update [`method-detail.supplement.md`](../specs/page/method-detail.supplement.md)
   → promote sections to active spec when accepted.
4. Implement text-mask hero (code) independent of badge assets.
