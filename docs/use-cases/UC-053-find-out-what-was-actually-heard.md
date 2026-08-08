# UC-053 — Read something aloud and find out what was actually heard

<!-- id: UC-053 -->
<!-- specs:  -->

**Who:** someone reading a text aloud, doing a 4/3/2 round, or practising a
phrase they keep getting wrong.
**Wants to:** know which words came out recoverably and which did not.
**So that:** a method that was previously unmeasurable produces something they
can act on — without being graded.

Derived from
[`../study/24-speaking-as-the-goal.md`](../study/24-speaking-as-the-goal.md)
S5–S6.

## Today

Apps that listen give a score: a percentage, a green tick, "good pronunciation".
Machines are worst at exactly the dimension those scores claim to measure — no
current audio model reaches human level on intelligibility, comprehensibility or
accentedness, and human raters agree with each other only moderately. A confident
wrong score teaches the error and damages trust in every other number the app
shows.

## Success looks like

- Because the text is known, the comparison is against **ground truth**: what was
  read versus what the recogniser transcribed, aligned word by word.
- The result is shown as **what the machine heard**, with the divergent words
  marked — a concrete claim the learner can immediately judge for themselves.
- **No score, no band, no "good/bad".** Nothing is expressed as a rating of the
  person.
- A mismatched word can become a card, or a contrast for perception practice
  ([UC-014](UC-014-hear-a-difference-i-cannot-hear.md)).
- When the recogniser is simply wrong, that is obvious from the transcript, and
  saying so costs one tap and feeds
  [UC-023](UC-023-report-something-wrong.md).
- A live **input indicator** during recording shows whether the microphone is
  picking the person up — a statement about the device, never about the speaker.
- Audio is processed for this purpose and not retained beyond it unless the
  learner keeps it.

## Out of scope

Pronunciation grading, accent scoring, phoneme-level diagnosis, and any
comparison with a native reference recording.
