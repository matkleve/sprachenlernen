# 03 · The level model: measuring your level instead of asserting it

The central product idea. Duolingo shows XP; we show a language level computed
from actual performance data, resolved more finely than A1–C2, and with an
honest answer to "am I getting better?".

---

## The problem with A1–C2

The CEFR is a competence description, not a measuring instrument. It defines six
levels via can-do statements — and the Council of Europe itself notes explicitly
that the levels *may be subdivided further according to local need*. Language
schools have been doing exactly that for decades (A1.1, A1.2, …); no standard
for the number of sub-levels exists.

Three practical defects for an app:

1. **Too coarse.** At realistic effort, A2 to B1 takes months. A progress
   indicator that moves every four months motivates nobody and informs nobody.
2. **Too one-dimensional.** Almost every learner has a profile, not a level:
   reading B1, listening A2, speaking A1. A single number averages away exactly
   the information you would steer by.
3. **Not self-measurable.** "Can speak in simple connected sentences about
   familiar topics" cannot be derived from click data.

---

## Our model: three layers

```
   Layer 3   Overall level        B1.2            ← one number, honestly formed
                                    ▲
   Layer 2   Skill levels         Reading B1.3 · Listening B1.1 · Speaking A2.4 · Writing B1.1
                                    ▲
   Layer 1   Signals              Vocabulary size · Recall stability · Coverage
                                  · Response time · Success by task difficulty
```

Bottom to top: **only layer 1 is measured.** Layers 2 and 3 are derived. That is
the decisive property — there is no score you can feed directly, so there is
nothing to optimise except the language itself (see [01](01-duolingo.md), D1).

---

## Layer 1: What is actually measured

| Signal | Source | Why it counts |
| --- | --- | --- |
| **Vocabulary size** (estimated known lemmas) | SRS holdings, weighted by stability, extrapolated over frequency rank | The only competence quantity that is cheap and reasonably valid to estimate ([02](02-evidence.md), E4) |
| **Form mastery** | Success on tasks tagged with their paradigm cell | Knowing a lemma does not mean being able to inflect it — see below |
| **Recall stability** | FSRS stability per card, aggregated | Distinguishes "seen before" from "can do" |
| **Lexical coverage** | Share of known tokens in texts at the relevant level | The direct predictor of reading comprehension |
| **Response time on correct recall** | Answer time, normalised per user and card type | Degree of automatisation. Correct but slow ≠ fluent |
| **Success by task difficulty** | Results on level-labelled tasks, evaluated IRT-style | Anchors the estimate to tested content rather than self-directed runs alone |
| **Production quality** | Error rate and sentence complexity in free answers and dictations | The only layer-1 quantity for speaking and writing |

**[D]** How these are weighted is a product decision, not a research inference.
It belongs in a spec, versioned, with a visible change date — see "Honesty
rules" below.

### Why vocabulary size is load-bearing

Because it bridges the SRS data and the notion of level. For every card we know
the word's **frequency rank** in a reference corpus. If a user holds ranks
1–1,200 stably and almost nothing beyond rank 2,000, their boundary lies
somewhere between — and that boundary can be sharpened with targeted samples
from higher ranks. At heart this is an adaptive test, distributed across normal
use.

Two pitfalls we avoid explicitly:

- **Do not rebuild LexTALE.** The well-known quick test (word/non-word decision)
  has been criticised for overstated reliability and separates L2 levels less
  well than claimed. Adaptive testing by item response theory is the better
  route, and it is exactly what our frequency ranks already enable.
- **Lemma ≠ word form.** Someone who knows *go* does not automatically know
  *went*. The estimate counts lemmas, practice trains forms — and the gap
  between them is large enough for its own signal. See "The second axis" below.

### The second axis: form mastery **[D — correction of 2026-08-08]**

This model had a hole the user walked into, and it is big enough for its own
section.

