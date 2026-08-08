# 11 · Order, measurement, open questions

---

## The order

Sorted by dependency, not by appeal. Each stage is usable on its own — otherwise
it is a build phase, not a stage.

### Stage 0 · Foundation (invisible)

Frequency lists and lemmatisation per language (F81), the **language profile
schema (F120)** and **lemmatisation via Stanza/UD (F122)**, the data model for
cards and review history.

Without that foundation neither the vocabulary estimate (F17) nor the coverage
calculator (F29) works — so neither the level model nor content selection.

F120 belongs here and not later: the profile declares the **counting unit**, and
without it the level model computes silently wrongly in agglutinative languages
([18](18-language-kit.md), U1). A language without that field must not be
loadable.

> **Trap:** this stage is unattractive and therefore regularly skipped. Skipping
> it means building the level model on guessed numbers and recalibrating later —
> with a visible jump in every user's history ([03](03-level-model.md), honesty
> rule 4).

**Status 2026-08-08:** the scheduler (`lib/scheduler.ts`,
[spec](../specs/service/scheduler.md)) and the lexicon (`lib/lexicon.ts`,
[spec](../specs/service/lexicon.md)) exist, with real frequency data for Spanish
and Italian. **Both languages have since moved to quality tier B**: a generated
form→lemma table with paradigm cells now ships for both
(`scripts/build-lemma-tables.mjs`, `data/lemma/{es,it}.json`), which is what
first makes a level value reportable — with a widened uncertainty band, since
there is still no dated calibration ([18](18-language-kit.md)).

Still open in stage 0: the calibration (tier A). The tables also self-report
where they are incomplete — Spanish 733 verbs / 98% with a full paradigm,
Italian 812 / 100%, both against the top 5,000 frequency forms — and that
incompleteness is a **⚠ SPEC GAP** for what partial form mastery means, not
silently rounded away (see `docs/specs/service/lexicon.md`, Open).

**Important for those tables (F133):** they store not just `form → lemma` but
`form → (lemma, paradigm cell)`. It costs nothing while building, because the
analyser emits the cell anyway; retrofitting would mean rebuilding the table
**and** re-scoring every review history. Reasoning: [03](03-level-model.md),
"The second axis".

### Stage 1 · Flashcards with a glass-walled schedule

F01–F07, F12, F73, F74, F78. **From here the app is usable** and already better
than any existing flashcard app — not because it can do more, but because it
shows what it is doing.

### Stage 2 · The level model

F17–F22, **F110** (skill status), **F102** (configurable skill profile),
**F126–F128** (frequency blocks) and **F123/F125** (quality tier). From here it
is *different* from everything else. This is where it becomes clear whether the
core idea holds: does the computed number say something the user experiences as
true?

F110 and F102 must come **here** and not later: a level model that counts a
deselected or unmeasured skill delivers permanently wrong numbers for some users
([14](14-accessibility.md)), and changing it afterwards means bending everyone's
history.

**F165–F170** belong here too — the goal skill in the headline and the sentence
on the landing screen ([24](24-speaking-as-the-goal.md)). The sentence is the
first thing in this product that *shows* a level instead of asserting one, and
it is the cheapest honest answer to "is this number true?" — which is the exact
question this stage exists to settle. F169 (feeding the estimate as an item)
comes later; showing the sentence does not depend on scoring it.

### Stage 3 · Reading

F29–F36, F39, **F116** (upload), **F114** (support ladder), **F129/F130** (the
map, K2 and K3). The second pillar. From here the loop closes: cards lead to
texts, texts produce cards.

F129 ("what is missing for this item") belongs here even though it looks like a
refinement: it is the coverage calculator read backwards, so it costs almost
nothing — and it is the function that gives vocabulary learning a destination
([19](19-milestones-and-map.md), K3).

### Stage 4 · Listening

F41–F46, **F97–F101**, **F111–F113, F117, F118** (own audio sources, partial
dictation), and **F136–F139** (speaking without AI). The most demanding part and
the one with the largest difference. Deliberately after reading, because it needs
the transcript and synchronisation infrastructure and because the coverage
calculator from stage 3 is reused here.

**HVPT belongs here and should come first**
([13](13-pronunciation-perception.md)). It is the cheapest part of the stage — no
LLM, no speech recognition, no synchronisation — and the best evidenced. It also
makes the rest of the stage more effective: someone who cannot hear the contrasts
gets less out of audiobooks.

