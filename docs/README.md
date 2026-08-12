# Documentation

Start at [`../AGENTS.md`](../AGENTS.md). Everything here is what it links to.

## "I want to…"

| | Read |
| --- | --- |
| …understand what this product is and why | [`study/`](study/) |
| …know what to build next, and who may build it | [`IMPLEMENTATION-PLAN.md`](IMPLEMENTATION-PLAN.md) |
| …park a mechanism someone noticed elsewhere, before it's a use case | [`IDEAS.md`](IDEAS.md) |
| …understand how work flows here | [`WORKFLOW.md`](WORKFLOW.md) |
| …avoid the mistakes we keep making | [`AGENT-PITFALLS.md`](AGENT-PITFALLS.md) |
| …find out what happened last session | [`diary/`](diary/) |
| …write a spec | [`SPEC-FORMAT.md`](SPEC-FORMAT.md) → `npm run new:spec` |
| …build anything with states | [`STATE.md`](STATE.md) |
| …build a UI element | [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md) |
| …know where a file goes | [`ARCHITECTURE.md`](ARCHITECTURE.md) |
| …add a database | [`BACKEND.md`](BACKEND.md) |
| …support more than one language | [`I18N.md`](I18N.md) |
| …name something | [`GLOSSARY.md`](GLOSSARY.md) |
| …understand why my fix isn't working | [`TRAPS.md`](TRAPS.md) |
| …test behaviour that only appears over months | [`SIMULATION.md`](SIMULATION.md) |
| …know what I'm not allowed to do | [`CONSTITUTION.md`](CONSTITUTION.md) |
| …record or find a decision | [`adr/`](adr/) |

## Layout

```
docs/
  study/            the research this product is derived from
  CONSTITUTION.md    non-negotiables — outranks everything
  IMPLEMENTATION-PLAN.md  the code queue — what is next and who may do it
  IDEAS.md           raw mechanisms, not yet a use case — status: unevaluated/graduated/rejected
  WORKFLOW.md        pipeline, change classes, DoR/DoD, acceptance criteria
  SPEC-FORMAT.md     how to write a spec
  ARCHITECTURE.md    layers and dependency direction
  STATE.md           state machines and the coherence contract
  DESIGN-SYSTEM.md   tokens, interaction states, ownership, motion
  BACKEND.md         adding a database — the optional module
  I18N.md            one language to many — the staged path
  SIMULATION.md      synthetic learners with a hidden ground truth (lib/simulation/)
  GLOSSARY.md        canonical terminology
  TRAPS.md           bugs that looked correct        ← how the CODE misleads
  AGENT-PITFALLS.md  recurring collaboration failures ← how the WORK misleads
  diary/             YYYY-MM-DD — what happened, what was decided
  adr/               architecture decision records
  use-cases/         UC-NNN — what people are trying to do
  specs/             implementation contracts (source of truth)
    component/  feature/  page/  service/
```

### Three kinds of memory

They are separate because they are consulted at different moments, and merging
them means each gets read at the wrong time or not at all.

| | Answers | Read when |
| --- | --- | --- |
| **specs/** | what it *should* do | before building |
| **diary/** | what happened and what was decided | before resuming an area |
| **TRAPS / PITFALLS** | how this misleads people | before your second attempt |
| **IDEAS.md** | what someone noticed, not yet checked against a goal | when triaging the backlog, before writing a use case |

A lesson is *noticed* in the diary and *promoted* to a trap, a pitfall, or a
spec — somewhere a reader is required to look. A rule that lives only in a diary
entry will be missed.

## The chain

```
use case  ──serves──►  spec  ──verified by──►  test
 UC-001                SPEC-…                  npm test
```

Both directions are checked by `npm run check:specs`. A spec with no use case is
a solution looking for a problem; a use case with no spec is an unkept promise.

## Rules for this folder

- **One owner per rule.** If a sentence is normative, it lives in exactly one
  file. Everywhere else links to it.
- **Delete aggressively.** A doc that describes code that no longer exists does
  more damage than no doc — people trust it.
- **Docs change in the same commit as the code they describe.** Not the next one.
