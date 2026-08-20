# 55 · Situations vs tags — not Duolingo units; switching register

**Status:** study only — resolves owner concern about **Situation** in
[53](53-business-teacher-situational-model.md) and **situationUnit** in
[54](54-context-tags-methods-and-words.md).

**Owner question (2026-08-20):** *Is “Situation” just course modules again
(Kursabschnitte)? Does that make language-learning sense? Is it Duolingo? What
happens if I switch mid-way to Garten/Natur?*

---

## S0 · Short answers

| Question | Answer |
| --- | --- |
| Is Situation = Kursabschnitt? | **Only if we show it in the UI** — that we should **not** |
| Language-learning sense? | Situations help **organize material** (ESP) — learners don't need a **unit counter** |
| Like Duolingo? | **Duolingo path = yes, bad fit for us** ([01](01-duolingo.md) D2). **Tags = no** |
| Switch to Garten/Natur mid-way? | **Nothing lost.** Weights change **immediately**; FSRS keeps all held words |
| What to ship? | **Register + topic tags + weights** ([54](54-context-tags-methods-and-words.md)). Situations = **hidden metadata**, not “Einheit 2/6” |

---

## S1 · Three layers — do not collapse them

| Layer | Example | Learner sees? | Drives |
| --- | --- | --- | --- |
| **Register** | Business · Alltag · Technik | Yes — onboarding + profile | Sentence tone, word bias, method prompts |
| **Topic** | Politik · Natur · Garten · Sport | Yes — chips | **Which articles/stories** |
| **Situation** | meetings · email · phone | **No in v1** | Backend tag on sentences/chunks only |

**Garten / Natur is a topic**, not a register — unless the learner picks **Alltag**
register *and* `topic:nature`. Business + Garten would mean e.g. garden-center
trade, landscaping contracts — odd but valid tags.

---

## S2 · Duolingo vs us — honest comparison

| | Duolingo | This app (thesis) |
| --- | --- | --- |
| **Spine** | Linear **unit tree** — you advance sections | **FSRS** — each word has its own schedule |
| **Why word now** | Path algorithm + heuristics | **Retrievability** + weights (explainable) |
| **Personalization** | Motivation quiz → mostly same tree | Register/topic **weights** on same pool |
| **Progress UI** | “Unit 3, Lesson 4” | Level model + held count — **not** “course %” ([10](10-antipatterns.md) A4) |
| **Switch goal** | Awkward — tree is fixed | Change profile → **weights flip**, no reset |

[01](01-duolingo.md) **D2:** Duolingo’s plan is a **path**, not a memory model — our
**central difference** is glass-walled FSRS ([04](04-flashcards-srs.md)).

> **If we show “Meetings 2/6” we rebuilt Duolingo’s weakness**, not the Business
> teacher’s invisible lesson plan.

### What ESP “situations” actually are for teachers

A Business teacher plans *this week: emails* — but the **student** experiences
exercises and texts, not “Module 2 unlocked.” Situations are **authoring
structure**, not **navigation chrome**.

**Decision [D]:** `situation:meetings` tags content. **No** situation progress
bar. **No** locked units. Optional profile line later: *“Recently: email phrases”*
— not a tree.

---

## S3 · What we ship instead of situation units

From [54](54-context-tags-methods-and-words.md) only:

1. **Register** on profile  
2. **Topics** on profile (Politik, Natur, …)  
3. **Weighted pick** for words, sentences, Sources, prompts  
4. **Methods** unchanged in shape — tags passed in  

Study 53 **situation syllabus** demoted to **content tagging guide** for whoever
writes sentence banks — not a learner-facing course.

---

## S4 · Switching mid-way — step by step

**Scenario:** 3 months **Business** + topics `{economy, politics}` → switch to
**Alltag** register + `{nature, garden}` (Garten/Natur).

### What stays

| Asset | Fate |
| --- | --- |
| All **held** lemmas (*reunión, cliente, …*) | **Stay held** — FSRS `due` unchanged |
| Level / snapshot | **Unchanged** — honesty rule ([03](03-level-model.md)) |
| Review **due** today | **Still appear** — schedule is schedule |

### What changes **immediately** (next session)

| Surface | Before | After |
| --- | --- | --- |
| Example sentences | Business-toned | **Alltag / nature**-toned (weighted) |
| New introductions | Business-biased | **Nature/garden**-biased + basics |
| Reading default | Economy/politics news | **Nature** articles (if in catalogue) |
| Build-a-sentence prompt | Meeting follow-up | e.g. *describe your garden* |
| Tag weights | `register:business` 3× | `register:everyday` 3×, `topic:nature` 2.5× |

### What does **not** happen

- No course reset  
- No “start Unit 1 again”  
- No deletion of business vocabulary  
- No punishment / streak loss ([08](08-motivation.md))  
- Business words **fade from new picks**, not from **reviews** — *cliente* still
  reviews when due; just fewer **new** business lemmas until you switch back  

### Copy on switch (profile)

```
Register: Alltag · Themen: Natur, Garten

Ab der nächsten Session: mehr Alltags- und Naturtexte.
Deine bisherigen Wörter — auch Business — bleiben im Stapel.
```

---

## S5 · Register vs topic switch — two cases

| Change | Example | Effect |
| --- | --- | --- |
| **Topic only** | Business stays, add **Garten** | Same business tone; **articles** about parks, green cities, etc. |
| **Register only** | Business → Alltag, keep Politik | Less office vocab **new**; politics in **everyday** register |
| **Both** | Business → Alltag + Natur | Full pivot — strongest content shift, same FSRS memory |

---

## S6 · Revised stack (owner-aligned)

```
Onboarding: Register + Topics (popover)
       ↓
Profile: editable anytime
       ↓
LearnerContext → tag weights → Words + Methods
       ↓
FSRS: independent memory for every lemma
```

**Withdraw from learner UX:** situation units, unit counters, course %, decay.

**Keep as invisible:** `situation:*` on sentence bank rows for authors.

---

## S7 · Supersession

| Doc | Change |
| --- | --- |
| [53](53-business-teacher-situational-model.md) | §T2 progress UI “Meetings 4/6” — **withdrawn** |
| [54](54-context-tags-methods-and-words.md) | `situationUnit` on profile — **optional author tag only**, not progression |
| [52](52-register-mix-ratio-calibration.md) | already superseded |

---

## Sources

| | Claim | Grade |
| --- | --- | --- |
| ⬤ | Duolingo path ≠ explainable memory model | [A] — [01](01-duolingo.md) D2 |
| ⬤ | Single course % bar is anti-pattern | [D] — [10](10-antipatterns.md) A4 |
| ⬤ | ESP situations = material organization | [B] — [53](53-business-teacher-situational-model.md) sources |
| ⬤ | No reset on preference change | [D] — UC-019, owner 2026-08-20 |
| ⬤ | No visible situation units in v1 | [D] — owner 2026-08-20 |
