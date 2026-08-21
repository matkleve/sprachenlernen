# 53 · How a Business language teacher would do it — situations, not card counts

**Status:** study only — replaces the **card-counting** logic in
[52](52-register-mix-ratio-calibration.md) (2–3/session, 10 %, 15/15).  
**Owner (2026-08-20):** Fixed numbers are too rigid. *How would a Business
Sprachlehrer vorgehen?*

This chapter answers that question from ESP / Business English practice and
translates it into product rules **without** a per-session word quota.

Related: [51](51-register-path-and-interest-topics.md) (register + interests),
[21](STUDY-019-method-catalogue-and-context.md), [UC-019](../use-cases/UC-019-learn-for-something-specific.md).

---

## T0 · What a Business teacher does **not** do

| Teacher does **not** | Apps often do |
| --- | --- |
| Count “3 business words today” | Fixed boost ratio |
| Teach a frequency list with business sprinkled | General deck + tags |
| Stop “being business” after 60 days | Decay / fade |
| Ask “speaking or writing?” on day 1 | Skill fork |
| Use the same lesson plan for every student | One-size course |

A Business teacher starts with **needs** and **situations**, then picks **whatever
language that situation requires** — sometimes one phrase, sometimes a cluster,
sometimes a week mostly on basics because the learner still needs *porque* before
*quarterly forecast*.

---

## T1 · How a Business teacher **does** structure a course **[B]**

ESP / Business English course design (Hutchinson & Waters; Yalden; situational
syllabus literature) converges on this sequence:

### Step 1 · Needs analysis (≈ our onboarding popover)

- **Register path:** Business · Alltag · Technik — *which world* they work in  
- **Interests:** which **topics** in news and texts  
- **Situations** (often implicit): meetings, email, calls, small talk with clients,
  presentations — derived from register, not a separate quiz in v1  

