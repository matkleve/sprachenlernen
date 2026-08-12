# 26 · Readiness, difficulty, and who decides what

The user's question, in three parts: *how do we measure real progress and raise
difficulty accordingly? Is there a system behind A1/A2 with sub-metrics we can
use? And — you have to be able to do the plural forms, don't you?*

The third part is the one that decides the chapter. Yes. So the question is never
*whether* a learner must reach a form, only **how the app gets them there** — and
there are two candidate answers with very different evidence behind them.

---

## The load-bearing decision **[D — user decision, 2026-08-08]**

> **The learner chooses the method. The app chooses what goes inside it.**
>
> Every method, always, with a reason attached and never a lock. Content and its
> timing — which words, which paradigm cells, which text, and when each returns —
> are the app's job. And when the learner asks for content explicitly ("give me
> subjunctives today"), that wins too: the app's steering is the **default, not a
> veto**.

Everything below is either support for that split or a failure mode of the
alternative. The alternative — gating a method on a sub-metric threshold — is what
the rest of this chapter rules out.

**Why the split is not a compromise.** Gating and targeting aim at the same
outcome, and only one of them reaches it. Gate the plural forms behind a
threshold and the learner waits; waiting teaches nothing. Target them — plural
items weighted into the card mix, plural cells as the focus of the paradigm
drill, sentence-building tasks that need them — and the learner practises the
plural forms. R4 below is why this is not merely faster but categorically
different: the mechanism that fixes a form is attempting it and being corrected,
which the gate postpones and the target schedules.

---

## R1 · Developmental readiness is a real finding **[B/C]**

Pienemann's **Teachability Hypothesis**, out of Processability Theory, holds that
instruction on a structure is effective only when the learner's processing
capacity has reached the stage that structure requires. Teach it earlier and it
does not take. That is the user's intuition, published, and decades old.

The limits matter as much as the finding: it was developed on German word order
and English morphosyntax, its stages are language-specific, its predictions are
stronger for syntax than for the inflectional morphology at issue here, and the
emergence criterion it rests on is contested.

> **Product sentence:** readiness is a legitimate concept. It licenses saying
> *"this works better later, and here is why"*. It does not license a threshold,
> because the theory gives stages, not cut-offs.

---

**Addendum 2026-08-11 — what this does not say.** Processability constrains what
**production** instruction can install, not what a learner may be **exposed** to.
An unready learner still profits from meeting a form receptively. So readiness
may de-prioritise a form for production practice; it may never remove it from
input. Stated because the chapter is otherwise read as forbidding both.

## R2 · The architecture wanted here exists — and it is not CEFR **[A/B]**

Fine-grained skill estimates steering what comes next is the best-evidenced
adaptive architecture in education, and it has a name: **knowledge components**
with **knowledge tracing** (Corbett & Anderson 1995), as deployed in the
Cognitive Tutors. VanLehn's 2011 review places step-based intelligent tutoring at
d ≈ 0.76 against human tutoring's d ≈ 0.79.

So "sub-metrics driving difficulty" is not a fantasy. It is a mature tradition —
from mathematics and physics instruction, not from second-language morphology,
and that transfer is unproven.

> **Product sentence:** the model to borrow from is the knowledge component, not
> the CEFR sub-level. What we call a **paradigm cell** is a knowledge component
> under another name, which is why [03](03-level-model.md) measures over cells.

---

## R3 · There is no psychometric substructure under A2 **[B]**

The CEFR descriptors were scaled with Rasch analysis of **teachers' judgments**
of difficulty, not of learner performance data — the standing critique associated
with Fulcher and Alderson. The per-language inventories underneath (the *Plan
Curricular del Instituto Cervantes*, the *Profilo della lingua italiana*) are
expert inventories, not measurement models, and both are licensing-constrained.

