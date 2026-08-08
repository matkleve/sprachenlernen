# Simulated learners

A population of synthetic learners with a **hidden ground-truth memory**, run
against the real modules to find out how the system behaves over months.

Decision and boundaries: [ADR-0008](adr/0008-simulated-learners-as-a-test-harness.md).
Read that first — the rule that this may never be cited as evidence about
learning is the load-bearing part, and it is easy to forget once the output looks
convincing.

This is **not a spec** and has no use case: a learner never wants a simulation.
Code lives in `lib/simulation/`, framework-free like the rest of `lib/`.

---

## The one idea that makes it work

The synthetic learner knows whether it can recall a word. The app does not, and
must estimate it from graded answers alone.

```
   synthetic learner                        the app
   ┌──────────────────────┐                ┌──────────────────────┐
   │ trueStability (days) │  grade only →  │ stability, difficulty│
   │ exponential decay    │                │ FSRS power law       │
   │ ← never read by app  │                │ retrievability(t)    │
   └──────────────────────┘                └──────────────────────┘
                    │                                │
                    └────────► calibration ◄─────────┘
                         predicted vs actually recalled
```

Two properties are deliberate:

- **The truth is hidden.** Nothing in `lib/` outside the simulation may read
  `trueStability`. If it could, the harness would be testing itself.
- **The truth is a different functional family.** The learner forgets
  exponentially, `p = exp(−t / trueStability)`; FSRS uses a power law. Sharing the
  curve would make the scheduler perfect by construction and the calibration test
  meaningless.

## What it can answer

| Question | How |
| --- | --- |
| Does the app's recall estimate track reality? | Bucket predicted retrievability, compare against observed recall in each bucket |
| Does the schedule over-practise? | Interval growth for surviving tasks over the run |
| Can a task get stuck? | Every state's reachability, and dead ends, over thousands of trajectories |
| Does the log stay the source of truth? | Rebuild every task from its log at the end and compare with the live state |
| Is a parameter we invented load-bearing? | Sweep it and watch which outputs move |

## What it cannot answer

Anything about whether a method teaches. The learner's learning rate is a number
we typed in, so any finding of that shape is our own input handed back. See
ADR-0008, rule 3.

It also cannot say anything about **motivation**. A persona's adherence is a
scenario parameter, not a model of a person: "studies four days a week" is an
input for the state machine, never a claim about learners.

## Personas

Adversarial cases, not a representative sample. Each is a fixed set of parameters
with a seeded random stream, so a run is reproducible and a failure is
debuggable.

| Persona | Shape | Exists to catch |
| --- | --- | --- |
| **diligent** | studies daily, honest grades, generous budget | the baseline — anything failing here is broken outright |
| **weekender** | two long sessions a week | whether intervals survive lumpy attendance |
| **trickler** | five minutes a day, tiny budget | a backlog that grows without bound |
| **disappearer** | three weeks on, three weeks off | recovery after a gap, and levels that fall (UC-006) |
| **optimist** | presses "good" almost regardless | grade noise decoupled from true recall |
| **strugglers** | high true difficulty, frequent lapses | suspension, and repair paths that never fire (UC-013) |
| **bailer** | abandons any session past its stated length | sessions that quietly run long |

## Running it

Deterministic by construction: every persona takes a seed, and the same seed
produces the same trajectory. A non-deterministic harness produces flaky tests,
and a flaky test about a memory model gets deleted rather than fixed.

```bash
npm test -- simulation
```

## Rules for extending it

1. **Never read the ground truth from outside the simulation.** If a module needs
   it to pass, the module is wrong.
2. **Never assert a tight numeric bound that depends on invented constants.**
   Assert the property instead — monotonicity of calibration rather than an exact
   recall rate. A bound tuned to today's constants breaks on every change and
   teaches people to widen it.
3. **A new persona needs a sentence saying what it exists to catch.** A persona
   with no target failure is decoration that costs runtime.
4. **When a simulation finds a defect, the fix ships with a unit test too.** The
   simulation says a class of behaviour is wrong; the unit test pins the specific
   case, and it is the unit test that stops the regression.
