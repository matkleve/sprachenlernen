# 0003. AGENTS.md as the single instruction file

- **Status:** Accepted
- **Date:** 2026-07-31

## Context

Every coding tool wants its own instruction file: `CLAUDE.md`, `.cursor/rules/`,
`.github/copilot-instructions.md`, and more arriving. Maintaining the same rules
in four places guarantees they drift, and drifted rules are worse than none —
each tool then confidently enforces a different version of the truth.

`AGENTS.md` was formalised as an open specification in 2025, donated to the Linux
Foundation's Agentic AI Foundation in December 2025, and is read by Claude Code,
Cursor, Copilot, Codex, Gemini CLI and others. Adoption is past sixty thousand
repositories.

Separately, research across a large sample of repositories found that instruction
files beyond roughly 150 lines produce diminishing returns and measurably higher
inference cost without better agent behavior. Long files are not more thorough;
they are less read.

## Decision

`AGENTS.md` at the repository root is the single instruction file. It stays under
roughly 150 lines and contains only what is *not* discoverable by reading one
source file: exact commands, cross-file invariants, boundaries, and a table of
what to read when. Everything else lives in `docs/` and is linked, so an agent
loads it when the task touches it — progressive disclosure rather than a
preamble.

`CLAUDE.md` is a two-line pointer to `AGENTS.md`. Tool-specific files, if they
ever appear, are pointers too — never content.

## Alternatives considered

- **`CLAUDE.md` as the primary file.** Best support in the tool we use most
  today, and no worse for anyone using an adapter. Rejected because it makes the
  repository's rules a function of one vendor's convention, and the base project
  is meant to outlive that choice.
- **One comprehensive instruction file with everything inline.** Nothing to
  navigate, no broken links. Rejected on the evidence above: it costs more per
  request and gets skimmed rather than read, so the important lines compete with
  boilerplate for attention.
- **Per-tool files kept in sync by a script.** Removes the drift but not the
  duplication, and adds a generator to maintain. The pointer approach gets the
  same result with nothing to run.

## Consequences

One place to change a rule, and one place to look for it. The cost is that
`AGENTS.md` must be defended against growth: anything that can live in `docs/`
does, and adding a section means asking what it replaces. Tool-specific features
that only read a proprietary path (a Cursor rule that must be `.mdc`, say) get a
pointer file and an entry here — never a second copy of the rule.
