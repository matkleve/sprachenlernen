# 46 · Which methods need different lengths — and level-matched news

**Status:** owner request 2026-08-20. Answers the learning-science question behind
duration packages: **which methods genuinely benefit from more than one session
length**, and **how to serve real content** (e.g. political news at the learner's
level) when articles and episodes have **arbitrary length**.

Product decision on filter vs packages: [`45-method-duration-variants.md`](45-method-duration-variants.md).
Input pipeline: [05](05-input-reading-listening.md), [17](17-own-content.md),
[39](39-material-units-and-listening-defer.md). Coverage service:
[`coverage.md`](../specs/service/coverage.md).

---

## The two questions people confuse

| Question | Owner |
| --- | --- |
| **A.** Should the menu slider size my exercise? | **No** — study/45 |
| **B.** Should some *methods* ship two different honest session shapes? | **Sometimes** — this chapter |
| **C.** Real news articles vary in length — how does that work? | **Window + selection**, not rewrite-first — below |

B and C are independent. A political podcast can be forty minutes long while the
learner's **session** is a fixed ten-minute **window** at 96 % coverage.

---

## Summary table — all fifty-three methods

**Verdict key:** **Yes (2)** = evidence supports two fixed packages · **One** =
one package only · **Cross-session** = length varies across *days*, not within one
Start · **Open** = `durations: null`

| Family / examples | Packages? | Evidence | What actually differs |
| --- | --- | --- | --- |
| **Extensive reading** | Yes (2) | **[A]** E4 input volume | Read **window** (10 vs 20 min of text at coverage) |
| **Narrow reading / listening** | One per session | **[B]** narrow input | **Series** across sessions; one window per sit |
| **Listening level 1** (no transcript) | Yes (2) | **[B]** attention + E4 | Audio **window** length; same topic chip |
| **Repeated listening** | One | **[B]** ladder is the method | Passes differ by **support**, not clock |
| **Partial / full dictation** | Yes (2) | **[A/B]** E1 retrieval volume | **N sentences** per package |
| **Dictogloss** | One | **[B]** | Fixed reconstruction ritual |
| **SRS session** | Yes (2) | **[A]** E1 + cognitive load | **Card count** (e.g. 15 vs 30) |
| **Cloze / minimal pairs / form drills** | Yes (2) | **[A]** E1 | Item batch size |
| **Build-a-sentence** | Yes (2) | **[A]** E3 production | Target-word count |
| **Free production / diary** | Yes (2) | **[B]** sustained output | **Timer** length |
| **4/3/2, shadowing rounds** | One | **[B]** choreographed | Rounds are fixed — scaling breaks it |
| **Intensive reading** | One | **[B]** | One text, deep pass |
| **Reading aloud** | Yes (2) | **[B]** | Read window |
| **Off-app** (tandem, cooking, …) | Open | **[C]** | Life-scale, not session-scale |
| **Commitments** | — | — | Not sessions |

**Rule of thumb:** if the method's effect comes from **how many retrieval attempts**
or **how long you stay in comprehensible input**, two packages can be honest.
If the effect comes from a **fixed ritual shape**, one package only.

---

## Science by mechanism

### 1 · Comprehensible input — length is time-on-text, not "harder vs easier"

**Claim:** fluency needs volume of mostly-understood input ([02](02-evidence.md) E4
**[A]** direction).

| Implication | Detail |
| --- | --- |
| Session length ≠ difficulty | Difficulty is **coverage %** on the slice, not minutes |
| Longer can help | More tokens at 95–98 % known → more incidental acquisition |
| Longer can hurt | Below ~90 % coverage, extra minutes are decoding, not intake ([05](05-input-reading-listening.md)) |
| Diminishing returns | Attention drops; 45 min intensive listening without task is **[C]** for transfer |

**Methods:** `extensive-reading`, `listening-level-1`, `narrow-listening`,
`background-listening` (off-app).

**Two packages mean:** two **window sizes** (e.g. 10 min vs 20 min of the same
topic feed) at the **same coverage band** — not "short = easy, long = hard".

### 2 · Retrieval volume — length is item count

