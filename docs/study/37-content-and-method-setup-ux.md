# 37 · Content sources, method setup, and the traceability loop — UX review

**Date:** 2026-08-17  
**Participants:** product owner (async), UX designer (this document)  
**Triggers:** content-loop spec (T-W7+) assumed learner-only sources; owner
clarified that **app catalogue texts and method-level topic/upload setup** are
first-class, not a separate product.  
**Use cases:** [UC-007](../use-cases/UC-007-read-something-at-my-level.md),
[UC-029](../use-cases/UC-029-read-a-text-i-brought.md),
[UC-030](../use-cases/UC-030-make-a-hard-text-readable.md),
[UC-034](../use-cases/UC-034-what-is-missing-for-this.md),
[UC-046](../use-cases/UC-046-discover-a-method-i-never-tried.md).  
**Normative specs (after this review):**
[`content-traceability.md`](../specs/feature/content-traceability.md),
[`method-material-setup.md`](../specs/feature/method-material-setup.md).

---

## Problem statement

Three ideas were drifting apart:

1. **The map loop** (study/19 K1–K4) — words ↔ coverage ↔ content.
2. **App-owned reading/listening material** (study/05, UC-007) — generated or
   curated texts in Methods.
3. **Learner-owned material** (study/17, UC-029/030) — upload, topic, support
   ladder.

The learner's mental model is simpler: *"I pick a method, I say what it's about
(or bring my article), then I practise."* The app must not force a fork between
"my podcasts" and "your texts" before that moment.

---

## One engine, three origins

Every exercisable piece of text or transcript is a **Source** — same coverage
math, same gap list, same word trace block:

| Origin | Example | Who adds it |
| --- | --- | --- |
| `catalogue` | *Nachrichten: Chile-Wahlen* (96 % · 4 min) | App (Methods / reading pool) |
| `fixture` | Demo text in `data/content/es.json` | Shipped seed (dev + first-run) |
| `learner` | Pasted article, uploaded PDF, RSS episode | Learner (UC-029) |

Podcast RSS is `learner` with `kind: audio` — not a fourth origin.

**Consequence [D]:** `/content` is the **library** of all Sources (catalogue +
learner). Method detail is where you **pick one for this session** — not a second
content system.

---

## Where setup lives: method detail, not a wizard

Study/26: *the learner chooses the method; the app chooses what goes inside.*
Setup is **inside** that contract — the learner steers *topic* and *bring-your-own*;
the app still picks sentences, gaps, and coverage band.

### Methods that need no setup

| Method | Why |
| --- | --- |
| SRS session (`srs-session`) | Deck is the material |
| HVPT contrast drill | Stimulus is fixed |
| Commitments | No session body |

**Start** goes straight to the runner.

### Methods that need material setup

| Method | Material shape | Setup modes |
| --- | --- | --- |
| Extensive reading | Text | catalogue · topic · learner |
| Partial dictation | Audio + transcript passage | catalogue · topic · learner |
| Intensive reading | Short text | catalogue · learner |
| Narrow reading | Series (4–6 texts, one topic) | topic (required) · catalogue series |

---

## The setup panel — recommended pattern

Placed on method detail **below the badge band**, above **Start**. Only rendered
when the method declares `materialModes` (see spec).

```
┌─────────────────────────────────────────────────────────┐
│  Partial dictation                                      │
│  … summary, badges …                                    │
├─────────────────────────────────────────────────────────┤
│  What to practise with                                  │
│                                                         │
│  ● App picks for me          ← default                  │
│    A passage at ~96% for you today                      │
│                                                         │
│  ○ About a topic                                        │
│    ┌──────────────────────────────┐                     │
│    │ climate change, B1 interviews │  ← free text       │
│    └──────────────────────────────┘                     │
│    Best match: *Ambiente · ep. 12* (93%) · or upload ↓  │
│                                                         │
│  ○ My own material                                      │
│    [ Upload file ]  [ Paste text ]  [ Paste link ]      │
│    Coverage shown after paste — before Start            │
│                                                         │
│  ☐ Keep in my library                                   │
├─────────────────────────────────────────────────────────┤
│  [ Start ]  (enabled when material resolves)            │
└─────────────────────────────────────────────────────────┘
```

### Mode behaviour (concrete)

**1. App picks (default)**  
No fields. On Start, readiness service picks catalogue Source in 95–98 % band
([study/26](../study/26-readiness-and-difficulty.md)). Copy: *"A passage at
~96% for you today"* — number from coverage, not a level label.

**2. Topic**  
Learner types e.g. *"Klimawandel, Nachrichten, B1"*. App:

1. Searches **catalogue** Sources (metadata tags + title) for best coverage fit.
2. If best is 88 % — shows it with honest label *"Still demanding — 31 words
   to comfortable"* and offers gap set (UC-034).
3. If nothing within 20 points of comfortable — shows upload affordance inline:
   *"Nothing close in the library — add your own article?"*