> **Product sentence:** no sub-metric may be presented as a requirement for a
> CEFR band, because no mapping specific enough to support one exists. The
> inventories calibrate our bands; they are never republished as requirements.

---

## R4 · Errors with feedback are the yield, so avoiding failable items deletes the value **[A]**

The sharpest objection, and it is internal: it contradicts
[02](02-evidence.md) E1, E6 and E13.

Unsuccessful retrieval followed by feedback beats studying alone (Kornell, Hays &
Bjork 2009). Metcalfe's 2017 review of learning from errors concludes that
error-free practice is the wrong target for healthy learners, and the
**hypercorrection effect** (Butterfield & Metcalfe 2001) finds confidently-held
errors are the best corrected of all.

So a readiness filter that avoids items the learner would get wrong optimises for
smoothness — the misinterpreted-effort illusion of
[25](25-why-it-does-not-feel-productive.md) P2, implemented by the product on the
learner's behalf rather than committed by the learner.

E3's own caveat marks the real line: *"a failed attempt with no chance of
retrieval is wasted effort."* Not *no chance of success* — no chance of
**retrieval**. An item that can be attempted and failed is valuable. An item with
no plausible route to an answer is noise. Those are different sets, and
collapsing them is the commonest way to build a comfortable, ineffective app.

> **Product sentence:** material selection excludes only what cannot be
> **attempted**, never what would be failed. When a method's purpose is form
> mastery, the weak cells are the **target**, not the exclusion.

---

## R5 · Coverage is a comprehension threshold used as a learning dial **[A] finding, **[D]** consequence

E4's 95/98 % table is about comprehensibility. Incidental acquisition, however,
requires unknown words to be present: a thousand-word text at 98 % contains
around twenty unknown tokens, at 95 % around fifty. Learning opportunities per
text rise as coverage falls, and comprehension falls with them. The two cannot be
maximised together.

The consequence is uncomfortable and specific: *"raise difficulty as vocabulary
grows"* holds the learner at a **constant comfort level** and calls it
progression. That is chapter 25's treadmill, rebuilt from the inside by a
well-meaning difficulty controller.

Nation's own framing already contains the resolution — roughly 98 % for
unassisted pleasure reading, roughly 95 % for instructed reading with support.
Different purposes, different bands.

> **Product sentence:** a band is chosen by a method's **purpose**, written down
> once per method, and never tuned toward what feels smooth. Where a method exists
> to produce learning opportunities, the lower band is correct even though it
> feels worse.

---

## R6 · A threshold on a sparse estimate is a decision made on noise **[B]**

[12](12-method-cards.md) already accepts this argument for the effect estimate —
"with one user the effect estimate is noise for months". Per-cell mastery is a
**finer partition of the same thin data**, so it is noisier for longer. A Spanish
or Italian verb spans fifty-plus cells; chapter 12's own figure is roughly 200
sessions a year across ten methods. Observations per cell stay in single digits
for a long time, and a gate that turns on three observations turns on chance.

Thresholds are also systematically **mis-set**, not merely noisy. Cen, Koedinger
& Junker (2007) found mastery thresholds in a deployed Cognitive Tutor produced
substantial over-practice; refitting the skill model cut practice time by around
12 % with no loss of outcome — in a system with orders of magnitude more data per
skill than we will ever have.

> **Product sentence:** no cell-level figure is reportable, and no decision rides
> on it, until it survives its own standard error. The same discipline the effect
> ledger already accepted, applied to the finer quantity.

---

**Addendum 2026-08-11 — the scope of this argument.** R6 is about **adaptive**
thresholds computed from noisy per-cell estimates, and against those it holds. It
does **not** bear on a fixed, non-adaptive, learner-visible introduction order,
which reads no estimate and therefore carries none of the noise problem. As
written the chapter has been read as forbidding both; only the first is meant.

## R7 · Hand-authored prerequisite orders are usually wrong **[B]**