**Knowing a lemma does not mean commanding its forms.** In Italian the three
conjugation classes (*parlare · credere · dormire*) diverge, *-ire* splits again
(*dormo* vs. *finisco*), and the most frequent verbs are irregular (*essere,
avere, fare, stare*). Nouns likewise: *-o/-i*, *-a/-e*, plus *uomo/uomini*,
*uovo/uova*, and invariables like *città*.

The vocabulary estimate counts lemmas and **silently assumes** the forms come
with them. For inflecting languages that is false, and false to a different
degree per word.

The failure it produces is thesis 4 one layer down: someone who knows 2,000
lemmas and cannot conjugate reads well, does not speak — and is shown B1 across
the board.

**Consequence:** form mastery is its **own layer-1 signal**, not part of
vocabulary size. It is measured over **paradigm cells**: class × tense/mood ×
person, plus frequent irregulars individually. Failing *parliamo* while knowing
*parlare* is a form gap, not a vocabulary gap.

Two things follow immediately:

1. **The form→lemma table must store the cell** — `parliamo → (parlare, 1st pl.
   present)`, not just `parliamo → parlare`. Free now; later it means rebuilding
   the table and re-scoring every history. Same class of decision as the counting
   unit ([18](18-language-kit.md), U1).
2. **The paradigm tables in [07](07-offline-and-paper.md), Ü3 stop being a side
   exercise** and become training for a measured quantity — and their mixing
   requirement from [02](02-evidence.md), E6 now has a target.

Side finding: the most frequent verbs are the irregular ones. Form mastery
matters most right at the top of the frequency list — exactly where a pure lemma
count looks most confident.

---

## Layer 2: Sub-levels

**[D]** Four sub-levels per CEFR level, plus percentage progress within the
sub-level:

```
A1.1  A1.2  A1.3  A1.4  A2.1 … C2.4          24 steps in total
                                              displayed e.g. as:  B1.2 · 63 %
```

Why four rather than two or three: at realistic effort (20–30 min/day) a
sub-level change should happen **roughly every three to six weeks**. Rare enough
that it feels earned, frequent enough to be experienced several times a year.
Two sub-levels are too coarse; six devalue the event.

The percentage within the level provides the daily feedback — it may move
measurably, and it may also **fall** (see the honesty rules).

### Approximate vocabulary anchors **[C]**

This mapping is inconsistent across the literature and differs by language. It
is a calibration starting point, not truth, and must be adjusted per language.

| Level | Word families (guide) | What is realistically possible |
| --- | --- | --- |
| A1 | ~500–750 | Fixed phrases, immediate needs |
| A2 | ~1,000–1,500 | Everyday routines; simple audio becomes accessible |
| B1 | ~2,000–2,750 | ~95 % coverage in **listening** becomes reachable ([02](02-evidence.md), E4) |
| B2 | ~3,250–4,000 | ~95 % coverage in **reading**; novels with a dictionary |
| C1 | ~5,000–6,000 | Near 98 % in listening; incidental acquisition carries |
| C2 | ~8,000–9,000 | ~98 % in reading; vocabulary grows by itself |

The table incidentally explains a product phenomenon: **between B1 and B2 it
feels as if nothing is happening.** Vocabulary must almost double to cross the
next visible comprehension threshold. That is exactly where learners lose
motivation — and exactly where the app must show something that does move
(coverage, stability, reading speed).

---

## Layer 3: The overall level

### The status of a skill — the only place this is defined

A pass over the study found three chapters describing the same thing
differently. It belongs here, and the others only point at it:

| Status | When | Counts toward overall? | Display |
| --- | --- | --- | --- |
| **measured** | enough layer-1 data | yes | level + percentage |
| **uncertain** | little data | yes, with a band | level ± range, "few data yet" |
| **not measured** | part of the profile, but no data — never spoke, or every contributing method hidden ([12](12-method-cards.md)) | **no** | "not measured", with the route to it |
| **not in profile** | deliberately deselected ([14](14-accessibility.md)) | **no** | "not part of your profile" |