Topic does **not** call an LLM to invent text in v1. Generation is catalogue +
upload only ([study/10](../study/10-antipatterns.md) A5).

**3. My own material**  
Reveals intake controls (file / paste / link). Flow:

1. Parse locally where possible ([study/17](../study/17-own-content.md)).
2. Show **coverage before Start** (F30).
3. If &lt; 95 %, offer support ladder preview (UC-030) — lowest rung that reaches
   band; learner can change rung on first screen of runner.
4. Optional **Keep in library** → saves as `learner` Source on `/content`.

---

## Worked example: partial dictation + topic

**Learner:** Opens *Partial dictation* → selects *About a topic* → types
*"Spanish news, slow, environment"*.

**App:**

1. Finds catalogue audio *Radio Ambulante · clip 2* (window coverage 94 %).
2. Setup panel shows: *"6 sentences · 94 % known · ~8 min"* + link *"23 words
   to comfortable"* (opens gap list, does not block Start).
3. Start → runner: Prepare (headphones) → Do (gap sentences from **their**
   holdings) → Check → Decide (cards).

If they instead upload a `.txt` interview:

1. Coverage 78 % → panel shows demanding band + *"Pre-teach 8 words (20 s)?"*
   (rung 1 preview).
2. Start → same runner shape, different Source id.

**Same method, same runner — different Source origin.**

---

## `/content` vs method setup — not duplicate

| Surface | Job | Example |
| --- | --- | --- |
| **`/content`** | Browse everything saved; K2 rollup; gap lists; return later | *"What moved to comfortable this month?"* |
| **Method setup** | Choose material **for this session** | *"I want dictation about climate"* |
| **`/words` trace block** | Word → where it appears | *"sin embargo — in Chile text + ep. 214"* |

Choosing material on method detail **may** write to `/content` when "Keep in
library" is checked. Skipping the checkbox = session-only (ephemeral Source) —
⚠ owner decision below.

---

## Options considered

### A. Upload only on `/content`, method just picks from library

| Pros | Cons |
| --- | --- |
| One intake surface | Extra hop: upload → back to method → find file |
| Simpler method pages | Breaks "I'm on dictation, here's my article" flow |

**Verdict:** Reject as **only** path. Library-only pick is a fourth mode inside
setup (*"From my library"*) — not a replacement for inline upload.

### B. Topic field always visible on every method card in the menu

| Pros | Cons |
| --- | --- |
| Discoverable | Clutters cards; most methods don't need it |
| | Violates method-card simplicity (study/12) |

**Verdict:** Reject. Topic belongs on **detail**, not the menu card.

### C. Separate app "Content" tab vs under Methods

| Option | Verdict |
| --- | --- |
| Top-level `/content` | **Recommend** — loop visibility (K2/K3), not buried |
| Sub-tab of Methods | Hides unlock payoff |
| Only per-method | No cross-method library view |

---

## Owner decisions (resolved in this review)

| # | Question | Decision |
| --- | --- | --- |
| 1 | Route for source library | **`/content`** — top-level nav when stage 3 ships |
| 2 | Gap-set cap (UC-034) | **40 lemmas** — above that, name closest source instead of listing |
| 3 | Ephemeral session material | **Allowed** — unchecked "Keep in library" does not persist; no trace block link after session unless saved |
| 4 | Topic without catalogue match | **Upload affordance inline** — no silent LLM generation in v1 |
| 5 | App catalogue vs learner | **Same Source model** — `origin: catalogue \| fixture \| learner` |

---

## Build order (adds to words plan)

```
T-W7   coverage service (+ catalogue + fixture + learner origins)
T-W8c  /content library shell
T-W10a method material setup panel (this study → method-material-setup spec)
T-W10  reading runner (consumes resolved Source from setup or catalogue)
T-W9   learner intake persistence (setup can stub paste → session-only until then)
```

T-W10a can ship with catalogue-only + topic search stub before T-W9.

---

## What goes into specs

- [`content-traceability.md`](../specs/feature/content-traceability.md) — unified
  origins; `/content` route decided; ephemeral vs saved.
- [`method-material-setup.md`](../specs/feature/method-material-setup.md) — panel
  UX, modes, Start gating, link to coverage + support ladder.
- [`method-detail.md`](../specs/page/method-detail.md) — hosts setup section.
- [`method-catalogue.md`](../specs/service/method-catalogue.md) — optional
  `materialModes` on method entries (data only in v1).

---

## Open (not blocking T-W7)

- **Catalogue tagging schema** — how topics map to Sources (`tags[]` vs
  `series` only). Proposed: `tags: string[]` + `register: news | narrative | …`
  on catalogue JSON. Owner can defer until first 10 catalogue texts exist.
- **Ephemeral dictation on one-off paste** — still counts toward listening skill
  signal? Proposed: yes for session evidence, no for K2 history on `/content`.
