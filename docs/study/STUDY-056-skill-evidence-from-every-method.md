# 56 · Skill evidence: what a method may claim

<!-- id: STUDY-056 -->
<!-- type: reasoning -->
<!-- status: active -->
<!-- spawns: UC-004 -->

## Thesis

A method emits **many observations of different strength**, not one signal — and
the strength must travel with the observation, or aggregating across methods
produces a level nobody can defend.

## Evidence

Findings marked `[A]`–`[D]` appear inline in the sections below.

Grounded in [`STUDY-003`](STUDY-003-level-model.md) (the three layers),
[`STUDY-002`](STUDY-002-evidence.md) E1/E3/E4, and
[`STUDY-024`](STUDY-024-readiness-and-difficulty.md) R5/R6/R8/R9.

---

## S1 · `targetSignal` is an evaluation channel, not an emission list **[D — correction of a conflation]**

The catalogue gives every method exactly one `targetSignal`, and that looked like
the answer to "what does this method measure". It is not.
[`STUDY-024`](STUDY-024-readiness-and-difficulty.md) § *And how is a method tested?*
tier 2 says what the field is for:

> Each method is judged on a **narrow target signal**, never on the overall level.
> Narrow question, far less noise, answerable in weeks.

That is a statement about **evaluating the method** — did this way of practising
move the one thing it claims to move. It is deliberately singular *because*
narrowness is what makes the effect estimate tractable against
[`STUDY-010`](STUDY-010-method-cards.md)'s noise problem.

What a session **observes** is a different quantity, and there is no reason for it
to be singular. One extensive-reading session honestly observes lexical coverage
of the text consumed, reading rate, and a set of words that were and were not
recognised in context. Forcing those into the single field meant for effect
measurement is why the app currently records none of them.

> **Product sentence:** one method, one **evaluation** signal, many **emitted**
> observations. Two different fields; conflating them cost every input method its
> evidence.

---

## S2 · Signals are quantities; modality is a separate dimension **[B]**

Listening has no signal assigned — `SIGNALS_FEEDING.listening` is empty, and the
level model calls it a hole. The cause is a wording accident, not a missing
quantity. [`STUDY-003`](STUDY-003-level-model.md) layer 1 describes lexical coverage as

> The direct predictor of reading **comprehension**

…and that single word made a modality-neutral quantity look like a reading-only
one. [`STUDY-002`](STUDY-002-evidence.md) E4 contradicts it directly, tabulating
coverage thresholds **separately per modality**:

| Target | Word families needed |
| --- | --- |
| 98 % coverage, reading | ~8,000–9,000 |
| 98 % coverage, listening | ~6,000–7,000 |
| 95 % coverage, reading | ~4,000–5,000 |
| 95 % coverage, listening | ~2,000–3,000 |

Two coverage numbers with the same name, different bands, different vocabulary
cost. E4 draws the product conclusion outright — *"listening is the cheaper
entry"* — which is only meaningful if listening coverage is a measurable thing.

So the seven signals stay seven. What they lack is a **modality** on each
observation: coverage measured over a transcript the learner heard is not the
same evidence as coverage over text they read, and neither may be pooled into one
figure.

> **Product sentence:** listening does not need an eighth signal. It needs
> coverage, success-by-difficulty and response-time observations tagged with the
> modality they were measured in.

---

## S3 · An untagged word is weak receptive evidence — weaker than a card **[A/B]**

The owner's proposal: if the learner reads a passage and **does not** tap a word,
that word is evidence they knew it. Directionally right, and the strength has to
be stated, because two known findings push it down hard.

**E3 [A/B]:** recognition overestimates real knowledge against gap-fill by roughly
20 %, and recognition knowledge does not transfer reliably to recall. Not tapping
is weaker still than a recognition card: the surrounding sentence supplies
syntax, topic and collocation, so the reader can pass over a word without
retrieving anything. The catalogue already says this in the `doesNotDo` for
*a book you already know*:

> Prior knowledge fills the gaps, so comprehension overstates what you read.

**R9 [A/B]:** a signal states the task type it was measured on, and no claim
crosses from receptive evidence to productive competence. An untapped word
licenses "was not an obstacle to comprehension **in this context**". It licenses
nothing about producing the word, nothing about recognising it inflected
differently, and nothing about recognising it without context.

