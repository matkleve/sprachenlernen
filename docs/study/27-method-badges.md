# 27 · Method badges — what to show at a glance

A UX study for making method cards and detail pages scannable without turning
the catalogue into a leaderboard. Written 2026-08-15 after a design review of
the methods surfaces and owner brainstorming about copper / silver / gold badges
and skill-specific marks.

This chapter is **not a spec**. It recommends three **separate** badge families,
the science behind each, what **not** to build, and what catalogue data is needed.
Implementation contracts live in [`../specs/component/method-badge.md`](../specs/component/method-badge.md)
and the updated page specs.

---

## The problem

Today a method card is a title, a grey summary, and a flat row of identical
pills. On the detail page, evidence and intensity are long sentences **inside**
pills — they wrap to two lines and the full pill radius makes the text fight the
curve. The shell title truncates long names ("Background listening wit…") while
the body never repeats the name.

Browsing sixty methods, the learner cannot answer three questions in under two
seconds per card:

1. **What is this mainly for?** (skill)
2. **How sure is anyone that it works?** (evidence)
3. **Can I manage it right now?** (effort / intensity)

Those three questions are **orthogonal**. Collapsing them into one metal tier
(gold = good, copper = bad) would violate the product's honesty rules and the
research on what learners do with rank cues.

---

## What the owner asked for

- Copper / silver / gold (or similar) to show what a method is **good for**
- Skill-specific badges (writing, listening, speaking, reading)
- Visible on **cards immediately** and on the **detail page**
- "Three types" — interpreted here as **three badge families**, not one
  three-level score

---

## What the science says

### 1. Preference ≠ effect (do not net them)

Kornell & Bjork: learners rate blocked practice as more effective after testing
showed interleaving worked better. Ease during practice is read as learning
([12](12-method-cards.md), thesis 6).

**Implication:** a badge that reads "gold" on a method will be interpreted as
"this works well **for me**" even when it only means "well evidenced" or
"primary for listening". Three families, never one composite medal.

### 2. Informational, not controlling (SDT)

Self-determination theory ([08](08-motivation.md), E7): displays that say
"here is where you stand" support motivation; displays that say "do this or you
lose" undermine it. Gamification meta-analyses show small lifts in motivation,
**minimal impact on competence**.

**Implication:** badges describe facts about the **method**, not the learner's
rank, streak, or completion. No "you unlocked gold methods". No badge counts on
the tab bar ([UC-063](../use-cases/UC-063-get-to-my-cards-without-the-menu.md)).

### 3. Herding from social proof

Mogavi et al. (2022): showing how others rate methods produces herding.
[12](12-method-cards.md) deliberately omits thumbs percentages on cards.

**Implication:** no "most popular", no community tier, no metal that implies
"others chose this".

### 4. Evidence labels help — partly

E13 ([02](02-evidence.md)): teaching learners *how* methods work helps; showing
evidence corrects misjudgement only partly. The info page is still right because
the alternative is "trust us" ([12](12-method-cards.md)).

**Implication:** evidence must stay **visible and legible** on cards as a plain
label (e.g. "Thin evidence"), not a letter grade. Detail page carries the graded
sentence; the card carries the meaning.

### 5. Pre-attentive scanning at catalogue scale

With ~53 methods, visual search benefits from **consistent position and shape**
per meaning ([22](22-visual-design.md) — constraints, not decoration). Gestalt
grouping: skill marks in one zone, evidence in another, effort in a third.

**Implication:** same three-zone layout on card and detail; do not scatter badges
in the chip row.

### 6. No single score ranking

