# 52 · Register mix ratio — owner calibration (not 15/15, not sprinkle)

**Status:** study only — calibrates [51](51-register-path-and-interest-topics.md).  
**Owner correction (2026-08-20, late):** Study 51 over-corrected to **15/15 Business
cards** — that is **also wrong**. Owner wants:

- Register **is** the difference between Business English and Technical English
  — not a cosmetic sprinkle, not a full session of domain cards.
- **Basics still dominate** each session (frequency spine).
- **~2–3 register words per 15-card set** (~10–20 %) — owner said *"2–3 pro Set
  oder so, 10 Prozent reichen vielleicht"*.
- **No 60-day decay** — register choice stays until the user changes it.
- **Not** 15 fucking Business cards.

This chapter locks the **composition rule** and withdraws study 51 §R4a “session 1
= all Business.”

---

## M0 · Three things people confuse

| Concept | What it is | Session 1 example (Business) |
| --- | --- | --- |
| **A · Spine** | General high-frequency basics everyone needs | *ser, estar, de, que, tengo, …* — **most cards** |
| **B · Register slice** | Ordered domain lemmas you **progress through** over weeks | *reunión, agenda, cliente* — **2–3 cards this session** |
| **C · Register surface** | Sentences, news, prompts, examples | **Business tone everywhere** even when the lemma is basic |

Owner anger at study 49 was about **C missing** (felt like nothing changed).  
Owner anger at study 51 was about **B too high** (15/15).  

**The product is A-heavy cards + B-small slice + C-always register.**

---

## M1 · The composition rule (normative draft)

For a **15-card** session with register ≠ general:

| Slot | Count | Source |
| --- | --- | --- |
| **Due / resurfacing** | whatever FSRS + sampling assigns | unchanged |
| **Register new** | **`min(3, max(2, round(sessionLength × 0.13)))`** → **2–3** for n=15 | Next lemmas from `registerPath` cursor |
| **Spine new** | fill remainder up to session cap | Global frequency order (today’s starter logic) |

**~13–20 %** register new cards when the session introduces new lemmas — aligns
with owner *"2–3 pro Set"* and *"~10 %"* (10 % of 15 ≈ 1.5 → we round **up** to 2
minimum so register is **visible every session**).

### Worked example — Business, session 1, 15 cards

Assume 0 due (day 1):

| # | Lemma | Track |
| --- | --- | --- |
| 1–12 | *yo, ser, tener, de, que, …* | **Spine** (ranks 1–12) |
| 13 | *reunión* | **Register** (Business path rank 1) |
| 14 | *agenda* | **Register** (rank 2) |
| 15 | *cliente* | **Register** (rank 3) |

**Not** 15 Business. **Not** 1 Business + 14 spine if we can fit 3.

### Example sentence on **every** card (register surface C)

Even spine card *tengo*:

> *Tengo la agenda para la reunión.* (Business)  
> vs *Tengo hambre.* (Alltag)

Same lemma, **register-shaped context** — this is where “Business English vs
Technical” **feels** real without 15 domain lemmas.

---

## M2 · What persists forever (no decay)

| | Study 49 (withdrawn) | Study 51 (withdrawn) | **Study 52 (owner)** |
| --- | --- | --- | --- |
| Register boost | 1.25× fade over 60 days | 100 % session | **2–3 cards/session + C on all examples** |
| Register path cursor | — | whole session | **advances 2–3 lemmas per session** |
| News / interests filter | — | always | **always** while choice active |
| User changes register | — | profile | profile — **held lemmas kept** |

**Delete** `boostDecay`, `maxBoostedPerSession` as separate knobs — one rule:
**registerNewPerSession = 2–3** (scale with session length if not always 15).

---

## M3 · Why not 10 % only (1 card)?

Owner said *"10 Prozent reichen vielleicht"*. At 15 cards:

- 10 % → 1.5 → **one** register card per session  
- Risk: every second session **feels** like study 49 sprinkle again  

**Recommendation:** **floor 2, cap 3** for n=15 (~13–20 %). If owner prefers
strict 10 %, floor becomes 1 — document as ⚠ SPEC GAP until A/B.

Panel split:

| | 10 % strict (1–2) | **2–3 floor (13–20 %)** |
| --- | --- | --- |
| Owner quote | *"10 Prozent reichen vielleicht"* | *"2–3 pro Set"* |
| Feel | Minimal | **Visible every session** |
| **Pick** | — | **2–3** — owner said both; stronger phrase was *"2–3 pro Set"* |

---

## M4 · Register path still exists — it is just ** paced**

Study 51 was right that register is a **curriculum**, not a tag. Study 52 fixes
**throughput**:

- Business path might have **300 lemmas** total  
- At **2.5/session** → ~120 sessions to exhaust **new** introductions  
- Spine runs in parallel — learner reaches 2000 general lemmas **and** 300
  business lemmas over months  

**Progress UI (example):** *Business: 47 / 300 · heute +3 · Basics: 812
  held*

That communicates **"I am learning Business English"** without 15/15 cards.

---

## M5 · Interest topics (unchanged from 51)

Interests still drive **news, articles, example sentences** (surface C + reading).
Independent of the 2–3 card count.

---

## M6 · Revised onboarding preview copy

**Wrong (51):** *"Deine ersten Wörter: reunión, agenda, … (15 Karten Business)"*

**Right (52):**

```
Business · Sport + Wirtschaft

Du lernst die normalen Basics — und ab heute
2–3 Business-Wörter pro Session.
Sätze & Artikel: Büro, News zu Sport & Wirtschaft.
```

---

## M7 · Supersession

| Chapter | Withdraw |
| --- | --- |
| [51](51-register-path-and-interest-topics.md) §R4a table “Session 1 = ranks 1–15 within Business” | **Yes** |
| [51](51-register-path-and-interest-topics.md) §R3 page 4 “alle reunión, agenda…” | **Reword** per M6 |
| [49](49-learner-intent-onboarding.md) 60-day decay §I3b | **Yes — already hated** |
| [51](51-register-path-and-interest-topics.md) interest topics, register path data model, news filter | **Stands** |

---

## M8 · One-sentence product rule

> **Most cards teach basics; 2–3 teach your register; every sentence sounds
> like your register; news matches your interests — forever until you change it.**

---

## Sources

| | Claim | Grade |
| --- | --- | --- |
| ⬤ | ESP = domain path + general foundation in parallel | [B] — [51](51-register-path-and-interest-topics.md) §R1b |
| ⬤ | Owner calibration 2–3/session, no decay, not 15/15 | [D] — 2026-08-20 |
| ◐ | ~10–20 % domain exposure per unit visible to learners | [C] — product calibration, not one paper |
