# 23 · How an exercise runs

Everything before this chapter decides **what** to practise. This one is about
what happens once the learner has said yes — the shape of a single exercise from
"get your paper" to "here is what you got wrong, want it as cards?".

The model comes from the user, and from an unlikely place: modern cooking apps.

---

## What cooking apps got right

Open a good recipe app and you get, in order: the ingredients as a **checklist**
you tick off as you assemble them; then **one step per screen**; a **timer you
can start inside the step** when something needs to sit; and the ability to
**swipe back and forth** while that timer keeps running.

The detail that matters most is the smallest one:

> **Swiping past a step does not mark it done.** Navigation and completion are
> separate actions.

That is not a UI nicety. It is the same principle this study applies to
listening with a translation visible ([05](05-input-reading-listening.md)) and to
recognition versus recall ([02](02-evidence.md), E3): **passing through
something is not evidence of having done it.** A product that counts screens
seen as work performed is lying to its own measurements — and this one derives a
competence level from those measurements.

---

## The six kinds of step **[D]**

> **Refined 2026-08-17.** *Check* split into **Submit** (hand in work) and
> **Review** (compare, correct, feedback). Spec:
> [`specs/feature/exercise-runner.md`](../specs/feature/exercise-runner.md).

| Step | What it is | Example |
| --- | --- | --- |
| **Prepare** | A checklist of what the exercise physically needs | Paper and pen · headphones · somewhere you can speak aloud |
| **Do** | One task, one screen | "Write for five minutes about your day" |
| **Wait** | A timer belonging to the step, not to the screen | The five minutes; the pause between dictation readings |
| **Submit** | Hand in the work product — photo and/or typed text | Photograph the handwritten dictation; paste from the editor |
| **Review** | Compare, mark errors, or show feedback | The dictation key; side-by-side diff; correction comments |
| **Decide** | An offer, never an automatic action | "Add these six errors as cards, or explain one of them first?" |

Not every exercise has all six. A card session is one long **Do**. A dictation
is Prepare → Do → Wait → Do → Submit → Review → Decide. Free writing adds
Submit (photo) before Review (feedback). The point is that the shape is
declared, so the runner is one component rather than a bespoke screen per
method — which matters when the catalogue holds sixty of them
([21](21-method-catalogue-and-context.md)).

### Prepare is where the context model becomes real

[21](21-method-catalogue-and-context.md) says a method declares what it needs.
The **Prepare** step is that declaration, shown to a human: *paper and pen ·
headphones · a place you can speak.* Tick them off, or press on regardless.

It also solves a small problem that quietly kills paper exercises: people start
them, discover they have no pen, and stop. Naming the requirements before the
work begins costs one screen and saves the exercise.

---

## Progress is not completion

**[D]** Two separate states per step, and they must never be merged:

| | Means | Set by |
| --- | --- | --- |
| **Seen** | The learner navigated here | Swiping, scrolling, arriving |
| **Done** | The learner says they did it | An explicit tick |

Consequences, all deliberate:

- A learner can swipe through an entire exercise and finish with nothing marked
  done. The app records exactly that: an exercise looked at, not performed.
- **Only `done` feeds the level model.** Seen is for the interface; done is
  evidence ([03](03-level-model.md), level 1).
- Marking done is one tap and never confirms twice. Friction here is not
  seriousness, it is just friction.
- Nothing is auto-ticked by a timer running out. A timer says how long, not
  whether.

This is the same distinction as reveal level in listening: *how* something was
done changes what it proves, so it is recorded rather than flattened.

---

## Timers belong to the step

If a step needs five minutes, the timer is part of the step and keeps running
while the learner looks at the next screen, checks a word, or answers a message.
It is not a modal that traps them.

Three rules **[D]**:

1. **Visible from anywhere in the exercise**, small, without demanding
   attention.
2. **Running out is an event, not a verdict.** "The five minutes are up" — the
   learner decides whether to stop.
3. **Pausing is allowed and recorded.** Elapsed time matters for the effect
   estimate ([12](12-method-cards.md)); a paused timer that silently kept
   counting would corrupt it.

---

## The end of an exercise: an offer, not a report

The user's example is exactly right, so it is the specimen:

