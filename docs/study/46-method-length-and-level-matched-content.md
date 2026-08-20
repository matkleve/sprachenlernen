# 46 · Which methods need different lengths — and level-matched content

**Status:** study draft; **owner corrections 2026-08-20** in § Owner decisions
below supersede § Case study and § Adaptation where they conflict.

Product UX (filter vs packages): [`45-method-duration-variants.md`](45-method-duration-variants.md).
Five evaluated user stories: [`../IDEAS.md`](../IDEAS.md) § 2026-08-20.
Input pipeline: [05](05-input-reading-listening.md), [17](17-own-content.md).

---

## Owner decisions (2026-08-20) — normative

These override earlier drafts in this chapter and parts of study/17.

| Topic | Decision | Spec / UC |
| --- | --- | --- |
| **SRS / card review** | **Fixed 15 cards** every session — no duration packages, no menu scaling | `srs-session` `durations: [15]`; [`method-session-budget.md`](../specs/service/method-session-budget.md) |
| **Reading articles** | **Full text** — never truncate to a time window so the learner can "continue reading" outside the session; session = the whole article | [`material-unit.md`](../specs/service/material-unit.md); UC-007 |
| **News / topic content** | **Level-targeted adaptation** is the right default — e.g. *"make this politics article A2"* — not window-mining from a 40 min podcast | UC-030 (revised); [`IDEAS.md`](../IDEAS.md) |
| **"Topic on the fly"** | **Rejected label** — means picking a RSS slice at compose time; product uses **topic chip + target level** instead | This section |

**Menu time filter** still applies: show articles whose **estimated full read time**
≤ filter. It does not cut the article.

---

## The two questions people confuse

| Question | Owner |
| --- | --- |
| **A.** Should the menu slider size my exercise? | **No** — study/45 |
| **B.** Should some *methods* ship two fixed packages? | **Sometimes** — retrieval loops & timed production only; **not SRS** |
| **C.** How do real articles fit? | **Full article** + estimated read time for filter; **adapt level** for news |

---

## Summary table — duration packages (revised)

| Family / examples | Packages? | Notes |
| --- | --- | --- |
| **`srs-session`** | **One (15 cards)** | Owner 2026-08-20 — predictability over flexibility |
| Extensive reading | **One** per article | Whole `body`; filter by read-time estimate |
| Listening (news audio) | Up to **two** | Audio may still use **window** when no article boundary — see open |
| Partial / full dictation | Yes (2) | Sentence **count** packages |
| Build-a-sentence, cloze, form | Yes (2) | Item batch |
| Free production | Yes (2) | Timer |
| Ritual (4/3/2, repeated listening) | One | Fixed shape |
| Narrow listening | One per session | Series depth across **days** |

---

## Science by mechanism (unchanged core)

### Input — full text vs window

**Reading:** extensive reading evidence (E4) is **time on connected text at
coverage** — not artificial mid-article stops. Truncating a news article to fit
a 10 min box trains **abandonment** (learner hits "continue" outside the method)
and breaks UC-007's promise of connected discourse.

**Filter:** `estimatedReadMinutes(full body) <= menu filter` — article absent
if too long for the window, not shortened to fit.

**Listening:** without a natural article boundary, a **transcript window** may
still be used for one session — but that is **one prepared unit**, not
"read more after done". Open: TTS from adapted **full** text for news.

### Retrieval — fixed SRS

FSRS benefits from regular short sessions ([04](04-flashcards-srs.md)). **Fifteen
cards** is a fixed contract (UC-039): ~9 min at typical pace, always stated before
Start. Variable card count added menu complexity without evidence gain for this
product's audience (owner 2026-08-20).

### Level adaptation for topics — owner position

UC-030 originally ranked **rewrite last** on a support ladder (study/17). Owner
review 2026-08-20: for **catalogue topic content** (news, politics, daily life),
**target-level adaptation** (*"this politics piece at A2"*) is the **primary**
path — high usefulness and enthusiasm; label as adapted; report errors (UC-023).

Tradeoffs (honest):

| Pro | Con |
| --- | --- |
| Learner reads what they care about **today** | May learn simplified register, not front-page idiom |
| Matches mental model ("news at my level") | LLM quality obligation ([10](10-antipatterns.md) A5) |
| Beats struggling at 75 % coverage on raw feed | Must not count as same signal as authentic extensive reading |

**Not** "topic on the fly": that meant algorithmically slicing a long podcast at
session start. Replaced by: **topic tag** on Source + **adapt to learner target
band** at publish or on demand.

---

## Case study — politics news at my level (revised)

```
  Topic chip (news / politics)
       ↓
  Source pool OR fetch headline
       ↓
  Adapt to learner target level (e.g. A2) — labelled "adapted for you"
       ↓
  Coverage check on adapted text (should land 95–98 %)
       ↓
  Full article in session — estimated read time on card
       ↓
  extensive-reading or listening-level-1
```

Learner-uploaded originals: UC-029 + optional adaptation with explicit consent
([`CONSTITUTION.md`](../CONSTITUTION.md) §2).

---

## Traceability

| Doc | Action |
| --- | --- |
| [`method-session-budget.md`](../specs/service/method-session-budget.md) | SRS fixed 15 |
| [`material-unit.md`](../specs/service/material-unit.md) | Reading = `full` default |
| UC-030 | Level adaptation primary for topics |
| [`IDEAS.md`](../IDEAS.md) | Five evaluated user stories |

## Open

- **⚠ SPEC GAP:** target level from — CEFR self-report, skill tier, or coverage band only?
- **⚠ SPEC GAP:** adapted article persistence — one adapted version per learner per source?
