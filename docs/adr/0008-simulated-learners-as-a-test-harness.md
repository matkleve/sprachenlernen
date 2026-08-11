# ADR-0008 — Simulated learners as a test harness, never as evidence

**Status:** accepted · 2026-08-08
**Context:** [`../SIMULATION.md`](../SIMULATION.md),
[`../study/26-readiness-and-difficulty.md`](../study/26-readiness-and-difficulty.md)

## Context

This product's central claim is that it **measures** a level rather than
asserting one ([`../study/03-level-model.md`](../study/03-level-model.md)). That
claim cannot be checked against real learners for months, and the failure modes
that matter — a skill stuck at "not measured" forever, a level that falls
spuriously, a menu with no legal composition, a schedule that over-practises —
appear over months rather than in a unit test.

The user proposed running on the order of a thousand synthetic learners with
forgetting, preferences and something like deliberation through the system.

The proposal is sound, and it has one trap serious enough to need an ADR: a
simulated learner's learning is **whatever we programmed**. Type in "dictation
raises audio recall" and the simulation will report that dictation raises audio
recall, in charts indistinguishable from findings. That is the same
self-confirming loop as inferring method effectiveness from usage data
([`../study/12-method-cards.md`](../study/12-method-cards.md)) — and the
literature on reinforcement learning for instructional sequencing is full of
policies that beat baselines against simulated students and then fail with real
ones.

## Decision

**We build the harness, and we bound what it may claim.**

1. **The simulated learner's true memory is hidden from the app.** The synthetic
   learner keeps its own ground-truth recall state; the scheduler and every other
   module see only graded answers. This is what makes the harness informative
   rather than circular: we can measure how far the app's *estimate* drifts from a
   truth we know.
2. **The truth model is deliberately a different functional family from the
   app's.** The synthetic learner forgets exponentially; FSRS uses a power law.
   Sharing the curve would make the scheduler trivially perfect and the test
   worthless.
3. **Simulation output may never be cited as evidence about learning.** Not in
   `study/`, not in a spec, not in the product. It is evidence about **the
   system**: state machines, arithmetic, calibration of an estimate against a
   known truth, and the presence or absence of dead ends.
4. **No selection or scheduling policy is tuned against the simulation.** Using it
   to *find* a failure is correct; using it to *optimise* a policy reproduces a
   documented failure of the field.
5. **It is not a spec, and it gets no use case.** A learner never wants a
   simulation. It is operator tooling, and
   [`../use-cases/README.md`](../use-cases/README.md) already says operator tasks
   are not use cases. Its contract lives in
   [`../SIMULATION.md`](../SIMULATION.md).
6. **Personas are scenario parameters, not claims about people.** "The learner who
   declines every floor" is an adversarial input for the state machine. It is not
   a finding about learners, and no persona's distribution is presented as
   representative.

## Consequences

**Good.** The measurement claim becomes testable before the first real user. Long
horizons cost milliseconds. The adversarial cases the spec culture already cares
about — every state reachable, no dead ends, no absence stated twice — become
executable assertions rather than review questions. And parameters we admitted we
invented (bands, thresholds, exploration share) get sensitivity ranges instead of
a shrug.

**Bad.** A convincing simulation is a persuasive artefact, and rule 3 is the only
thing standing between it and a chart in a study chapter. That rule will be
tested the first time somebody wants a number they do not have.

**Also:** the harness has a hard dependency on the modules it exercises being
pure functions of their inputs. Today only the scheduler qualifies, so that is
where it starts. This is an argument for keeping menu composition and the
coverage calculator pure when they are written — which
[`../study/12-method-cards.md`](../study/12-method-cards.md) already asks for.

## Alternatives considered

**Waiting for real users.** Honest, and it defers every long-horizon question past
the point where fixing it is cheap. The measurement claim would ship unverified.

**Replaying real review logs instead.** Better evidence and unavailable: there are
no users. It is the right thing to add *later*, and it does not substitute,
because a real log has no ground truth to compare an estimate against.

**A statistical model of learners rather than agents.** Cheaper, and it cannot
express the thing we most need to test: sequences of decisions over time,
including declining, disappearing for three weeks, and coming back.