Sources: [ESP course design PDF](https://www.atlantis-press.com/article/125919619.pdf),
[situational syllabus](https://dergipark.org.tr/tr/download/article-file/780117),
[TEFL Institute needs analysis](https://teflinstitute.com/blog/english-for-specific-purposes-a-guide-for-esl-educators/).

### Step 2 · Syllabus = **situations + functions**, not lemma ranks

Business syllabus is organized by **performance skills**:

| Unit | Situation | Functions (examples) |
| --- | --- | --- |
| 1 | First contact | introduce, schedule, polite request |
| 2 | Email | subject lines, attach, follow up, soft refusal |
| 3 | Meeting | agenda, interrupt politely, summarize action items |
| 4 | Phone / video | clarify, bad connection, confirm next steps |
| 5 | Numbers & updates | trends, compare, cause/effect |

Within each unit: **chunks and phrases** (*Could we move the deadline?*,
*I'll get back to you by EOD*) plus whatever **grammar** the situation forces
(conditionals in negotiation, modality for politeness).

**Lexical load varies by unit** — email week might introduce 12 useful phrases;
meeting week might recycle 4 new lemmas and mostly practice production. **No
teacher targets “2–3 words per lesson.”**

### Step 3 · General English continues **inside** business tasks

The teacher does not pause Business to teach *ser/estar* in isolation. They teach
*ser* **in** *La reunión es a las nueve* and *estar* **in** *El cliente está
de acuerdo*. Basics are **pulled in when the situation needs them**, not blocked
into a separate “general deck” except early survival vocabulary.

### Step 4 · Materials = **authentic register + learner interests**

- Article from business press (adapted to level) on **Sport** if that's the interest  
- Role-play: **your** meeting, not a generic dialogue  
- Homework: write **one real email** you'd actually send  

Materials change; the **situation spine** stays.

### Step 5 · **Process syllabus** — adjust each week

Target-centered syllabus (what job needs) + process syllabus (teacher reacts to
what failed last week). If the learner bombed *agenda* in role-play, it comes
back in email context next week — not because a counter said “3 words.”

---

## T2 · Product translation — **situation-led**, not **count-led**

Withdraw from studies 49–52: all **per-session register quotas** (1.25×, 2–3,
10 %, 15/15, decay).

### T2a · Core objects

| Object | Role |
| --- | --- |
| **`registerPath`** | Business \| Alltag \| Technik \| general |
| **`interestTopics[]`** | Sport, Politik, … — filters catalogue |
| **`situationUnit`** | Current unit in register syllabus (e.g. *Meetings*) |
| **`functionChunks[]`** | Teachable phrases for this unit |
| **`spine`** | High-frequency lemmas still scheduled by FSRS when due |

### T2b · Session composition (teacher logic)

When building a 15-card session for a Business learner:

1. **FSRS due** — whatever is due (business or basic — honesty first)  
2. **Situation focus** — next **chunks / lemmas** for the **current unit** until
   unit milestones met (not “N per session”)  
3. **Spine fill** — high-frequency gaps the learner still needs for **any**
   register  
4. **Example sentences on every card** — register + interest context  
5. **Methods / reading** — pick catalogue Source matching register + interests +
   current unit theme  

**Variable outcome:** one session might be 8 situation lemmas + 7 due basics;
another might be 14 due reviews + 1 new chunk because the unit is in **practice
phase**. Both are correct.

### T2c · What the learner sees (not a word count)

```
Business · Meetings (Einheit 2/6)
Heute: E-Mails nach dem Meeting — höflich nachfassen
Lesen: [Artikel Sport + Wirtschaft, adaptiert]
```

Not: *“4 of 15 cards are Business.”*

### T2d · Progress (teacher report card)

```
Business — Meetings: ████░░ 4/6 Situationen
Funktionen: Nachfassen · Agenda · Termin verschieben
Basics (gesamt): 412 held
Nächste Einheit: Telefon & Video
```

---

## T3 · Onboarding popover (teacher-aligned)

| Page | Content |
| --- | --- |
| 1 | Abholen — what Business course **means** (situations + real texts) |
| 2 | Register — Business / Alltag / Technik |
| 3 | Interests — chips for news/topics |
| 4 | **First situation** (auto-pick v1: *Erstkontakt & Termin*) — preview one
      chunk: *¿Podemos agendar una reunión?* |

No skill fork. No “how many words.” Optional later: pick urgent situation
(*I have a meeting Thursday*).

---

## T4 · Business vs Technik — why it still feels different

Not because card #13 is *cliente* vs *servidor*. Because:

| Layer | Business | Technik |
| --- | --- | --- |
| **Situation units** | Meetings, email, negotiation | Incidents, docs, standup, tickets |
| **Chunks** | *budget, stakeholder, follow up* | *deploy, log, rollback, API* |
| **Reading** | Wikinews Wirtschaft / Sport business | Release notes, postmortems (adapted) |
| **Production prompts** | Write client email | Explain error to team |
| **Basics** | Same *porque* — different **sentence** |

---

## T5 · Panel one-liner

| Role | Verdict |
| --- | --- |
| **Business teacher** | Syllabus = situations + functions; lexis follows task; no daily word quota |
| **UX** | Show **unit + theme**, not “X/Y register cards” |
| **DS** | Model `situationUnit` + chunk graph; session builder **targets unit gaps**, not `registerNewPerSession` |
| **Owner** | **Stop counting cards** — **[D] locked** |

---

## T6 · Supersession

| Withdraw | Replace with |
| --- | --- |
| [52](52-register-mix-ratio-calibration.md) §M1 formula | T2b situation-led composition |
| [49](49-learner-intent-onboarding.md) boost/decay | Situation units + chunk SRS |
| [51](51-register-path-and-interest-topics.md) ordered lemma list as **primary** | **Situation units** contain lemmas + chunks; list is implementation detail |

**Keep from 51:** register path, interest topics, news filter, register-shaped
sentences, no decay.

---

## Sources

| | Claim | Grade |
| --- | --- | --- |
| ⬤ | Business syllabus = situations + performance skills | [B] — Atlantis Press ESP design |
| ⬤ | Situational syllabus = teach language that occurs in situations | [B] — Wilkins / Dergipark |
| ⬤ | Needs analysis before syllabus | [B] — ESP standard |
| ⬤ | Functional phrases > isolated word lists in BE | [C] — practitioner consensus |
| ⬤ | No fixed words/session — owner lock | [D] — 2026-08-20 |