> **Risk of this stage** ([15](15-landscape.md)): here we compete against
> specialists (Pimsleur, Migaku, Language Reactor) who have real content.
> Question 6 — where the audio comes from — belongs answered **before** building,
> not during.

### Stage 4b · Method choice

F87–F93, F96, and **F141–F164** (info pages, methods beyond the app, context, the
exercise runner), plus **F171–F178** (stagnation detection and commitments). Only
here, because a method menu needs at least four methods to choose from — before
that the menu is a list with one entry. The effect estimate (F94) and exploration
(F95) come later: they need months of data before they deliver anything but noise
([12](12-method-cards.md)).

Stagnation detection is placed here rather than in stage 2 for a reason: its
output is *"do this instead"*, and before there is a menu to point at, the
detector can only say "you have plateaued" — which is a diagnosis with no
treatment attached, and the least useful sentence in the product
([24](24-speaking-as-the-goal.md) S3).

Important for the order: **the floors (F92) must arrive with the menu, not
after.** A selection system without lower bounds converges within weeks on the
pleasantest methods, and by then users have got used to it.

### Stage 5 · Production and offline

F51–F53, F60, F64–F67, F72, and **F179–F183** (the read-aloud comparison and the
microphone rules). Only once reception carries — production practice without
vocabulary is frustration.

**Correction of 2026-08-08:** speaking sat here because I had coupled it to the
LLM conversation partner. That was wrong. The evidenced core of speaking practice
— **4/3/2, planning time, shadowing, self-comparison (F136–F139)** — needs no
LLM, no speech recognition and no second person, and belongs in **stage 4**,
where audio and transcripts arise anyway. The conversation partner is the
extension, not the prerequisite ([20](20-speaking-and-sentences.md)).

### Stage 6 · Refinement

Everything marked **V2** and **later** in [09](09-feature-catalogue.md), sorted
by whatever the measurement (below) identifies as the bottleneck.

### Cross-cutting · applies from the first line of code

Four V1 items belong to no stage because they affect **every** stage. They are
otherwise reliably forgotten, because they are never "due":

| # | What | Why not later |
| --- | --- | --- |
| **F107** | Every skill-bound spec names its alternative route | A process rule. Free from the first spec; afterwards a task-model change with user data attached ([14](14-accessibility.md)) |
| **F103** | Cards answerable by voice or selection, counted equally | Sits inside the task model from stage 0/1. Retrofitting means re-scoring history |
| **F83** | Complete data export | [`../CONSTITUTION.md`](../CONSTITUTION.md) §2. An export built after a year of data is a migration project |
| **F85** | A reporting route for wrong content | From the first generated sentence. Without it there is no feedback on how good the generation actually is ([10](10-antipatterns.md), A5) |

---

## How we will know whether the app works

The lesson from [01](01-duolingo.md), S5: efficacy measurement is possible but is
typically built so that it flatters. Four rules against that, built in from stage
2 rather than added afterwards:

1. **Pre-test.** Starting level is measured, not self-reported.
2. **Dropouts count.** The metric is "progress per *started* user", not "per user
   who stuck with it".
3. **Productive skills are tested**, not only receptive ones — even though that is
   more expensive. Otherwise we measure the easy thing and claim the hard one.
4. **Two figures side by side, never one:** return rate **and** measured progress.
   Their ratio is what answers the question from [08](08-motivation.md) — whether
   an app without leagues and hearts is used less, and whether better learning
   makes up for it.

---

## Open questions

These questions are not rhetorical — each changes what gets built. The ones
marked ⚠ block stage 0 or 1.

**Status 2026-08-08: the four blocking questions are answered**, as is question
15 (the goal). Stage 0 is therefore cleared. Questions 5–10 and 12–14 remain
open and none of them blocks stages 0 to 2 — but **question 16 blocks stage 1**,
because that is where review history starts accumulating in whatever shape it is
first written in.

### ✔ 1 · Who is this for? — **answered 2026-08-08**

**A tool for the author first, kept open for later.** So: build it like a tool
(no account needed, data local, generated content usable unchecked), but with a
data model and privacy posture that can become a product.

What that already forces, because it is expensive to retrofit:

- **A multilingual, user-scoped data model** from the start
  ([ADR-0004](../adr/0004-word-task-data-model.md)).
