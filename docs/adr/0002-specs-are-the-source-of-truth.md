# 0002. Specs are the source of truth

- **Status:** Accepted
- **Date:** 2026-07-31

## Context

Working with capable coding agents changed where the bottleneck sits. Producing
code is no longer the expensive part; *deciding what the code should do*, and
detecting when it does something else, is. Prompt-driven work optimises the part
that is already cheap: each prompt restates the requirement slightly differently,
nothing accumulates, and the only durable record of intent is the code itself —
which cannot disagree with itself and therefore cannot be wrong.

Reports from teams adopting spec-driven workflows describe substantially fewer
rework cycles, and the mechanism is not mysterious: a written contract is
reviewable *before* the expensive step, and re-runnable after it.

## Decision

An executable, version-controlled specification is the source of truth, not the
code. Work flows Use case → Spec → Plan → Tasks → Implement → Verify
(`docs/WORKFLOW.md`). Specs carry testable acceptance criteria in EARS or
Given-When-Then form, and each names one runnable check. When spec and code
disagree, one of them is fixed in the same change.

Ceremony scales with risk via change classes (Trivial / Standard / Sensitive) —
without that valve, spec-driven development degenerates into process theatre for
typo fixes, and people route around it entirely.

## Alternatives considered

- **Prompt-driven ("vibe coding").** Fastest to the first working screen, and
  genuinely right for a prototype that will be thrown away. It has no memory: by
  the fifth session nobody can say what the intended behavior was, so
  regressions are indistinguishable from features.
- **Tests as the only specification.** Executable and unambiguous, which is most
  of the value. But tests encode *how* it is checked, not *why* it must be true,
  and nobody reads a test suite to learn what a product does. Tests are how we
  verify a spec, not a replacement for it.
- **Full up-front specification (waterfall).** Same artifacts, wrong loop size —
  it specifies the whole feature before learning anything. We go around the loop
  once per thin slice instead.

## Consequences

Every non-trivial change starts with writing, which feels slower on the first
day and is the whole point by the second week. The specs are now a real
liability: a stale spec is worse than none, so "update the spec in the same
session" is a hard rule (`AGENTS.md` § Boundaries) and size caps are enforced by
`check:specs` so specs stay readable enough to actually be updated.
