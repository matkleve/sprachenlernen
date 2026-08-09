# Method catalogue — acceptance criteria

Split child of [`method-catalogue.md`](method-catalogue.md). The parent owns
scope, behavior and data; this file owns the criteria alone.

Traces to [UC-046](../../use-cases/UC-046-discover-a-method-i-never-tried.md).
Where a criterion exists to stop a specific failure rather than to describe a
feature, the failure is named — a criterion whose reason is lost gets deleted by
the next person who finds it inconvenient.

## Acceptance criteria

### The shipped data

- [ ] AC-1 · Given the eight shipped section files, when they are loaded, then
      the catalogue validates with no errors.
- [ ] AC-2 · Given the shipped presets, when they are loaded, then all seven
      validate.
- [ ] AC-3 · Given the shipped catalogue, when its sections are collected, then
      all eight are present.
- [ ] AC-4 · Given any shipped entry, then its `doesNotDo` is non-trivial.
      *The honest half of the info page is the product's distinguishing claim;
      an entry without it is a recommendation.*
- [ ] AC-5 · Given the shipped catalogue, then at most 67% of entries are
      hosted. *Study 12, thesis 9 asks for about half off-app; today it is 34%,
      so the bound is set tight against the current value rather than at a round
      number. A loose threshold cannot catch the drift it exists to catch: it
      would sit unmoved while hosted methods were added and off-app ones were
      not, which is the vocabulary pull winning slowly.*
- [ ] AC-5b · Given the shipped catalogue, then the evidence grades of
      `background-listening`, `write-and-perform-a-play` and `free-production`
      are the ones the provenance file justifies. *Grade is normative for menu
      ranking until an effect estimate exists, so one hand-raised letter
      promotes an entry over fifty that have a source.*
- [ ] AC-6 · Given the shipped catalogue, then exactly five methods carry a
      floor, with the rates study 12 states. *A floor invented to fill a column
      is a nudge nobody decided on.*
- [ ] AC-7 · Given the shipped catalogue, then at least one entry has evidence
      grade D. *Omitting what learners ask about only produces the question
      again.*

### What is refused

- [ ] AC-8 · Given a method whose `requires` is empty, when it is loaded, then
      it is rejected. *It would match every preset, and the filter the menu's
      ordering rests on would stop separating anything, silently.*
- [ ] AC-9 · Given a method requiring a dimension that does not exist, or a
      value a dimension does not have, when it is loaded, then it is rejected.
- [ ] AC-10 · Given a commitment carrying a duration, an intensity, a floor or a
      context, when it is loaded, then it is rejected. *A commitment with a
      duration is a session, and it acquires the completion tracking A1 forbids.*
- [ ] AC-11 · Given an entry with an empty `doesNotDo`, when it is loaded, then
      it is rejected.
- [ ] AC-12 · Given two entries sharing an id, when they are loaded, then the
      second is rejected and the error names the id.
- [ ] AC-13 · Given a `targetSignal` outside the seven layer-1 signals and not
      `null`, when it is loaded, then it is rejected.
- [ ] AC-14 · Given durations that are not strictly ascending, when they are
      loaded, then they are rejected.
- [ ] AC-15 · Given data with several problems, when it is loaded, then every
      problem is reported, not the first. *Fixing data one error per run is how
      a bad file survives.*
- [ ] AC-15b · Given a method carrying `reviewAfterDays`, an empty list of
      requirement alternatives, two files declaring one section, or two presets
      sharing an id, when loaded, then each is rejected.

### Filtering by context

- [ ] AC-16 · Given any shipped preset, when the catalogue is filtered by it,
      then at least one method is offered. *Including the kitchen: eyes and
      hands gone, voice free, forty-five minutes. An app that only knows touch
      exercises has nothing for the most productive part of the day.*
- [ ] AC-17 · Given a context whose eyes are occupied, when filtering, then
      methods requiring free eyes are absent and audio-and-voice methods remain.
- [ ] AC-18 · Given one context varied **only** in its time budget, when
      filtering, then a method is present at budgets its shortest variant fits
      and absent below them. *Isolated on purpose. The first version compared
      two presets that also differed in surface and attention, so deleting the
      budget comparison altogether changed no assertion — the criterion could
      not detect its own rule being removed.*
- [ ] AC-18b · Given a method with alternative requirement sets, when filtering,
      then it is offered wherever any one set fits. *The SRS session is "touch
      or voice"; as a single set it loses the voice half and the only method
      with a daily floor becomes unofferable in four of seven presets.*
- [ ] AC-19 · Given a bounded budget, when filtering, then methods with no fixed
      length are absent; given an open block, they are present.
- [ ] AC-20 · Given any context, when filtering, then no commitment is returned,
      and commitments remain reachable separately. *"Does this fit your context"
      has no answer for a standing rule.*
- [ ] AC-21 · Given a context with company, when filtering, then methods
      requiring people are offered that were not offered alone.
- [ ] AC-22 · Given a method that does not fit, then it is absent from the
      result rather than marked. *A method that cannot be performed has an
      effect of zero and does not belong in the menu, not even greyed out.*

### Pinned defects

These assert that something is currently **wrong**, so that it stays visible and
cannot spread. Each is discharged by a decision, not by a fix here.

- [ ] AC-23 · The shipped presets are study 21's seven, in its order, and the
      kitchen still reads eyes occupied, hands none, voice aloud, forty-five
      minutes. *Nothing else asserted a preset value; the kitchen could have
      become eyes-free and the suite would have passed, deleting the one context
      the chapter singles out as the hard case.*
- [ ] AC-24 · Exactly one method — *translate a song* — is reachable from no
      preset under any company setting. *A list, not a threshold: it names what
      is broken and fails when anything joins it.*
- [ ] AC-25 · Cooking from a recipe is not offered in the kitchen. *Chapter 21
      gives it the context "kitchen" and defines the kitchen as eyes and hands
      gone. Resolving that either way here would be inventing a rule.*
- [ ] AC-26 · The SRS session is offerable in every preset except *in bed*.
      *Where study 21's own values — nothing to write on, quiet — exclude both
      halves of "touch or voice".*
