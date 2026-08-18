---
name: specify
description: Turn a use case or a feature request into a spec with testable acceptance criteria. Use at stage 2 of the workflow, before any code is written — when the user asks to "spec out", "write the spec for", or describes a feature they want built.
---

# Specify

**Model:** no Claude (Anthropic) models and no Substrate + Sonnet unless the user
asks — `AGENTS.md` §10, `docs/AGENT-PITFALLS.md` §19. **No subagents** — §20.

You are at **stage 2** of `docs/WORKFLOW.md`. The output is a spec, not code.
Do not write implementation in this skill, even if the answer seems obvious —
the point is to make the contract reviewable *before* the expensive step.

## 1. Check the Definition of Ready first

Read `docs/WORKFLOW.md` § Definition of Ready. If the request fails any item,
**stop and ask** — batched into one message, not one question at a time. The
most common gaps, in order of how much rework they cause:

- No stated scope boundary, so "out of scope" is discovered during review.
- Acceptance criteria that describe implementation ("call X") rather than
  observable behavior.
- An unstated assumption about data that nobody verified by reading the code.

A half-ready item entering the pipeline is the number one source of rework. It
is always cheaper to ask now.

## 2. Find or write the use case

Every spec serves a use case. Look in `docs/use-cases/`. If none fits:

```bash
npm run new:spec -- use-case "<what the person is trying to do>"
```

Write it from the user's side, in their words. "Find the one order I need to act
on today" — not "add a status filter". Keeping those apart is what lets you
notice the requested feature is not the cheapest answer.

## 3. Scaffold the spec

```bash
npm run new:spec -- <component|feature|page|service> <slug> <UC-NNN>
```

This registers the spec on the use case in both directions, so traceability
holds from the start instead of after `check:specs` complains.

## 4. Fill it in

Follow `docs/SPEC-FORMAT.md`. The parts that carry the weight:

- **Out of scope** — cheapest section in the document, prevents the most rework.
- **States** — with a `Terminal?` column. For anything with a lifecycle, naming
  the states that can never be left is what prevents re-running finished work.
- **Acceptance criteria** — EARS or Given-When-Then, behavior only. Include the
  **negative**: not "shows B" but "shows B *and no residue of A*".
- **Check** — one named runnable command.

If selecting one thing updates two or more surfaces, the **state-coherence
contract** (`docs/WORKFLOW.md`) is mandatory. Name the single source of truth
and assert the whole set of surfaces after a change.

Stay under 180 lines. Over the cap, split into a sibling file and link it.

## 5. Close the loop

Run `npm run check:specs`. Then show the user the acceptance criteria — just
those — and ask whether anything is missing or wrong. Criteria are the thing
they can actually judge; the rest is structure.

Do not proceed to implementation in the same turn unless they say so.