There is also an absence problem specific to this evidence: **not tapping and not
noticing are indistinguishable.** A skimmer taps nothing. So the observation is
only interpretable alongside something that shows the passage was actually read —
which is why reading rate matters as a companion, not as a signal of its own (S5).

> **Product sentence:** an untapped word is a **weak positive** observation of
> recognition-in-context — good enough to move coverage, never good enough to
> move memory state or to claim a word is known.

---

## S4 · Evidence without a strength field cannot be aggregated **[B]**

Once many methods emit observations of one signal, they arrive at wildly
different reliability. Coverage over a three-sentence fixture and coverage over a
900-word article are the same signal and not the same measurement.
[`STUDY-024`](STUDY-024-readiness-and-difficulty.md) R6 already settled the
discipline for the finer case:

> No cell-level figure is reportable, and no decision rides on it, until it
> survives its own standard error.

R6 also records that thresholds are systematically **mis-set**, not merely
noisy — Cen, Koedinger & Junker found deployed mastery thresholds produced
substantial over-practice in a system with far more data per skill than this one
will have. Applying that to cross-method aggregation: an observation must carry
how much it was measured over, or the first weak reading of a short fixture will
flip a skill from *not measured* to *measured* and the display becomes noise
wearing a status.

[`STUDY-003`](STUDY-003-level-model.md)'s honesty rule 2 (*uncertainty is shown*)
and its `uncertain` status are the existing home for this. They cannot be
populated from observations that do not record their own sample size.

> **Product sentence:** every observation carries what it was measured over and
> how strong the inference is. Weak-and-plentiful and strong-and-rare must be
> distinguishable after the fact, or the aggregate is undefined.

---

## S5 · Anything derivable from time-on-task is not a signal **[D]**

