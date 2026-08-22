# Contributing

## Before you write code

1. The work item passes the **Definition of Ready** — [`docs/WORKFLOW.md`](docs/WORKFLOW.md).
2. A spec exists — [`docs/specs/`](docs/specs/). Scaffold: `npm run new:spec`.
3. You have declared the **change class** — Trivial / Standard / Sensitive
   ([`AGENTS.md`](AGENTS.md)). When torn between two, pick the higher one.

## Before you commit

```bash
npm run verify:scope -- <scope>   # default — see docs/VERIFY-SCOPES.md
```

Scoped verify is the day-to-day gate. Run full `npm run verify` only when
cross-cutting (auth, i18n keys, several areas) — state why in the PR.

Failing one check? Re-run it alone: `node scripts/verify.mjs tokens`.

## Commits

Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.

One logical change per commit. If the message needs an "and", it is two commits.

## Pull requests

The template is the Definition of Done. Fill it in honestly — an unticked box
with a sentence explaining why is fine and useful; a ticked box that is not true
is the thing that makes the whole checklist worthless.

Paste the `verify` output. Map each acceptance criterion to the evidence for it.

## Adding a dependency

Say in the PR what it replaces and why the platform cannot do it. Every
dependency is a permanent cost paid by everyone who touches the repo afterwards.

## Changing the rules

- A rule in `docs/` → normal PR.
- A rule in [`docs/CONSTITUTION.md`](docs/CONSTITUTION.md) → its own PR, touching
  only that file, saying what changed and why.
- An expensive-to-reverse decision → an [ADR](docs/adr/) in the same PR.
