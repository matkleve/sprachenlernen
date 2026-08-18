---
name: implement
description: Build a feature from its spec, following the change-class rules. Use at stage 5 of the workflow — when a spec exists and the user asks to implement, build, or code it.
---

# Implement

**Model:** no Claude (Anthropic) models and no Substrate + Sonnet unless the user
asks — `AGENTS.md` §10, `docs/AGENT-PITFALLS.md` §19. **No subagents** — §20.

You are at **stage 5** of `docs/WORKFLOW.md`. A spec exists. If it does not,
stop and run the `specify` skill instead — implementing without one means the
acceptance criteria get written afterwards to match whatever you built, which
makes them worthless.

## 1. Declare the change class out loud

From `AGENTS.md`: Trivial, Standard, or Sensitive. Say which, and why. When torn
between two, pick the higher one.

**Sensitive** work (auth, money, deletion, anything persisted, stateful UI) has
one extra hard rule: **the test is written first and shown failing.** Paste the
red output before you write the implementation. A test that was never red proves
nothing — it may assert nothing at all.

## 2. Read before you write

- The spec, completely — including its `## Out of scope`.
- `docs/specs/component/` — is there already a component or variant for this?
  Reuse it. A missing variant gets added to the existing component; it does not
  justify a fork.
- `docs/TRAPS.md` — if the area you are touching appears there, read that entry
  now rather than after your first attempt fails.

## 3. State your plan before touching files

List: the files you will change, the files you will deliberately **not** touch,
and the command that will prove it works. Keep it to a few lines.

## 4. Build it

Follow `AGENTS.md` § Code style and `docs/ARCHITECTURE.md` for placement. The
rules that are easiest to violate without noticing:

- Server Component unless it needs state, effects or events — and `"use client"`
  as far down the tree as possible.
- No raw colors, radii or shadows. Token utilities only.
- All five interaction states on anything clickable.
- New feature code goes in `features/<name>/`. It moves to `components/ui/` when
  a **second** feature needs it, not in anticipation of one.

Comment the **why** where a reader would otherwise wonder — especially where you
rejected an alternative. That comment is what stops the next agent reintroducing
the bug.

## 5. Change-completeness

Before you call it done: whatever this replaces must be **gone**. Dead branches,
unused exports, obsolete tests, and the spec lines describing them. Grep the
removed symbol across `app/ components/ features/ lib/` and `docs/specs/` and
confirm zero hits.

Leftover-after-change is the single most expensive recurring failure in
codebases like this one. It is also the easiest to check.

## 6. Verify

```bash
npm run verify:scope -- <scope>   # docs/VERIFY-SCOPES.md — default for everything
```

Scoped for iterate, commit, merge, and `release:*`. Full `npm run verify` only
when cross-cutting or the user asks — state why. Walk each acceptance criterion.

If the user corrected you at any point: update the spec **in this session**,
before you finish. A spec that lags behind the code has stopped being a contract.
