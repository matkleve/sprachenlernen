# Errors — every failure is explainable twice

<!-- id: SPEC-service-errors -->
<!-- use-case: UC-065 -->
<!-- status: active -->

The cross-cutting contract for failures: one shape in `lib/errors.ts`, two
audiences. Serves [UC-065](../../use-cases/UC-065-know-what-went-wrong-and-what-to-do-next.md)
(user copy + next step + reference id) and
[UC-066](../../use-cases/UC-066-diagnose-a-failure-from-what-the-app-recorded.md)
(stable codes, developer detail, correlation). Implements
[`CONSTITUTION.md`](../../CONSTITUTION.md) §4.

**Sensitive** once wired to auth and persisted data — red-test-first when
implementation starts (`AGENTS.md`).

## Scope

- **In:** the `HandledError` type; factories and mappers in `lib/errors.ts`;
  structured logging helper; rules for what may appear in user copy vs logs;
  integration points for Server Actions, route handlers, and feature loaders.
- **Out:** field-level validation copy ([`../component/field.md`](../component/field.md)
  / UC-002); external crash reporting; a log viewer; translating messages.

## The shape

Every failure the app handles — not raw `throw new Error("…")` in features —
becomes a `HandledError`:

| Field | Audience | Rule |
| --- | --- | --- |
| `code` | developer / agent | Stable, `domain/slug`, lowercase, documented in this file's registry |
| `userMessage` | user | Plain language; names what failed; **never** a banned generic (see below) |
| `nextStep` | user | Optional imperative — *"Check your connection and try again."* Omit when there is nothing honest to suggest |
| `referenceId` | both | Short id (e.g. 8-char hex); shown in UI; included in every log line |
| `developerMessage` | developer / agent | Upstream message, stack fragment, or parse detail — **never** default UI copy |
| `context` | developer / agent | JSON-serialisable, no secrets: `feature`, `operation`, safe ids |

Banned **user-facing** strings (and close paraphrases): *"An error occurred"*,
*"Something went wrong"* without naming the action, *"Error:"* as the entire
message. If mapping fails, `userMessage` must still name the action
(*"Could not load the method catalogue"*) and `code` is `internal/unexpected`.

## Behavior

| # | Trigger | System response |
| --- | --- | --- |
| 1 | A known upstream error (e.g. Supabase auth code) | Mapped to a documented `code`, user-appropriate `userMessage`, upstream text in `developerMessage` |
| 2 | An unknown thrown value | `code: internal/unexpected`; `developerMessage` preserves `String(error)` or stack; user copy names the operation that failed |
| 3 | A failure is shown in the UI | `ErrorCallout` receives `userMessage`, optional `nextStep`, and `referenceId` — not `developerMessage` |
| 4 | A failure is logged (server) | One structured line: `code`, `referenceId`, `context`, `developerMessage` |
| 5 | A feature catches an error | It returns or throws `HandledError` — never a bare string, never silence |

## Code registry (initial)

| Code | User message (template) | Typical cause |
| --- | --- | --- |
| `auth/invalid-credentials` | The email or password is not correct. | Supabase sign-in rejected |
| `auth/confirmation-missing` | The confirmation link is incomplete. Try the link from your email again. | `/auth/callback` without `code` |
| `auth/confirmation-failed` | Could not confirm your email. | `exchangeCodeForSession` failed |
| `catalogue/load-failed` | Could not load the method catalogue. | Invalid JSON under `data/methods/` |
| `network/offline` | You appear to be offline. | `fetch` failed with network error |
| `internal/unexpected` | Could not {operation}. | Anything unmapped |

New codes are added here in the same commit that introduces them. Grep this
table before inventing a synonym.

## States

Not a client FSM (`docs/STATE.md` §1). A surface is either showing its happy
path or one `HandledError` — never both, never neither after a failed load.

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| `ok` | operation succeeded | Normal UI | no |
| `failed` | `HandledError` produced | `ErrorCallout` (or field error for forms) | no until retry succeeds |

## Data

- **Reads:** upstream errors, optional `context` from the caller.
- **Writes:** structured `console.error` (or platform logger) on the server;
  nothing persisted until a deliberate logging table exists.

## Acceptance criteria

- [ ] Given any code path that handles a failure, when it surfaces to the user,
      then the UI shows `userMessage`, optional `nextStep`, and `referenceId`,
      and does **not** show `developerMessage`.
- [ ] Given any handled failure on the server, when it is logged, then the log
      line includes `code`, `referenceId`, and `developerMessage`.
- [ ] Given a banned generic string would be shown, when the error is built,
      then the builder rejects it in tests — the string never reaches the UI.
- [ ] Given `internal/unexpected`, when the user sees the message, then it names
      the operation from `context.operation`, not the word "Error" alone.
- [ ] Given a field validation failure on a form, when the user submits, then
      UC-002's Field error is used — not `ErrorCallout`.

## Open questions

- **Correlation id format** — 8 hex chars vs UUID fragment. Decide at
  implementation; must be unique enough for a single user's session.
- **Show reference id in production UI** — proposed yes, in muted mono, so support
  and agents can work from a screenshot. Owner may prefer dev-only; until
  decided, spec assumes visible.

## Check

`npm test -- errors`
