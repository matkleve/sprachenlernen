# UC-066 — Diagnose a failure from what the app recorded

<!-- id: UC-066 -->
<!-- specs: SPEC-service-errors, SPEC-service-errors-telemetry -->

**Who:** a developer, a support person, or an agent working in this repository.
**Wants to:** given a failure the user hit (or a test that failed), see exactly
what the system knew at the time — without reproducing it blind.
**So that:** they can fix the cause instead of guessing from a screenshot of
*"An error occurred."*

Derived from [`../CONSTITUTION.md`](../CONSTITUTION.md) §4 and §6 — a failure
must be visible *and* explainable.

## Today

User-facing text and developer context are the same string, or the developer
context does not exist:

- Auth redirects put the raw Supabase message in the query string — fine when
  Supabase is polite, useless when it is not, and never correlated with server
  logs.
- Catalogue load failures list file paths in monospace on the method menu — good
  for the developer who deployed it, opaque for everyone else.
- `catch` blocks that log `error.message` once and return nothing structured.
  An agent grep-ing the codebase cannot find a stable code; a human cannot match
  a user report to a log line.

The screenshot archetype — *"Error: An error occurred."* — is the worst case:
the user sees nothing actionable, and the developer sees nothing at all.

## Success looks like

- Every handled failure carries a **stable `code`** (e.g. `auth/invalid-credentials`,
  `catalogue/load-failed`) that is documented once and grep-able.
- Alongside the user message, the system records a **developer message** —
  the upstream error, stack, or parse detail — never shown to the user by
  default, always available in logs and in server output.
- A **correlation id** ties one user-visible failure to one log record. The same
  id appears in the UI reference line and in structured logs.
- **Context** is structured data, not prose: feature, operation, ids that are
  safe to log (never passwords, tokens, or full payloads).
- Mapping is explicit: known upstream errors translate to known codes; unknown
  errors become `internal/unexpected` with the original cause preserved in
  `developerMessage`.
- An empty `catch` that swallows an error is a **constitution violation** —
  [`SPEC-service-errors`](../specs/service/errors.md) is the enforcement
  contract.

## Out of scope

- Building a log viewer UI.
- Automatic bug filing ([`UC-023`](UC-023-report-something-wrong.md) is content,
  not crashes).
- PII in logs beyond what is needed to debug (email may appear in auth failures;
  never passwords or session tokens).