The same literature that supports knowledge tracing also finds expert-authored
skill models frequently mis-specified, with data-driven refinement improving fit.
And morpheme-order research (Dulay & Burt onward) holds that acquisition order is
partly fixed and not freely rearranged by instruction — so a hand-written "this
before that" has a real chance of contradicting the order the learner will follow
regardless.

> **Product sentence:** a recommended order is advice with a reason, revisable,
> and never a structure the learner cannot step out of — which is also what
> [10](10-antipatterns.md) A8 already requires.

---

## R8 · A fraction invites completion, and completion is the wrong goal **[D]**

"3 of 10" reads as a set to finish. But paradigm cells are wildly unequal: the
first-person singular present earns its practice thousands of times more often
than the second-person plural subjunctive. A display shaped like a completion
fraction pulls effort toward **what is left** rather than **what pays**, by
design — a Goodhart failure built into the geometry of the widget rather than into
anyone's intent.

> **Product sentence:** anything shown at cell granularity is frequency-weighted,
> never counted. And no goal may be set on a sub-metric: it exists to explain a
> level, not to be pursued.

---

## R9 · A recognition metric cannot gate a production method **[A/B]**

Transfer-appropriate processing (Morris, Bransford & Franks 1977) and E3's own
~20 % overestimate of recognition against recall both say a plural score measured
on cloze or multiple-choice items licenses no claim about free production.

> **Product sentence:** a signal states the task type it was measured on, and no
> claim crosses from receptive evidence to productive competence.

---

## So how does difficulty actually rise?

Not by anybody setting it. There is no difficulty control, and no level acts as
one — [03](03-level-model.md) is a display, not a controller. Three dials move on
their own as the learner's holdings change:

| Dial | Rises because | Governed by |
| --- | --- | --- |
| **Input** | more words known → more texts clear the band, and those texts are harder in absolute terms | E4, R5 |
| **Cards** | intervals stretch as recall stabilises, and the card type escalates from recognition to production | E2, E3 |
| **Forms** | the cell mix shifts toward cells not yet held, weighted by frequency | R2, R8 |

None of the three is a level, and none of them is a gate.

## And how is a method tested?

Three tiers of confidence, and the app says which one it is on:

1. **What the research says.** Available immediately, identical for everyone, no
   data required — the **[A]**–**[D]** grade and the mandatory "what this does not
   do". On day one this is all there is, and saying so is the honest alternative
   to implying personal knowledge.
2. **Did it move the one signal it is for.** Each method is judged on a narrow
   target signal, never on the overall level ([12](12-method-cards.md)). Narrow
   question, far less noise, answerable in weeks.
3. **Does it work for this person.** Usually not knowable with confidence, for
   the reasons in [12](12-method-cards.md). Two guards make it less hopeless: an
   exploration share, so the estimate has causal footing, and uncertainty shown
   with every personal figure.

And the rule underneath all three, from E13: **a thumbs-up never decides whether
a method exists.** Preference keeps a method on the menu; only measured effect
promotes it.

---

## What goes into a spec

- **Readiness as three states** — ready · better later · no material yet — where
  the third means the app can construct nothing, not that permission is withheld.
  Never hides a method, never blocks one. UC-057 to UC-059.
- **One documented band per method**, chosen by purpose, with the quantity named
  (and therefore the lemma-versus-form question in UC-060 answered).
- **Material selection excludes only the unattemptable**, and targets weak cells
  when the method's purpose is form.
- **Frequency-weighted cell displays**, with a reportability floor tied to
  standard error rather than to a fixed count.
- **⚠ SPEC GAP:** what a cell-level estimate is computed from — stability,
  successful retrievals, or share correct on a tested set. R6 says whichever it
  is, it needs an error term before anything reads it. UC-064 records this as the
  quantity every other decision here inherits.
- **⚠ SPEC GAP:** whether "no material yet" is visible or absent, given that the
  context filter removes unperformable methods entirely. UC-059.
