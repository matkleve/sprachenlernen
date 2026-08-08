# UC-014 — Hear a difference I currently cannot hear

<!-- id: UC-014 -->
<!-- specs:  -->

**Who:** a learner whose native language does not separate two sounds the target
language does — for a German speaker learning English, *ship* and *sheep*.
**Wants to:** actually hear the difference.
**So that:** they stop missing those words in speech, stop building a vocabulary
that exists only on paper, and stop being hard to understand for a reason nobody
ever explained to them.

Derived from
[`../studie/13-aussprache-hoerwahrnehmung.md`](../studie/13-aussprache-hoerwahrnehmung.md).

## Today

Apps treat pronunciation as a production problem: say a sentence, get a tick or
a cross from unreliable recognition. Nobody trains perception, even though the
evidence for doing so is among the strongest in the field and it needs no speech
recognition at all. The learner is left believing the target speakers talk too
fast.

## Success looks like

- A short screening tells the learner **which** sound contrasts they do not yet
  separate. This is the only pronunciation diagnosis in the product that is
  claimed to be reliable.
- Training is a two-choice identification task with immediate feedback, not
  repetition after a model.
- Every contrast is trained with **many different voices** and many word
  contexts. The number of distinct voices is an enforced minimum, not a
  production convenience — too few and the training does nothing while looking
  identical.
- Progress is shown per contrast, and a contrast that is solved **stops being
  trained** rather than continuing forever.
- Solving a contrast visibly moves the words that contained it: cards that kept
  failing on audio recall should start passing (UC-013).
- Solved contrasts count toward the listening skill in UC-004.
- Nothing here requires the learner to speak or to be recorded.

## Out of scope

Scoring the learner's own pronunciation, accent coaching, phonetic notation as a
subject, and sign language.
