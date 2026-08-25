# 56 · Skill evidence: what a method may claim

<!-- id: STUDY-056 -->
<!-- type: reasoning -->
<!-- status: active -->
<!-- spawns: UC-004 -->

## Thesis

A method emits **many observations of different strength**, not one signal; the
strength must travel with the observation; and **reusing one Source across
methods** is the mechanism that turns a wide sweep of weak evidence into strong
evidence about the same words.

## Evidence

Findings `S1`–`S12` below, marked `[A]`–`[D]`. The census figures come from
reading `data/methods/*.json` and `lib/level-model.ts` directly, not from a
document about them.

Grounded in [`STUDY-003`](STUDY-003-level-model.md) (the three layers),
[`STUDY-002`](STUDY-002-evidence.md) E1/E2/E3/E4/E9, and
[`STUDY-024`](STUDY-024-readiness-and-difficulty.md) R5/R6/R8/R9.

---

## S1 · The two halves of the level model do not touch **[B — observed in code]**

`readSignals` computes three of the seven layer-1 signals from `Task[]` —
vocabulary size, form mastery, recall stability — and returns the other four as
`no-data` unconditionally. `SIGNALS_FEEDING` routes reading from lexical
coverage, speaking and writing from production quality, and listening from
nothing.

The intersection of *computed* and *feeds a skill* is **empty**. Not thin —
empty. Every skill therefore reads `not-measured` for every learner regardless
of input, and the overall level is permanently `withheld` for
`fewer-than-two-counting-skills`.

This is **deliberate, and the test says so** in `lib/level-model.test.ts`:

> Meaning-recall of isolated lemmas produces recall stability, and recall
> stability feeds no skill — so a learner who has reviewed for weeks has still
> not been measured on reading, listening, speaking or writing. A page that
> quietly promoted "has practised" to "has been measured" would look identical
> and be the [wrong thing].

So the honesty machinery is finished and correct. What is missing is the
**evidence supply**. That distinction decides everything downstream: the work is
not repairing a broken level model, it is feeding a working one — and the
tempting shortcut (route recall stability into reading so something moves) is
precisely the dishonest promotion that test exists to prevent.

> **Product sentence:** the level model is not broken and must not be
> "fixed" by re-routing card data into skills. It is starved, and the fix is
> upstream of it.

---

## S2 · Most of the catalogue emits into nothing **[B — census]**

Fifty-nine methods, of which 34 are `hosted` (the app can run them):

| Group | Count | Status |
| --- | --- | --- |
| Signal feeds a skill | 13 (11 hosted) | can move something |
| Signal feeds **no** skill | 19 | dead end |
| No signal, `hosted: false` | 18 | honest — happens outside the app (S11) |
| No signal, `hosted: true` | 9 | gap |

The 19 dead ends are not marginal methods. They are both dictations, all four
level-and-narrow listening methods, intensive reading, reading-while-listening,
the SRS session itself, four form methods, and both speaking-fluency methods.
Every one declares a signal in good faith, and none of those signals reaches a
skill.

