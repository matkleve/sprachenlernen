# Word capture

<!-- id: SPEC-feature-word-capture -->
<!-- use-case: UC-012 -->
<!-- status: active -->

Persist learner-owned **Sources** from method material setup when **Keep in my
library** is checked. Session-only paste stays ephemeral (cookie, not listed on
`/content`). Parent: [`content-traceability.md`](content-traceability.md).

## Scope

- **In:** DB table `content_sources`; save pasted text on Start when keep
  checked; list saved learner sources on `/content`; resolve saved + ephemeral
  sources for `/practice` and source detail.
- **Out:** file upload, URL/RSS intake, coverage history rows, delete/edit UI,
  tagging learner text with method topic chips.

## Behavior

| # | Input | Output |
| --- | --- | --- |
| 1 | Signed-in learner, own text, keep checked, Start | Row in `content_sources`; practice uses stable UUID |
| 2 | Own text, keep unchecked, Start | Ephemeral cookie; no `/content` list row; practice resolves from cookie |
| 3 | Signed-in learner opens `/content` | Fixture/catalogue JSON **plus** saved learner rows for active language |
| 4 | Ephemeral source after session | Not listed on `/content`; trace block has no link (existing rule) |
| 5 | Keep checked while signed out | Start blocked with sign-in message — persistence requires an account |
| 6 | Own text over 100 000 characters, either branch | Start blocked with a length message; nothing is written and no preview is computed |

## Data

Table `content_sources` — one row per saved learner item. Maps to
[`coverage.md`](../service/coverage.md) `Source` with `origin: learner`,
`ephemeral: false`.

Session-only sources use cookie `sl-ephemeral-source` (max body 3500 chars).

**Saved rows are capped at 100 000 characters** for `body` and `transcript`
(`LEARNER_SOURCE_MAX_BODY_CHARS`, `lib/learner-text-limits.ts`) — roughly a
long article or a book chapter. Enforced in the adapter, so the learner gets a
message they can act on, *and* as a check constraint on the column
(`20260820120000_content_sources_body_limit.sql`), so a future adapter that
forgets cannot write past it. The two ceilings differ because their limits do:
the cookie's is what a `Set-Cookie` header carries, the row's is what one
request should be willing to tokenise.

## Acceptance criteria

In [`word-capture.acceptance-criteria.md`](word-capture.acceptance-criteria.md).

## Check

`npm test -- content-sources ephemeral-source learner-text-limits`
