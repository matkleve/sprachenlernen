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
| Extensive reading | Text | app-pick + topic chips + own |
| Partial dictation | Audio + transcript passage | app-pick + topic chips + own |
| Intensive reading | Short text | app-pick + own (fewer topic chips) |
| Narrow reading | Series (4–6 texts, one topic) | one topic chip required + own |

---

## The setup panel — recommended pattern

Placed on method detail **below the badge band**, above **Start**. Only rendered
when the method declares `materialTopics` (see spec). The learner **selects**
from topics the method can use — not a free-text search box. **Own material** is
the **last chip** in the same row; upload appears only when that chip is selected.

**Owner correction 2026-08-17:** not *type a topic → upload appears*; but
*pick a topic from the list, or pick **Your own** → then upload*.

```
┌─────────────────────────────────────────────────────────┐
│  Partial dictation                                      │
│  … summary, badges …                                    │
├─────────────────────────────────────────────────────────┤
│  Topic                                                  │
│                                                         │
│  [ App picks ] [ News ] [ Daily life ] [ Environment ]  │
│  [ Your own ▾ ]                                         │
│       ↑ selected                                        │
│    ┌──────────────────────────────────────────────┐   │
│    │  [ Upload file ]  [ Paste text ]  [ Link ]     │   │
│    └──────────────────────────────────────────────┘   │
│                                                         │
│  Preview (when a catalogue topic is selected):          │
│    *Ambiente · ep. 12* — 94 % known · ~8 min            │
│                                                         │
│  ☐ Keep in my library          (only for Your own)      │
├─────────────────────────────────────────────────────────┤
│  [ Start ]                                              │
└─────────────────────────────────────────────────────────┘
```

### Selection behaviour (concrete)

**1. App picks (first chip, default)**  
No extra fields. On Start, readiness picks catalogue Source in 95–98 % band
([study/26](../study/26-readiness-and-difficulty.md)). Preview after selection:
*"A passage at ~96% for you today"*.

**2. A catalogue topic chip** (e.g. *News*, *Environment*)  
Learner taps one chip. App:

1. Filters catalogue Sources tagged for that topic on this method.
2. Picks best coverage fit for this learner; shows preview line (title, %, time).
3. If best is 88 % — honest label *"Still demanding — 31 words to comfortable"*
   (gap link, does not block Start).
4. If **no** catalogue item exists for that topic — chip shows disabled state or
   inline *"Nothing in the library yet for this topic"* — learner may switch to
   **Your own**. No LLM generation ([study/10](../study/10-antipatterns.md) A5).

**3. Your own (last chip)**  
Upload / paste / link controls **appear only here** — not under other topics.

1. Parse locally where possible ([study/17](../study/17-own-content.md)).
2. Show **coverage before Start** (F30).
3. If &lt; 95 %, support-ladder preview (UC-030).
4. Optional **Keep in library** → `learner` Source on `/content`.

**Rejected:** free-text topic field as primary control — discoverability comes
from the chip list the method declares, not from guessing keywords.

---

## Worked example: partial dictation + topic chip

**Learner:** Opens *Partial dictation* → taps chip **Environment**.

**App:**

1. Finds catalogue audio *Radio Ambulante · clip 2* tagged `environment` (window
   coverage 94 %).
2. Preview: *"6 sentences · 94 % known · ~8 min"* + link *"23 words to
   comfortable"*.
3. Start → `/practice`: Prepare → Do → Wait → Submit → Review → Decide.

If they tap **Your own** instead and upload a `.txt` interview:

1. Upload area appears; coverage 78 % → demanding band + ladder preview.
2. Start → same runner, `learner` Source.

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
| 4 | Topic without catalogue match | Chip disabled or empty-state copy — switch to **Your own**; no LLM |
| 5 | App catalogue vs learner | **Same Source model** — `origin: catalogue \| fixture \| learner` |
| 6 | Topic input shape | **Selectable chips** — `App picks` + method topics + `Your own`; no free-text topic field in v1 |

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
- [`material-unit.md`](../specs/service/material-unit.md) — session slice sizes;
  see also [`39-material-units-and-listening-defer.md`](39-material-units-and-listening-defer.md).
- [`listening-defer.md`](../specs/feature/listening-defer.md) — can't listen now.
- [`method-detail.md`](../specs/page/method-detail.md) — hosts setup section.
- [`method-catalogue.md`](../specs/service/method-catalogue.md) — optional
  `materialTopics` on method entries (chip ids + labels; see spec).

---

## Open (not blocking T-W7)

- **Catalogue tagging schema** — how topics map to Sources (`tags[]` vs
  `series` only). Proposed: `tags: string[]` + `register: news | narrative | …`
  on catalogue JSON. Owner can defer until first 10 catalogue texts exist.
- **Ephemeral dictation on one-off paste** — still counts toward listening skill
  signal? Proposed: yes for session evidence, no for K2 history on `/content`.
