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
- [ ] AC-5 · Given the shipped catalogue, then fewer than three quarters of
      entries are hosted. *Study 12, thesis 9: about half the catalogue happens
      outside the app. If this ratio climbs, the vocabulary pull has won and the
      catalogue has become the app's feature list.*
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

### Filtering by context

- [ ] AC-16 · Given any shipped preset, when the catalogue is filtered by it,
      then at least one method is offered. *Including the kitchen: eyes and
      hands gone, voice free, forty-five minutes. An app that only knows touch
      exercises has nothing for the most productive part of the day.*
- [ ] AC-17 · Given a context whose eyes are occupied, when filtering, then
      methods requiring free eyes are absent and audio-and-voice methods remain.
- [ ] AC-18 · Given a two-minute budget, when filtering, then every method whose
      shortest variant exceeds it is absent.
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