**Claim:** learning changes through recall attempts; one item is a probe, not
practice ([02](02-evidence.md) E1 **[A]**, study/42 G3).

| Implication | Detail |
| --- | --- |
| Package = N items | Dictation sentences, cloze items, SRS cards, target words |
| Two packages | **Maintenance** (fewer items, still ≥ G3) vs **standard** (more items) |
| Clock is derived | 8 min ≈ 4 sentences × (listen + write + mark) — not free-scaled |

**Methods:** `partial-dictation`, `full-dictation`, `srs-session`, `cloze-sentences`,
`minimal-pairs`, `build-a-sentence`, form runners.

### 3 · Sustained production — length is timer block

**Claim:** free output needs uninterrupted time; interruption resets fluency
([06](06-production.md) **[B]**).

**Methods:** `free-production`, `diary-three-sentences` (fixed sentence count but
timer ceiling), `summarise-what-you-read`.

Two packages: **short block** (warm-up / tired day) vs **standard block** — same
task, different timer.

### 4 · Ritual / ladder — do not offer length packages

**Claim:** the sequence *is* the method ([23](23-how-an-exercise-runs.md)).

**Methods:** `four-three-two`, `repeated-listening` (L3→L2→L1), `dictogloss`
(listen → listen → reconstruct).

Offering "short 4/3/2" would break the method. **One package** only.

### 5 · Narrow input — length is across sessions, not inside one

**Claim:** narrow listening/reading works because **the same vocabulary recurs**
across episodes on one topic ([17](17-own-content.md) A2 **[B]**).

| Wrong | Right |
| --- | --- |
| One session that scales from 10→45 min | Many sessions, same series, **one honest window each** |
| "Long narrow listening" as one sit | Progress = **series depth** (episode 4 of the same feed) |

**Catalogue fix (target):** `narrow-listening` should move toward **one package +
series progress**, not three duration chips.

---

## Case study — "Listen to political news at your level"

*Owner example: Oma wants news about politics in the target language, matched to
what she actually knows.*

### What the learner thinks they want

> "Give me a political article at my level."

### What the product should do

```
  Topic chip (news / politics)
       ↓
  Source pool (RSS, curated fixtures, learner paste — study/17)
       ↓
  Coverage engine (lemma-held set vs tokenised text/transcript)
       ↓
  Rank: best window or article in 95–98 % band (comfortable)
       ↓
  Fixed session package (e.g. 10 min window) — study/45
       ↓
  listening-level-1 or extensive-reading runner
```

**Level ≠ CEFR label.** Level = **computed coverage for this learner on this
slice** ([05](05-input-reading-listening.md), [03](03-level-model.md)). Two "B1"
texts can be 91 % and 99 % for the same person.

### Real articles have different lengths — so what?

| Fact | Product response |
| --- | --- |
| A news article may be 800 or 4,000 words | Session never promises the **whole** article unless `full` unit + open block |
| A podcast episode may be 40 min | [`coverage.md`](../specs/service/coverage.md) **windowCoverage** — best 5–10 min slice at highest coverage ([17](17-own-content.md) A1) |
| Tomorrow's article is new | Recompute coverage; **same method, new slice** |
| Learner's holdings grew | Same article may move from demanding → comfortable |

**Session length is bounded. Content length is not.** The method consumes a
**material unit** (`sentence` · `paragraph` · `window` · `full`) — see
[39](39-material-units-and-listening-defer.md).

For news listening without transcript (`listening-level-1`):

- **Honest limit:** without a transcript we **cannot** compute coverage on audio
  alone in v1 ([17](17-own-content.md) — transcript required for calculator).
- **Paths:** (a) curated audio **with** transcript; (b) TTS from a **selected
  text window** at known coverage (**⚠ SPEC GAP:** quality bar for TTS news);
  (c) off-app with debrief only.

### Can we adapt articles on-the-fly to the user's level?

**Three tiers — in preference order** (from [17](17-own-content.md)):