> Write for five minutes about how your day was. Photograph it. Let me correct
> it. — Here are the mistakes. Would you like me to add them to your cards, or
> explain one of them properly first?

Three things make that work, and all three are rules rather than wording:

**It offers, never acts.** Errors do not silently become cards. The learner
chooses, because a card they did not agree to is a card they will resent for
months ([04](04-flashcards-srs.md), the leech trap).

**It offers exactly two things.** Take them, or understand one first. A menu of
six options at the end of an exercise is a second exercise.

**It ends.** Declining is a complete outcome. Nothing is queued, nothing is
carried forward, nothing appears tomorrow as a reminder that you said no.

### The photo, and a correction to an earlier decision

F69 previously read "no photo recognition — it hangs the idea on a technology it
does not need". That was right for **dictation**, where the learner compares
against a known answer and self-correction is both sufficient and better
([07](07-offline-and-paper.md)).

It is wrong for **free writing**. There is no key to compare against; correction
is the whole point, and a photograph is by far the least tedious way to get
handwriting into the app. The two cases were collapsed under one feature number.
Now separated: photo-for-self-marking stays out, photo-for-correction goes in.

---

## Unobtrusive, but sometimes insistent

The user's phrasing — *"unobtrusive, but sometimes with the weight of importance"* — is
the whole tone of the product in six words, and the machinery for it already
exists:

| | Mechanism |
| --- | --- |
| Unobtrusive by default | Offers, not actions. One prompt at the end, not three. Declining ends it |
| Clear when it matters | The **floor** ([12](12-method-cards.md)) — stating its reason from the learner's own data, offering a shorter version before accepting no, capped at one prompt a day. "No" ends it |

The cap is what makes it credible. A system that is emphatic about one thing a
day is heard. A system that is emphatic about four is muted. What the cap does
*not* buy is the right to insist: the floor governs how often something is
offered, never whether the learner has to accept it
([12](12-method-cards.md), corrected 2026-08-08).

---

## "Hard is allowed, too hard achieves nothing"

The user's closing line, and it names a real boundary that the study had only
implied.

Difficulty helps **when the effort still succeeds**. A retrieval attempt that
has no chance of landing is not desirable difficulty, it is wasted effort — this
is already why brand-new cards start with recognition rather than production
([02](02-evidence.md), E3), and it is exactly what the 95–98 % coverage band
quantifies for input ([02](02-evidence.md), E4). Below that band, comprehension
collapses and nothing is learned from the attempt.

So the same principle has three faces in this product, and it is worth stating
once:

| Area | The band |
| --- | --- |
| Cards | Hard enough to require retrieval, staged so retrieval can succeed |
| Input | 95–98 % of words known |
| Exercises | Demanding, but with the preparation, the support rung and the time it actually needs |

**[D] Practical rule for the runner:** if a learner marks the same exercise
abandoned twice in a row, the app offers a shorter or better-supported variant —
**once**, and without commentary. Repeated failure to finish is information
about the fit, not about the person.

---

## What goes into a spec

Shipped as [`specs/feature/exercise-runner.md`](../specs/feature/exercise-runner.md)
(2026-08-17):

- Six step types; **step components** per type — full catalogue in
  [`specs/service/exercise-step-components.md`](../specs/service/exercise-step-components.md);
  per-Method mixes in
  [`specs/service/exercise-recipe-composer.methods.md`](../specs/service/exercise-recipe-composer.methods.md).
- Per-step status: `unseen → seen → done` (+ `skipped` later). See
  [`../STATE.md`](../STATE.md) — `seen` is not completion.
- Recipe as **data**: ordered steps, so a new method is configuration not a new
  screen ([21](21-method-catalogue-and-context.md)).
- Timer ownership, pause, expiry — in
  [`exercise-runner.states.md`](../specs/feature/exercise-runner.states.md).
- Interruption: leaving mid-exercise loses nothing and creates no backlog
  ([06](06-production.md) and UC-006's rule applies here too).
- **⚠ SPEC GAP:** whether an exercise abandoned halfway counts partially toward
  the level model, or not at all. Both are defensible; guessing would put an
  invented rule into the measurement.