[UC-046](../use-cases/UC-046-discover-a-method-i-never-tried.md) explicitly excludes
ranking methods by one number. Weak methods stay in, labelled weak
([21](21-method-catalogue-and-context.md) — background listening: "barely any
yield").

**Implication:** copper/silver/gold must **not** mean "method quality" globally.
If metals are used at all, they apply only to **contribution within one skill**
(see below) — and background listening would correctly show **slight** listening
contribution, not a shame badge on the whole card.

### 7. Opaque tiers need a reason visible

[UC-036](../use-cases/UC-036-know-how-much-to-trust-this-language.md): language
quality tier is derived and explained — not a mystery badge.

**Implication:** every badge type has a tap/long-press or detail expansion that
states what it means in one line. Metals or colors never stand alone without a
text label for accessibility.

---

## Recommendation: three badge families

| Family | Answers | Card | Detail | Data today |
| --- | --- | --- | --- | --- |
| **Skill contribution** | What is this mainly for? | Up to four skill marks with contribution level | Same + one line from `trains` | `skills[]`, `section`, `trains` (v1 derived); `skillContribution` (v2 explicit) |
| **Evidence grade** | How sure is the research? | Plain label (e.g. "Thin evidence") | Collapsed disclosure with plain prose | `evidence` |
| **Effort load** | Can I manage this now? | Plain label (e.g. "Light effort") | Practical section sentence | `intensity` |

**Not badges** (stay as nowrap **tag chips**): duration, requirements, hosted/off-app.

### Skill contribution — the owner's metal idea, scoped safely

Use **contribution level per skill**, not one metal for the whole method:

| Level | Meaning | Suggested UI | Internal alias (not shown in UI) |
| --- | --- | --- | --- |
| **Primary** | Main reason to do this method | Filled skill mark | — |
| **Secondary** | Clear side benefit | Half-filled or outlined mark | — |
| **Slight** | Minor or contested benefit | Dim mark + "slight" on detail only | maps to study/21 "C, weak" cases |
| **None** | Not shown | — | — |

**Do not use the words copper, silver, gold in the UI.** They read as global
quality. Use **skill-colored marks** (token-based) with fill level. If design
needs a mnemonic, metals are documentation-only for contribution level.

Skills are exactly four ([`GLOSSARY.md`](../GLOSSARY.md)): reading, listening,
speaking, writing. A method may show one to four marks; order is reading →
listening → speaking → writing for consistency.

**v1 derivation (no schema change yet):**

1. Map `section` → default primary skill (listening section → listening primary).
2. Each entry in `skills[]` not already primary → secondary.
3. If `trains` matches weak patterns (`very little`, `barely`, `honestly:`) →
   downgrade that skill to **slight** for display.
4. Form / vocabulary / world / commitments sections use `skills[]` only; if empty,
   show section label without skill marks until data is enriched.

**v2 (catalogue enrichment):** optional `skillContribution` object per method,
authored explicitly. Validator requires consistency with `skills[]`.

### Evidence grade — plain words on cards

| Grade | Card label | Detail (disclosure) |
| --- | --- | --- |
| A | Strong evidence | Plain prose from `evidenceProse` |
| B | Solid evidence | Same |
| C | Thin evidence | Same |
| D | Not researched | Same |

Card: plain label only — no "Evidence A" or bare letter. Detail: label + prose in
a collapsed disclosure — no letter-grade prefix.

### Effort load — plain words on cards

| Intensity | Card label | Detail |
| --- | --- | --- |
| 1 | Light effort | Practical section: label + anchor sentence |
| 2 | Needs focus | Same |
| 3 | Draining | Same |

No dot scales — they read as ratings without a legend.

---

## Layout — card and detail

### Method card (compact)

```
┌──────────────────────────────────────┐
│ ░░ section graphic (h-20) ░░░░░░░░░░ │  ← one asset per section; gradient fade
│ LISTENING                             │  ← section label on overlay
├──────────────────────────────────────┤
│  Background listening with no task     │
│  Leave it playing while you do…      │
│                                      │
│  [🎧] [📖]  Thin evidence  Light effort   │  ← badge row (icons + plain labels)
│                                      │
│  [20 min] [45 min] [headphones] …    │  ← tag chips (nowrap)
│                                      │
│  What it does not do: Honestly…      │
└──────────────────────────────────────┘
```

- **No left accent border** — uniform `rounded-card` border only (owner: stripe
  clashed with corner radius). Soft section background tint on the card shell.
- Header graphic: decorative; section label on overlay; eight shared assets.
- Badge row: fixed order, Lucide skill icons; `sr-only` summary inside card link.
- Tag chips: wrap; **never** multi-line pills (see chip spec).

### Method detail (article)

```
LISTENING
Background listening with no task        ← hero title (full name)
Leave it playing while you do something else

Practical
Light effort — can be done tired or distracted
Takes     20 min · 45 min
Needs     speaker · headphones
Runs      Off-app

Trains …
Mainly    Listening (slight)             ← optional when skill marks exist

┌ What it does not do ─────────────────┐  ← single callout surface
│ Honestly: barely anything.            │
└──────────────────────────────────────┘

▸ How sure is the research?             ← collapsed disclosure
  Thin evidence — plausible and widespread, but thinly evidenced
```

- **No badge row** — badges are catalogue-only; detail does not repeat them.
- **No raised "At a glance" panel** — flat sections on canvas.
- Research confidence: disclosure at bottom; plain label + `evidenceProse` — no
  "Evidence C" prefix.

Shell title may shorten on mobile; **in-page hero** always shows full `name`.

---

## Alternatives considered and rejected

| Idea | Why rejected |
| --- | --- |
| One gold/silver/copper per method | Single score; punishes weak-but-honest entries; violates UC-046 |
| Stars or numeric scores | Same; implies precision we do not have |
| Thumbs-up % on cards | Herding (Mogavi); conflates preference with effect |
| Badge per section (Reading, Listening…) | Section ≠ skill (form, vocabulary, world); learner thinks in four skills |
| Only detail badges, plain cards | Owner requirement: see value immediately in list |
| Emoji medals | Inconsistent across platforms; not token-governed |

---

## Relationship to readiness and effect

- **Readiness** (UC-057): separate state — ready / better later / no material.
  Not a badge family; when spec'd, a single line under the badge row.
- **Per-learner effect** (study/12): future "For you" line on cards when data
  exists. Never merged with evidence grade or skill contribution.

---

## What goes into specs

- Component: [`method-badge.md`](../specs/component/method-badge.md) — three
  families, geometry, tokens, a11y.
- Component: [`method-card-header.md`](../specs/component/method-card-header.md)
  — section graphics, gradient, label.
- Pages: [`method-menu.md`](../specs/page/method-menu.md),
  [`method-detail.md`](../specs/page/method-detail.md) — placement, hero title,
  chip vs badge split.
- Service (v2): `skillContribution` field on `MethodEntry` in
  [`method-catalogue.md`](../specs/service/method-catalogue.md).
- Implementation: **T-B10c** in [`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md).

---

## Open questions for the owner

1. ~~**Skill mark visual:** abstract shapes (R/L/S/W) vs icons~~ — **resolved:**
   Lucide icons shipped 2026-08-15.
2. **v1 derivation vs wait for v2 data:** shipping derived marks risks wrong
   primary on edge cases (e.g. reading aloud → speaking + reading). Prefer v2
   authoring for ~10 borderline methods, or ship v1 with known limitations
   documented?
3. ~~**Section tinting:** optional accent band per section~~ — **resolved:**
   soft section background + header graphic; no left accent stripe.