| Tier | Technique | Evidence | Use for news |
| --- | --- | --- | --- |
| **1 · Select** | Pick passage/window already at 95–98 % | **[A/B]** E4 + coverage math | **Default** — no rewrite |
| **2 · Support** | Pre-teach 5–10 gap lemmas; tap gloss; elaboration beside original | **[B]** pre-teach; **[B]** elaboration (Long) | When selection alone is 92–94 % |
| **3 · Rewrite** | LLM simplification to target coverage | **[C]** mixed — comprehension up, authenticity down | **Last rung**, labelled *adapted version* |

**Not recommended as default:** "Make this Politik article A2" generic
simplification — throws away register, idioms, and syntax the learner chose news
for ([17](17-own-content.md) simplification section).

**On-the-go adaptation that *is* honest:**

- Re-run coverage after each review session → same RSS feed, different ranked window.
- Insert **support rung** when coverage is 90–94 %: pre-teach gap words, then play
  original audio/text.
- **Never** silently replace the learner's uploaded text with a rewrite.

**Locality ([`CONSTITUTION.md`](../CONSTITUTION.md) §2):** upload stays on device
until the learner explicitly opts into cloud/LLM processing.

### How two duration packages interact with news

Example `listening-level-1` + `news` topic:

| Package | Wall clock | Material | Science |
| --- | --- | --- | --- |
| **Short** | ~8 min | One **window** (~5 min audio + overhead) | Tired commute; still ≥ meaningful input |
| **Standard** | ~15 min | One longer **window** or two windows same topic | More volume at same coverage band |

Both use the **same** topic chip and coverage rules. The learner is not "turning
difficulty down" — they are taking a **smaller slice** of the same level-matched
stream.

---

## Methods that should **not** get length packages (catalogue hygiene)

| Method | Why one length |
| --- | --- |
| `repeated-listening` | Ladder passes are the method |
| `four-three-two` | Round structure is fixed |
| `dictogloss` | Two listens + reconstruct — fixed |
| `diary-three-sentences` | "Three sentences" is the definition |
| `narrow-listening` (target) | Narrowing is **series** length, not session clock |
| Off-app methods | Not timed sessions |

Candidates to **collapse** from three durations to two or one in `data/methods/`:
`narrow-listening`, `extensive-reading`, `listening-level-1`, `srs-session` —
see study/45 catalogue table.

---

## Product features derived

| # | Feature | Ev. | Verdict |
| --- | --- | --- | --- |
| F221 | **Window-first news** — rank RSS/fixtures by `windowCoverage`, not whole document | B | **V1** — coverage service |
| F222 | **Support ladder** before rewrite for sub-95 % slices | B | **V1** — study/17 rungs 1–3 |
| F223 | **Topic chips** (news, politics, daily) filter source pool | D | **V1** — shipped in catalogue |
| F224 | **Transcript required** for honest listening coverage | B | **V1** — gate in material setup |
| F225 | **Series progress** for narrow listening (not 3 duration chips) | B | **V2** |
| F226 | **Adapted version** label when rewrite rung used | C | **V2** — quality gate A5 |

---

## Open questions

- **⚠ SPEC GAP:** politics as sub-topic vs `news` chip only — taxonomy in
  `materialTopics` or learner tag on Source?
- **⚠ SPEC GAP:** licensed news feeds (Reuters, etc.) vs learner RSS — editorial
  risk and calibration dating on `coverage_history`.
- **⚠ SPEC GAP:** TTS for listening-level-1 when no studio audio — acceptable
  voice quality threshold before "news" method is honest.
- **⚠ SPEC GAP:** when whole article is &lt; 95 % but **no** window reaches 95 %,
  offer support rung vs exclude from pool — UC-059 copy.

---

## Traceability

| Doc | Action |
| --- | --- |
| This chapter | Science owner for duration packages + news-at-level |
| [`45-method-duration-variants.md`](45-method-duration-variants.md) | UX/product — filter vs packages |
| [`coverage.md`](../specs/service/coverage.md) | `windowCoverage[]` for audio/news |
| [`material-unit.md`](../specs/service/material-unit.md) | `window` unit defaults |
| [`method-material-setup.md`](../specs/feature/method-material-setup.md) | Topic chips + preview line |
| [`method-catalogue.md`](../specs/service/method-catalogue.md) | `durations` ≤ 2; collapse over-long lists |