This was **found and recorded at catalogue-writing time** and never closed —
[`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md) decision 1, 2026-08-09:

> twenty-one methods train something none of the seven layer-1 signals measures

The count has drifted from twenty-one to nineteen as methods were added. The
condition has not changed in any other way.

> **Product sentence:** the gap is catalogue-wide, was known for over two weeks,
> and cannot be closed one method at a time — which is why it needs a contract
> rather than a patch.

---

## S3 · No spec says which signal feeds which skill **[B]**

`SIGNALS_FEEDING` looks like an implementation of something. There is nothing to
implement: [`STUDY-003`](STUDY-003-level-model.md) has no signal-to-skill table.
Its layer-1 section lists seven signals with a source and a rationale, and the
routing was inferred from two prose fragments in that list — *"the direct
predictor of reading comprehension"* for coverage, and *"the only layer-1
quantity for speaking and writing"* for production quality.

Listening is `[]` for exactly one reason: **no sentence in the chapter mentions
it.** Not a research gap, not a decision — an absence of prose about it, hardened
into a data structure and then tested.

Layer 2 of the same chapter is where the routing implicitly lives (its
vocabulary anchors table gives separate listening and reading coverage rows), but
layer 2 is about CEFR bands, so nothing carried across.

> **Product sentence:** the signal-to-skill mapping is a **contract that was
> never written**, and until it is written, `SIGNALS_FEEDING` is an
> undocumented invention sitting under the app's central honesty claim.

---

## S4 · One signal feeding two skills is already wrong for production **[B]**

Production quality feeds speaking *and* writing, and 9 methods target it: 7
write-only, 2 speak-only, 1 (dictogloss) listening-and-writing. Nothing carries
which one produced the observation.

The consequence fires the day production quality gets any data. A learner who
writes three-sentence diary entries and has never spoken aloud would read
**speaking: measured** — because `readSkill` asks only whether a feeding signal
has data, never what task produced it. Worst case, the signal is dominated 7:2 by
writing methods, so speaking is measured mostly by writing.

This is R9 inside one signal rather than across two: *no claim crosses from
receptive evidence to productive competence* generalises to *no claim crosses
modality*. Writing is not slow speaking; it has planning time, no phonology, and
no real-time pressure.

> **Product sentence:** production quality is at least two quantities wearing one
> name. Splitting them is not a refinement — it is what stops the app claiming a
> skill the learner has never performed.

---

## S5 · Signals are quantities; modality is a separate dimension **[B]**

The fix for S3 and S4 is not more signals. [`STUDY-002`](STUDY-002-evidence.md)
E4 already tabulates one quantity at two modalities:

| Target | Word families needed |
| --- | --- |
| 98 % coverage, reading | ~8,000–9,000 |
| 98 % coverage, listening | ~6,000–7,000 |
| 95 % coverage, reading | ~4,000–5,000 |
| 95 % coverage, listening | ~2,000–3,000 |

Same name, different bands, different vocabulary cost — and E4 draws the product
conclusion outright, *"listening is the cheaper entry"*, which is only meaningful
if listening coverage is measurable.

The catalogue already models the plural side of this: every method carries a
`skills` **array**, and 16 methods declare listening. The bottleneck is one layer
down, where a signal has no modality to carry.

Confirmation that this is felt in practice, not theory:
[`material-unit.md`](../specs/service/material-unit.md) gap selection wants
*"content words held in writing but weak on audio-recall signal (when wired)"*.
A spec is already blocked on a per-modality signal and says so in parentheses.

> **Product sentence:** seven signals stay seven. Every observation carries the
> **modality** and the **task type** it was measured in, and figures from
> different modalities are never pooled.

---

## S6 · An untagged word is weak receptive evidence — weaker than a card **[A/B]**

The owner's proposal: a word the learner reads and does **not** tap is evidence
they knew it. Directionally right; the strength has to be stated, because two
findings push it down hard.

**E3 [A/B]:** recognition overestimates real knowledge against gap-fill by
roughly 20 %, and does not transfer reliably to recall. Not tapping is weaker
still than a recognition card, because the sentence supplies syntax, topic and
collocation — the reader passes over the word without retrieving anything. The
catalogue already says this for *a book you already know*: "prior knowledge fills
the gaps, so comprehension overstates what you read."

**R9 [A/B]:** an untapped word licenses one claim — *was not an obstacle to
comprehension in this context*. Nothing about producing it, nothing about
recognising it inflected differently, nothing about recognising it without
context.

And an absence problem specific to this evidence: **not tapping and not noticing
are indistinguishable.** A skimmer taps nothing and scores perfectly.

> **Product sentence:** an untapped word is a **weak positive** observation of
> recognition-in-context — enough to move coverage, never enough to move memory
> state or to call a word known.

---

## S7 · One Source across several methods is an evidence ladder, not an economy **[B]**

Reusing an article — read it, then dictate its sentences, then card its words —
looks like content thrift. It is the mechanism that fixes S6.

Reading one article gives a **wide, weak** sweep: several hundred lemmas at
recognition-in-context strength, and by E1 no retrieval at all, so it changes
little memory. Dictating three sentences **from that same article** gives
**narrow, strong** evidence: a handful of lemmas at cued-recall-from-audio
strength, which is a genuine retrieval attempt. Carding the words that failed
makes it durable.

Four existing findings converge on this, which is why it is worth doing on
purpose rather than as a content-budget side effect:

- **E1 [A]** — reading is not retrieval; the dictation pass is where the same
  lemma finally gets retrieved.
- **E2 [A]** — the article and the later dictation are **spaced** exposures of
  the same lemma, which is the ratio finding applied to content instead of cards.
- **E3 [A/B]** — card types are staged, recognition as entry rung and production
  as steady state. One Source at three units is that same ladder, made of
  content: `full` → `sentence` → word.
- **E9 [B]** — dictation works, so the middle rung is not filler.

And the material layer already supports it.
[`material-unit.md`](../specs/service/material-unit.md) resolves one Source at
`sentence`, `paragraph`, `window` or `full`, and its own table maps units to
methods — extensive reading takes `full`, partial dictation takes `sentence`,
intensive reading takes `paragraph`. **The plumbing for the cascade exists; the
memory does not.** Nothing records that this learner already read this Source, so
nothing can deliberately choose its sentences for tomorrow's dictation.

R5 sharpens which direction the cascade runs. A method's purpose picks its
coverage band, so the article is chosen at the reading band and the dictation
inherits sentences from it — not the reverse. Choosing the article to suit a
dictation would optimise the wrong end.

> **Product sentence:** the same Source at descending units, across days, is a
> spaced strength ladder over one vocabulary set — and the app cannot build it
> until it remembers what the learner has already read.

---

## S8 · Evidence without a strength field cannot be aggregated **[B]**

Once many methods emit into one signal, observations arrive at wildly different
reliability. Coverage over a three-sentence fixture and coverage over a 900-word
article are the same signal and not the same measurement.
[`STUDY-024`](STUDY-024-readiness-and-difficulty.md) R6 settled the discipline
for the finer case:

> No cell-level figure is reportable, and no decision rides on it, until it
> survives its own standard error.

R6 also records that thresholds are systematically **mis-set**, not merely noisy:
Cen, Koedinger & Junker found deployed mastery thresholds produced substantial
over-practice in a system with far more data per skill than this one will have.

[`STUDY-003`](STUDY-003-level-model.md)'s `uncertain` status and its honesty rule
that uncertainty is shown are the existing home for this, and neither can be
populated from observations that do not record their own sample size. S1's
`taskCount` is the shape of the idea already — it just needs to survive
aggregation.

> **Product sentence:** every observation carries what it was measured over.
> Weak-and-plentiful and strong-and-rare must stay distinguishable after the
> fact, or the aggregate is undefined.

---

## S9 · Anything derivable from time-on-task is not a signal **[D]**

The property worth protecting is that **layer 1 cannot be fed**
([`STUDY-003`](STUDY-003-level-model.md): "there is nothing to optimise except the
language itself"). Every new evidence type risks it, and the cascade in S7
multiplies the risk, because reusing content means more sessions touching the
same words.

Minutes read fails: scrolling produces it. Words seen fails the same way. Both
are counts that can only rise, which
[`STUDY-023`](STUDY-023-why-it-does-not-feel-productive.md) C3 already bars from
the progress display.

The test each candidate must pass: *could a learner produce this number without
doing the language?* Reading rate fails alone (skim fast, score high) and passes
when bound to comprehension evidence from the same session — which is what S6
needs anyway. Not a coincidence: the guard against gaming and the guard against
over-reading weak evidence are one guard.

> **Product sentence:** no observation is admitted on activity alone. Every one
> must be defeasible by doing the task badly.

---

## S10 · An encounter is not a review **[A/B]**

The tempting shortcut for word taps is to write a scheduler grade, because a
grade is the one write path that exists. It fabricates events.

**E1 [A]:** what changes memory is a retrieval attempt, and reading a word in a
supporting context is not one. A `good` written for an untapped word claims a
retrieval nobody performed **and stretches that card's interval** — the app would
schedule *less* practice because the learner skimmed.

The reverse is equally wrong. A tap is not a failed retrieval; the learner was
never asked to retrieve. Writing `again` invents a lapse, inflates the lapse
count, and corrupts the FSRS difficulty estimate the whole schedule rests on.

This is the seam where S7 pays off: the cascade gives a **real** retrieval on the
same word a day later, so there is no need to fake one at read time.

> **Product sentence:** encounters and reviews are different event kinds with
> different consequences. An encounter may inform selection and coverage; only a
> graded retrieval may move memory state.

---

## S11 · Methods that happen outside the app cannot emit signals, and that is not a gap **[D]**

Eighteen methods are `hosted: false` — label the flat, order and complain,
tandem, a film you know by heart. They have no signal because the app sees
nothing, and [`STUDY-010`](STUDY-010-method-cards.md)'s two ledgers already
covers them: they exist because
[`STUDY-007`](STUDY-007-offline-and-paper.md) and thesis 9 insist the catalogue
includes what happens outside the app. Attesting that one happened is legitimate;
measuring it is not, and self-report is exactly what E13 says not to trust.

The **nine hosted methods with no signal** are different, and are real gaps:
minimal pairs, rule at point of error, reading aloud, reread something hard,
parallel text, shadowing, recite memorised, copy a paragraph, caption your
photos.

Minimal pairs deserves singling out. It is hosted, declares `listening`, has no
signal, and is a forced-choice discrimination task — the cheapest and most
objective listening measurement in the whole catalogue, and the one
[`STUDY-011`](STUDY-011-pronunciation-perception.md) is built on. The listening
hole could start closing there with no new content pipeline at all.

> **Product sentence:** "no signal" must distinguish *cannot be observed* from
> *nobody assigned one*. Today it means both, and the second is fixable.

---

## S12 · `targetSignal` is an evaluation channel, not an emission list **[D — correction of a conflation]**

The catalogue gives every method exactly one `targetSignal`, which looked like the
answer to "what does this method measure". It is not.
[`STUDY-024`](STUDY-024-readiness-and-difficulty.md) § *And how is a method
tested?* tier 2 says what the field is for:

> Each method is judged on a **narrow target signal**, never on the overall
> level. Narrow question, far less noise, answerable in weeks.

That is about **evaluating the method** — did this way of practising move the one
thing it claims to move — and it is deliberately singular because narrowness is
what makes the effect estimate tractable against
[`STUDY-010`](STUDY-010-method-cards.md)'s noise problem.

What a session **observes** is a different quantity and has no reason to be
singular. One dictation on yesterday's article honestly observes coverage over
the transcript, gap success by difficulty, response time, spelling error rate,
and a per-lemma retrieval outcome. Five observations, one session, one evaluation
signal. Forcing those into the field meant for effect measurement is why 19
methods emit into nothing (S2).

> **Product sentence:** one method, one **evaluation** signal, many **emitted**
> observations. Two different fields; conflating them cost the catalogue its
> evidence.

---

## Product consequences

**Evidence is its own layer.** Between "a session happened" and "a signal has a
value" there is a record that does not exist. Reviews have `review_log`; nothing
else has anything, so 33 hosted methods are unobservable by construction. That
layer is where modality and task type (S5), event kind (S10), strength and sample
size (S8), and the Source the observation came from (S7) live.

**The level model is starved, not broken.** S1 is the load-bearing correction to
how this looked at the start. No re-routing of card data into skills; the work is
upstream, and the honesty tests stay exactly as they are.

**Two contracts have to be written before code.** The signal-to-skill mapping
(S3) and the evaluation-versus-emission split (S12). Both are currently
undocumented inventions under the app's central claim, and neither can be settled
by an agent choosing something reasonable.

**Production quality splits before it gets data.** S4 is the one item with a
deadline attached: the day any writing method emits, speaking starts lying. It is
cheaper to split the quantity while nothing depends on it.

**Weak evidence is admitted, and labelled weak.** S6 answers the owner's
question. Untapped words count toward coverage, at low strength, with the task
type recorded. They never make a word known and never touch the schedule.

**Content reuse becomes a design rule rather than a saving.** S7 turns "read the
article, then dictate its sentences, then card its words" into the app's answer
to E1 for input methods. It also needs the one thing the material layer lacks: a
memory of what this learner has already read.

**Listening can start without new content.** S11's minimal pairs plus S5's
modality tag is a path to a real listening signal that needs no audio pipeline,
no transcript alignment, and no new material.

## What goes into a spec

- A **signal-to-skill mapping** owned by a spec, with listening non-empty and
  each entry naming which task types may feed it (S3, S5).
- **Production quality split by modality**, before any method writes to it (S4).
- An **evidence record** written by engines and read by the level model, carrying
  modality, task type, event kind, strength, sample size and Source (S8, S10).
- The **split of `targetSignal`** into an evaluation signal and an emitted set, in
  the catalogue contract (S12).
- **Source history per learner** — what was read, when, at which unit — so the
  cascade can choose yesterday's article deliberately (S7).
- The **admission test from S9** as a gate on adding any new evidence type.
- **Reportability tied to standard error** rather than a fixed count (S8),
  including what makes a skill `uncertain` rather than `measured`.
- A signal for **minimal pairs**, and for the other eight hosted methods that
  have none (S11).
- Where **`/progress` names its sources** per engine instead of stating that only
  card reviews feed it.

## What we reject

- **Routing recall stability, vocabulary size or form mastery into a skill** to
  make the page move (S1). That is the promotion of "has practised" to "has been
  measured" that the level-model tests exist to catch.
- **Writing scheduler grades for reading encounters** (S10) — invents retrievals
  and lapses and corrupts the FSRS estimate.
- **An eighth signal for listening** (S5). The quantity exists; the modality tag
  is missing.
- **Minutes practised, words seen, or any count that can only rise** as evidence
  (S9) — already barred from display by
  [`STUDY-023`](STUDY-023-why-it-does-not-feel-productive.md) C3.
- **Pooling one signal across modalities or task types** into a single figure
  (S4, S5, R9).
- **Self-report as measurement** for the 18 unhosted methods (S11, E13).
- **Choosing an article to suit a planned dictation** (S7) — inverts R5's rule
  that a method's purpose picks its band.
- Chapter-specific rejections appear inline above. Shared catalogue:
  [`STUDY-009-antipatterns.md`](STUDY-009-antipatterns.md).

## Open questions

Implementation questions live in specs (`## Open`), use cases (`## Undecided`),
or [`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md) — decisions 38–48 were
opened by this chapter.

- How weak a weak observation is, numerically, and whether any number of them
  substitutes for one graded retrieval.
- Whether receptive-only evidence can ever make a skill `measured`, or caps at
  `uncertain`.
- Per-language calibration of the listening coverage bands (E4's table is
  cross-linguistic and `[C]` for the mechanism).
- How far a cascade may run before the Source is exhausted, and whether reusing
  one article too often reproduces the *book you know* overestimate.
- Speaking evidence without ASR — S4 splits the quantity but names no way to
  measure the speaking half.

## Related

- [`STUDY-003-level-model.md`](STUDY-003-level-model.md) — the three layers, the
  seven signals, skill statuses, honesty rules
- [`STUDY-002-evidence.md`](STUDY-002-evidence.md) — E1 retrieval, E2 spacing,
  E3 recognition versus recall, E4 coverage per modality, E9 dictation, E13
  learner belief
- [`STUDY-024-readiness-and-difficulty.md`](STUDY-024-readiness-and-difficulty.md) —
  R5 band by purpose, R6 standard error, R8 frequency-weighted, R9 task type,
  and the three tiers of method testing
- [`STUDY-010-method-cards.md`](STUDY-010-method-cards.md) — two ledgers, effect
  estimate noise
- [`STUDY-011-pronunciation-perception.md`](STUDY-011-pronunciation-perception.md) —
  minimal pairs and perception-first
- [`STUDY-027-material-units-and-listening-defer.md`](STUDY-027-material-units-and-listening-defer.md) —
  material units
- [`STUDY-055-after-read-word-taps.md`](STUDY-055-after-read-word-taps.md) — the
  reading surface case that raised this
- Normative contracts: [`specs/README.md`](../specs/README.md)
