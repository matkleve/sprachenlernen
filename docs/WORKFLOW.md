# Workflow — from idea to shipped code

One loop, eight stages, explicit pass/fail at each one. You go around it once
per **thin slice**, not once per feature. Nothing advances until the current
stage's exit gate is true.

```
                 ┌──────────── 8 · Learn ◄─────────────┐
                 ▼                                     │
0 · Intake → 1 · Shape → 2 · Specify → 3 · Plan → 4 · Tasks
                            → 5 · Implement → 6 · Verify → 7 · Ship
                 ▲            (DoR gate)                  (DoD gate)
```

| Stage | Question | Exit gate |
| --- | --- | --- |
| **0 · Intake** | Is this worth doing? | One sentence of user value + a change-class guess |
| **1 · Shape** | Is it ready to build? | Passes **Definition of Ready** below |
| **2 · Specify** | What should happen? | A spec exists with testable acceptance criteria |
| **3 · Plan** | How, and what's touched? | File map + reuse decision + one named runnable check |
| **4 · Tasks** | What are the slices? | Thin vertical slices, each independently verifiable |
| **5 · Implement** | Build it | Code matches spec; `npm run verify` green |
| **6 · Verify** | Does it *really* work? | Acceptance criteria demonstrated with evidence |
| **7 · Ship** | Done-done? | Passes **Definition of Done** below |
| **8 · Learn** | What did we miss? | Feedback → spec updated in the *same* session |

The two most common ways this goes wrong: skipping stage 1 (half-baked work
enters the pipeline and gets reworked), and treating stage 6 as "it builds".

---

## Definition of Ready

A work item may enter stage 2 when **all** of these are true:

- [ ] **User value** in one sentence — "a *\<who\>* can *\<do what\>* so that *\<why\>*".
- [ ] **Scope boundary** explicit — what's in, and what is deliberately out.
- [ ] **Change class** declared (Trivial / Standard / Sensitive — see `AGENTS.md`).
- [ ] **Acceptance criteria** written and testable — behavior, not implementation.
- [ ] **Dependencies named** — the data, components and services it touches,
      verified by reading them, not guessed from the prompt.
- [ ] **Open questions** resolved or explicitly deferred. No "we'll figure it
      out while coding".

Fails DoR → back to Shape. Do not "just start and see".

---

## Definition of Done

- [ ] Every acceptance criterion **demonstrated with evidence** — test output or
      a screenshot — not asserted in prose.
- [ ] `npm run verify` green, output pasted.
- [ ] **Red-test-first proven** for Sensitive changes: the test was shown failing
      before the implementation and passing after. A test that was never red
      proves nothing — it may assert nothing.
- [ ] **Change-completeness** holds: grep-to-zero for every removed symbol across
      code *and* `docs/specs/`.
- [ ] Spec synced to the final behavior. No new component without a reuse decision.
- [ ] **Learner-facing:** merged to `origin/main`, version bumped on `main` per
      [`VERSIONING.md`](VERSIONING.md), deploy noted — footer version is the
      proof (`docs/AGENT-PITFALLS.md` §21).
- [ ] Anything surprising that cost you time is in [`TRAPS.md`](TRAPS.md).

Acceptance criteria are per-story. The DoD is the universal checklist that
applies to everything. Don't conflate them.

---

## Writing acceptance criteria a machine can check

Two formats, both fine. Pick per criterion.

**EARS** — for system rules:

> When *\<trigger\>*, the *\<component\>* shall *\<response\>*.
> While *\<state\>*, the *\<component\>* shall *\<response\>*.

**Given-When-Then** — for user scenarios:

> Given *\<context\>*, when *\<action\>*, then *\<observable outcome\>*.

The hard rule: **describe behavior, not implementation.**

```
✅ Given an unauthenticated visitor, when they open /account,
   then they are redirected to /login.

❌ Call requireAuth() in the layout.
```

The second one pins the *how*, so it rots the moment you refactor — and it
cannot fail, which means it isn't a criterion.

Every spec ends with **one named runnable check** that exercises its criteria.
"It builds" is never acceptance.

---

## Anything stateful

If the change involves a condition JavaScript tracks — open/closed,
loading/error, selected, submitting — or a selection that drives more than one
surface, the spec must carry the contracts in [`STATE.md`](STATE.md): one enum
rather than a pile of booleans, an explicit transition map, named terminal
states, and a single source of truth for anything shown in two places.

Those are the four failures that produce "the spinner is stuck behind the error
message", "the state just won't change", "the finished job ran again", and "the
detail pane still shows the old item". Each is cheap to prevent in the spec and
expensive to find afterwards.

---

## Working with an agent on this

Give the agent the stage, not the whole feature: *"We're at stage 2 for UC-004,
write the spec"* beats *"build the settings page"*. The stage names are the
shared vocabulary — see [`../.claude/skills/`](../.claude/skills/) for skills
that run one stage each.