The difference between the last two is not pedantry: *not measured* is a gap
that can be closed and whose route is shown; *not in profile* is a decision that
is respected and not commented on. Both lead to the same arithmetic — they are
out of the formula.

### The formula

**[D]** Rule: **the overall level is the second-lowest of the skill levels that
count.**

Not the average (which hides a gap), not the minimum (a single unpractised field
drags everything down) and not the maximum (that is self-deception, and the
reason people come unstuck abroad).

**Special case:** with only two counting skills, "second-lowest" equals
"highest" — too optimistic. So from two skills the **minimum** applies, from
three the second-lowest. With a single skill there is no overall level, only
that skill. **⚠ This is a product decision [D] and it was not considered in the
first draft;** it surfaced during a review pass because
[14](14-accessibility.md) makes profiles of fewer than four skills possible.

Alongside it, one sentence in plain words:

> **B1.2** — your reading already carries B2, your speaking lags at A2.4.

That is the display actually needed on the home surface: a number to remember
and a sentence saying what to do next.

---

## "Am I getting better or worse?"

Four comparisons, in this order of prominence:

### V1 · Me against myself, over time **(primary display)**

A trend per skill over 30/90/365 days. The central figure is the **change**, not
the standing: *"Listening: +0.4 levels in 90 days"*. Informational in the sense
of [02](02-evidence.md), E7 — it tells you where you stand and demands nothing.

### V2 · Me against my goal

Where a goal is set (B2 by June, exam in autumn): the current trend
extrapolated and honestly labelled — *"at your current pace, B2.1 in August;
your goal was June"*. Extrapolation only with a visible uncertainty band; a
smooth forecast line is a lie with axis labels.

### V3 · Me against the effort

Progress per hour invested. The most uncomfortable and most useful display: it
reveals when someone is pouring time into an ineffective kind of practice — and
it is the real lever for moving learners from recognition to production work.

### V4 · Me against others **(optional, off by default)** **[D]**

The comparison people ask for and the one that harms fastest. Mogavi et al.
(2022) identify competition as a main driver of gamification misuse
([01](01-duolingo.md), D1).

If at all, then like this:
- Reference group = people with **similar study time and similar starting point**,
  not "all users". Otherwise a working adult compares against students.
- As a distribution, not a ranking. "You are in the middle third", not "rank
  12,483".
- No crash event, no relegation zone, no weekly deadline.

---

## Honesty rules

These four are why the display can be believed. They are candidates for
[`../CONSTITUTION.md`](../CONSTITUTION.md).

1. **The level may fall.** Three months away means less stable recall — and you
   are told so. A level that can only rise is a score, not a measurement.
   (Consequence: the fall must be shown gently, with the route back beside it —
   see [08](08-motivation.md).)
2. **Uncertainty is shown.** Early on the estimate is poor. Then it reads "A2 ±
   1 level — few data yet", not "A2.3 · 41 %".
3. **Every number opens.** One tap shows which signals produced it. A competence
   figure without a derivation is an oracle.
4. **Calibration is dated.** If we change the weighting, everyone's level jumps.
   Then the history carries a marker: *"calculation changed on dd.mm.yyyy"* — and
   the old line stays visible. Silently changing a progress display retroactively
   is the fastest way to lose trust.

---

## Still open

- **Cold start.** Where does the first level come from? Proposal: an optional
  five-minute adaptive test, offered *after* the first exercise, never before
  ([01](01-duolingo.md), S1). Skipping it starts at A1.1 with a wide uncertainty
  band.
- **Speaking without recording.** If someone never uses the microphone there are
  no layer-1 data for speaking. The display then reads "not measured", never a
  guessed number.
- **Multiple languages** share a user but nothing of their calibration. See
  [11](11-roadmap-open-questions.md), question 6.
