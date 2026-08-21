# UC-032 — Reach the next vocabulary milestone, and know what it buys

<!-- id: UC-032 -->
<!-- specs: SPEC-service-frequency-blocks, SPEC-feature-words-home -->

**Who:** any learner past the first weeks.
**Wants to:** work toward a block of vocabulary that is worth having, and know
in advance what it will actually change.
**So that:** effort is spent where it pays, and the point where returns fall off
is not a nasty surprise.

Derived from
[`../study/STUDY-017-milestones-and-map.md`](../study/STUDY-017-milestones-and-map.md).

## Today

Vocabulary is presented as an infinite list. Nothing tells the learner that the
first thousand words carry most of ordinary text while the seventh thousand adds
almost nothing — so early progress feels smaller than it is, and later progress
feels like failure rather than arithmetic.

## Success looks like

- Vocabulary is grouped into frequency blocks, each showing how many of its
  words the learner knows **stably** — not how many cards they have seen.
- Each block states its **marginal** payoff: how many coverage points it adds,
  and roughly what that means for understanding ordinary text.
- The next block's smaller payoff is stated **before** the learner reaches it,
  not discovered afterwards.
- An estimate of remaining effort, in the learner's own recent pace, with the
  uncertainty shown.
- Block boundaries and payoffs are calibrated per language from a real corpus —
  never copied from figures published for another language.
- Reaching a block is an event that is stated once, plainly, and does not expire,
  reset or need defending.

## v1 scope (decided 2026-08-12)

v1 shows **stable-held counts per frequency band** on `/words` — no marginal
coverage payoff, no effort estimate, no completion event. Those need the
coverage calculator (stage 3) and a dated corpus calibration per language.

## Out of scope

Rewards for completing a block, competition on block progress, and treating
blocks as a required order — a learner following their own content will fill
them unevenly, and that is fine.