The property that makes this model worth building is that **layer 1 cannot be
fed** ([`STUDY-003`](STUDY-003-level-model.md): "there is nothing to optimise
except the language itself"). Every new evidence type is a chance to lose it.

Minutes read is the tempting one, and it fails: scrolling produces it. Words
seen fails for the same reason. Both are counts that can only rise, which
[`STUDY-023`](STUDY-023-why-it-does-not-feel-productive.md) C3 already bars from
the progress display, and `/progress` has an acceptance criterion enforcing it.

The test each candidate must pass: *could a learner produce this number without
doing the language?* Reading rate fails it alone (skim fast, score high) but
passes when bound to comprehension evidence from the same session — which is
exactly the pairing S3 needs anyway. That is not a coincidence: the guard against
gaming and the guard against misreading weak evidence are the same guard.

> **Product sentence:** no observation is admitted on activity alone. Every one
> must be defeasible by doing the task badly.

---

## S6 · An encounter is not a review **[A/B]**

The tempting shortcut for word taps is to write a scheduler grade — a tap becomes
`again`, an untapped word becomes `good` — because a grade is the one write path
that exists. It fabricates events that did not happen.

**E1 [A]:** what changes memory is a **retrieval attempt**. Reading a word in a
supporting context is not one, and E1's product sentence is already explicit that
looking at something and moving on is not practice. A `good` written for an
untapped word claims a successful retrieval nobody performed, and it would then
stretch that card's interval — the app would schedule *less* practice because the
learner skimmed past the word.

The reverse is equally wrong. Tapping a word is not a failed retrieval either;
the learner may never have been asked to retrieve it. Writing `again` invents a
lapse, inflates the lapse count, and corrupts the FSRS difficulty estimate that
the whole schedule rests on.

> **Product sentence:** encounters and reviews are different event kinds with
> different consequences. An encounter may inform selection and coverage; only a
> graded retrieval may move memory state.

---

## S7 · Measure what was consumed, not what was offered **[D]**

Coverage is computed today when a session is composed, to show a preview before
Start. That number describes the **material**. It is not evidence about the
learner until the learner has been through it, and for a session that was
abandoned halfway it is simply wrong.

The distinction matters more as material gets longer: predicted coverage over a
full article and observed coverage over the three paragraphs actually reached are
different quantities, and only the second is an observation.

> **Product sentence:** the preview number is about the text; the evidence number
> is about the session. They are computed by the same function and must not be
> stored as the same fact.

---

## Product consequences

**Evidence is its own layer.** Between "a session happened" and "a signal has a
value" there is a record that today does not exist. Reviews have `review_log`;
nothing else has anything, so six built methods are unobservable by construction.
That layer is where modality (S2), strength and sample size (S4), task type (S3,
R9) and event kind (S6) live.

**One method, many observations, one evaluation signal.** S1 splits the field the
catalogue already has from the set it never had. Extensive reading is the case
that proves it: its evaluation signal is lexical coverage, and it can honestly
emit coverage-over-what-was-read, reading rate bound to comprehension, and a set
of recognition-in-context observations.

**Weak evidence is admitted, and labelled weak.** S3 is the answer to the owner's
question. Untapped words count — toward coverage, at low strength, with the task
type recorded. They never make a word "known" and they never touch the schedule.
This is what lets an input method contribute at all without the app claiming more
than it saw.

**Reading can be measured now; listening needs no new theory.** Reading's feeding
signal is already lexical coverage and coverage is already computed — the gap is
persistence, not measurement (S7). Listening's hole closes by tagging modality
rather than by inventing an eighth signal (S2).

**The honesty properties survive.** S5 keeps layer 1 unfeedable; S4 keeps
`uncertain` meaningful instead of decorative; S6 keeps the schedule uncorrupted.
Every one of those is a property the app currently has by accident, because only
one engine writes. They have to be kept on purpose once six more do.

## What goes into a spec

- An **evidence record** owned by a service spec, written by engines and read by
  the level model — with modality, task type, event kind, strength and sample
  size as first-class, not as later columns.
- The **split of `targetSignal`** into an evaluation signal and an emitted-signal
  set, in the catalogue contract.
- A per-signal statement of **which task types may feed it**, so R9 is enforced by
  the write path rather than remembered by whoever adds the next method.
- The **admission test from S5** as a gate on adding any new evidence type.
- **Reportability tied to standard error** rather than to a fixed observation
  count (R6), including what makes a skill `uncertain` rather than `measured`.
- Where **`/progress` names its sources** per engine instead of stating that only
  card reviews feed it.

## What we reject

- **Writing scheduler grades for reading encounters** (S6). It invents retrievals
  and lapses that did not happen and corrupts the FSRS estimate.
- **An eighth signal for listening** (S2). The quantity exists; the modality tag
  is missing.
- **Minutes practised, words seen, or any count that can only rise** as evidence
  (S5) — already barred from display by
  [`STUDY-023`](STUDY-023-why-it-does-not-feel-productive.md) C3.
- **Pooling one signal across modalities or task types** into a single figure
  (S2, R9). Same name, different measurement.
- **Treating preview coverage as an observation** (S7).
- Chapter-specific rejections appear inline above. Shared catalogue:
  [`STUDY-009-antipatterns.md`](STUDY-009-antipatterns.md).

## Open questions

Implementation questions live in specs (`## Open`), use cases (`## Undecided`),
or [`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md).

- How weak a weak observation is, numerically, and how many substitute for one
  graded retrieval — if any number does. Belongs with the evidence spec.
- Per-language calibration of the listening coverage bands (E4's table is
  cross-linguistic and graded `[C]` for the mechanism).
- Whether an encounter may influence **card selection** without influencing
  memory state, and whether the learner is told when it does.
- Speaking and writing evidence — production quality is the only layer-1 quantity
  for both ([`STUDY-003`](STUDY-003-level-model.md)) and no built method emits it
  yet.

## Related

- [`STUDY-003-level-model.md`](STUDY-003-level-model.md) — the three layers, the
  seven signals, skill statuses, honesty rules
- [`STUDY-002-evidence.md`](STUDY-002-evidence.md) — E1 retrieval, E3 recognition
  versus recall, E4 coverage bands per modality
- [`STUDY-024-readiness-and-difficulty.md`](STUDY-024-readiness-and-difficulty.md) —
  R5 band by purpose, R6 standard error, R8 frequency-weighted, R9 task type
- [`STUDY-055-after-read-word-taps.md`](STUDY-055-after-read-word-taps.md) — the
  reading surface case that raised this
- [`STUDY-005-input-reading-listening.md`](STUDY-005-input-reading-listening.md) —
  tapping layers and the delay rule
- Normative contracts: [`specs/README.md`](../specs/README.md)