- **Complete data export** (F83) — for a tool serving one person, that is the most
  important function anyway.
- **A reporting route** (F85), even if it initially only writes to a file. Without
  it there is no statement about how good the generation is.

What it **allows** deferring: editorial work on starter decks, native-speaker
sampling, accounts and multi-user operation, LLM cost optimisation.

### ✔ 2 · Which language first? — **answered 2026-08-08**

**German → Spanish *and* German → Italian.** Two pairs, not one.

I had recommended one. Two is nonetheless the better choice, for a reason that
only emerges on reflection: **the two languages are morphologically almost
identical in construction.** Romance verb morphology, the same parts of speech,
the same inflection logic — the lemmatiser is ~80 % shared, and what is not shared
is tables rather than code. The extra cost is in **content**, not architecture.

And it flips an ordering, which is good: **UC-025 (two languages without
interference) moves from stage 6 to stage 0.** The data model is therefore
multilingual from the first line rather than retrofitted — exactly the sort of
retrofit that bends every user's history.

The real price, named honestly:

- **Two calibrations**, not one. The vocabulary anchors in
  [03](03-level-model.md) are **[C]** and must be adjusted per language.
- **Two content stocks** — texts, audio, speaker pools. That is the actual
  doubling.
- **Confusions between Spanish and Italian** are a real problem from day one,
  because the two are similar enough. That becomes a diagnosable error type with
  minimal-pair repair (UC-013, UC-025) — extra work, but also a differentiator no
  competitor has.

### ✔ 3 · Web or native? — **answered 2026-08-08: web first**

Route (a): web/PWA for stages 1–3, decide on a native shell before stage 4. The
reasoning below stays as context — especially the sentence that the decision
comes back to the table at stage 4 and must **not** silently become "web for
everything".

Grundriss is Next.js, so web/PWA. For cards, reading and the level model that is
entirely sufficient. For stage 4 it gets tight: background audio, lock-screen
controls, reliable speech recognition and offline audio are on the web —
especially on iOS — either difficult or impossible.

Three viable routes: (a) web first, native shell later; (b) web for everything
except listening, listening native; (c) native from the start, in which case
Grundriss is the wrong base. **Recommendation: (a)** — stages 1–3 have no native
need, and by stage 4 we will know enough to decide better.

### ✔ 4 · One card per word or one per task? — **decided 2026-08-08**

**Word → several tasks, each with its own FSRS state.** Worked out and justified
in [ADR-0004](../adr/0004-word-task-data-model.md), including the three rejected
alternatives and the costs.

Two things that follow and belong here, because they affect stage 1:

- **The vocabulary estimate counts words; the session counts tasks.** A learner
  with 500 words has ~2,000 tasks. That number is never displayed — which makes
  the fixed-length session (F04) a requirement of the data model rather than a
  nicety.
- **⚠ SPEC GAP:** the minimum spacing between two tasks of the same word is
  undecided. Otherwise four tasks for one word drift together and clump. Belongs
  in the scheduler spec, see
  [`../specs/service/scheduler.md`](../specs/service/scheduler.md).

### 5 · Where does the LLM run, and what does it cost?

Text generation (F39), the conversation partner (F51) and correction (F53) are
recurring costs per user per month. Client-side or server-side? What happens
offline? Is there a usable version without an LLM? An answer is needed before
stage 3, not before now.

### 6 · Where does the audio come from?

Text-to-speech is cheap, available and entirely adequate for dictations and
cards. For audiobooks from B1, real speech with natural pace, accent and
hesitation is the actual object of learning — and that is where licensing
questions start (F49).

### 7 · How much gamification do you really want to leave out?

[10](10-antipatterns.md) cuts leagues, hearts and XP. That is the most consistent
position, and it is a risk ([08](08-motivation.md), the honesty caveat). Are you
prepared to carry it, or should some of it exist as a switchable option?

### 8 · What goes into the constitution?

Proposal: lift four sentences from this study into
[`../CONSTITUTION.md`](../CONSTITUTION.md):

- What is displayed gets optimised — only what is useful to optimise may be
  prominent.
- No progress figure without an openable derivation.
- The level may fall.
- No generated target-language content without checks and a reporting route.

These rules only have force if they can override a direct instruction — hence the
constitution and not the study.

