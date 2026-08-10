# Error telemetry — external reporting adapter

<!-- id: SPEC-service-errors-telemetry -->
<!-- use-case: UC-066 -->
<!-- status: active -->

Optional fan-out from `logHandledError` to external crash reporters (Sentry,
Datadog, etc.) without changing call sites. Parent:
[`errors.md`](errors.md), [`errors-boundaries.md`](errors-boundaries.md).

**Default:** console only — no vendor dependency until a reporter is registered
at boot.

## Scope

- **In:** `lib/error-telemetry.ts`; `registerErrorReporter`; fields sent to
  reporters; PII rules; wiring from `logHandledError`.
- **Out:** choosing a vendor; log viewer UI; client-side session replay.

## The adapter

```ts
registerErrorReporter((error, { requestId }) => { /* Sentry, etc. */ });
```

`logHandledError` always writes to `console.error` first, then calls every
registered reporter. Reporters **must not throw** — failures are swallowed.

## Fields sent

| Field | Include? |
| --- | --- |
| `code` | yes |
| `referenceId` | yes — tag in external tools |
| `requestId` | yes when available |
| `context` | yes — no secrets |
| `developerMessage` | yes |
| `userMessage` | optional — usually omitted from external tools |
| passwords, tokens, cookies | **never** |

## Behavior

| # | Trigger | System response |
| --- | --- | --- |
| 1 | `logHandledError` runs | Console JSON line, then each registered reporter |
| 2 | Reporter throws | Swallowed; console line still emitted |
| 3 | `registerErrorReporter` returns unsubscribe | Removing stops future fan-out |
| 4 | No reporters registered | Console only (current production behaviour) |

## Acceptance criteria

- [ ] Given a registered reporter, when `logHandledError` runs, then the
      reporter receives the same `HandledError` and optional `requestId`.
- [ ] Given a reporter that throws, when `logHandledError` runs, then the call
      completes without propagating the throw.
- [ ] Given no reporters, when `logHandledError` runs, then only console output
      occurs.

## Open questions

- **Sentry wiring** — add `@sentry/nextjs` only when DSN is in Vercel env and
  owner confirms. Registration lives in instrumentation or a single boot file.

## Check

`npm test -- error-telemetry`
