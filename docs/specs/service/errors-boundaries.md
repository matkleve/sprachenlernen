# Error boundaries — layered recovery

<!-- id: SPEC-service-errors-boundaries -->
<!-- use-case: UC-065 -->
<!-- also-serves: UC-066 -->
<!-- status: active -->

Where failures are caught, what the user sees, and what gets logged. Parent:
[`errors.md`](errors.md). Implements Constitution §4 for crashes that bypass
feature-level `HandledError` returns.

Modern practice (2024–2026): **classify centrally**, **recover at the lowest
useful layer**, **correlate every incident** (reference id + route + release),
and **never show raw stack traces** to learners. See research note in
[`docs/diary/2026-08-10.md`](../../diary/2026-08-10.md#error-boundaries).

## Scope

- **In:** boundary placement; failure taxonomy; `AppError` + `boundaryErrorFromUnknown`;
  `app/error.tsx`, `app/global-error.tsx`; [`route-error-surface.md`](../component/route-error-surface.md).
- **Out:** Sentry/Datadog wiring; widget-level boundaries; translating copy;
  field validation (UC-002).

## Failure taxonomy

Every handled failure has a **category** (for logging and next-step copy):

| Category | Code prefix | User can fix? | Typical next step |
| --- | --- | --- | --- |
| User input | `auth/*`, form | often | Correct input and retry |
| Network | `network/*` | sometimes | Check connection, retry |
| Auth session | `auth/*` | sometimes | Sign in again |
| Dependency | `catalogue/*`, `database/*` | no | Retry; note reference if persistent |
| Render / bug | `render/*`, `internal/*` | no | Retry; note reference |
| Config | `config/*` | no | Wait for fix (deploy/env) |

Categories are not shown as labels in the UI — they drive `nextStep` and
developer dashboards later.

## Boundary layers

| Layer | File | Catches | User sees |
| --- | --- | --- | --- |
| **Global** | `app/global-error.tsx` | Root layout / `html` failures | Full-page recovery; no app shell |
| **Route** | `app/error.tsx` | Uncaught errors in a route segment's tree | `RouteErrorSurface` inside shell |
| **Feature** | (future) `error.tsx` under `(app)/words/` etc. | One destination without killing siblings | Scoped callout — not built yet |
| **Loader** | feature `reading.ts` | Expected I/O failures | `ErrorCallout` with `HandledError` |
| **Inline** | forms, review sync | Single action failed | Field error or sync status line |

**Rule:** expected failures (Supabase returned an error, catalogue JSON invalid)
**return** `HandledError` — never throw. **Throw** only for true invariants
(`AppError`) or unrecoverable programmer errors; boundaries map throws to
`HandledError` at the edge.

## Behavior

| # | Trigger | System response |
| --- | --- | --- |
| 1 | Feature loader fails | `ErrorCallout` on that page; names the operation |
| 2 | Uncaught throw in route tree | Nearest `error.tsx` → `boundaryErrorFromUnknown` → `RouteErrorSurface` |
| 3 | Root layout throws | `global-error.tsx` — same copy rules, minimal chrome |
| 4 | `AppError` thrown | Boundary uses embedded `HandledError` unchanged |
| 5 | User taps Try again | `reset()` re-renders the route segment |
| 6 | Any boundary shown | Structured log: `code`, `referenceId`, `route`, `digest`, `developerMessage` |

## Route context

`lib/error-boundary.ts` maps `pathname` → operation phrase for
`internal/unexpected` copy:

| Path prefix | Operation phrase |
| --- | --- |
| `/words/review` | start your review session |
| `/words` | load your vocabulary |
| `/methods/` | load this method |
| `/methods` | load the method menu |
| `/progress` | load your progress |
| *(default)* | load this page |

## Correlation

| Field | Source | Shown to user? |
| --- | --- | --- |
| `referenceId` | `createReferenceId()` or from `AppError` | yes — `Reference: abc12345` |
| `digest` | Next.js server error digest | logged in `developerMessage`; shown only when no `referenceId` |
| `route` | `usePathname()` in client boundary | logged, not shown |

When both exist, log `digest` inside `developerMessage`; UI shows one
`referenceId` only.

## Acceptance criteria

- [ ] Given `/words/review` throws, when the route boundary renders, then copy
      names starting the review session — not *"Something went wrong"*.
- [ ] Given any route boundary, when shown, then `userMessage`, optional
      `nextStep`, and `referenceId` appear via `RouteErrorSurface`.
- [ ] Given `AppError`, when the boundary maps it, then the embedded
      `HandledError` is used without re-wrapping.
- [ ] Given a network-like message (`Failed to fetch`), when mapped, then
      `code` is `network/offline` and next step mentions connection.
- [ ] Given a boundary logs, when inspected, then output includes `code`,
      `referenceId`, `route`, and `developerMessage`.

## Open questions

- **Widget boundaries** — e.g. horizon chart fails but atlas still shows. Deferred
  until a second destination needs partial render.
- **External crash reporter** — contract leaves a single `logHandledError` hook
  point; Sentry is an adapter, not a second shape.

## Check

`npm test -- error-boundary route-error-surface errors`