### 9 · ~~Study in German, code and specs in English~~ — **superseded 2026-08-08**

The user asked for the repository to be **entirely in English**, even though the
conversation is in German. Done: the study is translated, the files renamed, and
the German column has been removed from the glossary. The reason it existed —
a German study beside English code — no longer applies.

### 10 · How strictly should the Grundriss process apply here?

Grundriss requires a spec before code for everything but trivial changes. For a
project of this size I think that is right — but it costs noticeable speed in the
first weeks. Apply it fully, or build stages 0 and 1 as a prototype without specs
and backfill? (My recommendation: apply it fully. Precisely the decisions taken
early here — data model, level computation, card states — are the ones you cannot
change later without bending every user's history.)

### ✔ 11 · May a method disappear entirely? — **answered 2026-08-08**

**Yes, hiding is allowed.** The decision of this study's user.

Worked out in [12](12-method-cards.md), "Hiding": reachable only from settings
(not from the session flow), with a one-off note drawn from the learner's own
data, permanently visible as hidden, restorable at any time — and **the
consequence for the level model is drawn**: hiding every method feeding a skill
gives that skill "not measured", not a low number.

A15 in [10](10-antipatterns.md) stands and is bounded: it forbids the
**algorithm** from sorting out, not the human.

### 12 · Which methods get which floor?

The table in [12](12-method-cards.md) is a proposal **[D]**, not a research
result. It defines what the system regards as indispensable, and should therefore
be set deliberately and dated — like the calibration in
[03](03-level-model.md).

### 13 · Real speakers or TTS for HVPT?

Variability between speakers is the **active ingredient** of HVPT, not the
packaging ([13](13-pronunciation-perception.md)). Several high-quality TTS voices
are cheap and probably usable; but they tend to be too clean and too similar to
each other, and whether that still carries the effect is untested. Real speaker
recordings are the only notable cost of what is otherwise the study's cheapest
feature.

### 14 · A week of using LingQ and Migaku — who does that?

[15](15-landscape.md) rests on product descriptions, not first-hand use. Before
any roadmap decision builds on K1 or K3, someone should actually have used them.
That is not a research problem but a time problem, and it is cheap compared with
what it prevents.

### ✔ 15 · What is the app's goal? — **answered 2026-08-08: speaking**

**Speaking is the main goal, with the 20/80 taken along the way.** The decision of
this study's user.

Worked out in [24](24-speaking-as-the-goal.md) S1, and the load-bearing part is
the boundary: the goal changes the **headline skill**, the **floors** and the
**content selection** — and it changes nothing about how any skill is measured or
how the overall level is computed. A goal that reweights the measurement produces
a number that tells you what you wanted to hear.

The 20/80 is not a competing goal but the ordering *within* this one: input is
the precondition, speaking is the goal, and the roadmap already runs in that
order.

### 16 · Where does the data live? — **decide before stage 1**

The review log is the source of truth ([`../adr/0004-word-task-data-model.md`](../adr/0004-word-task-data-model.md)),
which makes this question load-bearing rather than infrastructural. Three
options, and the ordering is not obvious:

| Option | For | Against |
| --- | --- | --- |
| **Local only** (IndexedDB) | No account, no server, no privacy question, offline by default (F82) | One device. F83 export becomes the *only* way to move |
| **Local first + sync** | Same, plus a second device | Sync of an append-only log is easy; sync of derived state is not. Real work |
| **Server first** (e.g. Supabase) | Cheapest to build, one obvious place for everything | An offline-first product with a server-first data layer is a retrofit later, and this one is offline-first by requirement |

**[D] Recommendation: local first, with the log shaped for sync from day one.**
Append-only, per-review UUIDs, no update-in-place — then adding a server later is
an addition rather than a migration. What must **not** happen is stage 1 storing
review history in a shape that assumes a single device.

Decide before stage 1 writes its first review; see
[`../BACKEND.md`](../BACKEND.md).

---

## What happens next

Once questions 1–4 are answered:

1. Sharpen `UC-004` to `UC-010` (drafts are in [`../use-cases/`](../use-cases/)).
2. Write the ADR for the data model decision from question 4 — the textbook case
   for [`../adr/`](../adr/): expensive to change, must be defended later.
3. Stage 0 as the first spec-driven work
   ([`../WORKFLOW.md`](../WORKFLOW.md), stage 2).
