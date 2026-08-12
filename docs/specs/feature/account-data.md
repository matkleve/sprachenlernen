# Account data — export and delete

<!-- id: SPEC-feature-account-data -->
<!-- use-case: UC-024 -->
<!-- status: active -->

The export and delete blocks on [`/profile`](../page/profile.md) for downloading learning history and deleting
the account. First slice of [UC-024](../../use-cases/UC-024-take-my-history-with-me.md);
also retires Grundriss demo consumers for `Dialog` and `Select` (T-B5).

**Change class: Sensitive** — account deletion is irreversible.

**`/account` still resolves** — it redirects here, because the path shipped and
a bookmark should land on the page rather than a 404.

## Scope

- **In:** the export and delete blocks of `/profile` under `(app)`; export scope `Select` (complete archive vs
  review log only); download as JSON; delete-account `Dialog` with
  `dismissOnBackdrop={false}`; server actions; `deleteAccount` in `lib/db/auth.ts`
  using service role after session check.
- **Out:** import; migration from other apps; audio recordings; paid tiers;
  level-history export (nothing stored yet); multi-device merge (T-B9).

**Reuse:** `Button`, `Field`, `Select`, `Dialog`, `SubmitButton`.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/profile` signed in | Export and delete sections render |
| 2 | Chooses export scope and taps Download | Browser saves a JSON file of their data |
| 3 | Taps Delete account | Confirmation dialog opens |
| 4 | Confirms delete | Account and review rows removed; redirected to `/` |
| 5 | Cancels delete dialog | Dialog closes; account unchanged |
| 6 | Opens `/profile` signed out | Redirect to `/login` (shell gate) |

## States

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| `idle` | at rest | both sections available | no |
| `exporting` | download clicked | export button pending | no |
| `confirming-delete` | delete clicked | dialog open | no |
| `deleting` | confirm in dialog | dialog pending, account deleting | no |

## Acceptance criteria

- [ ] Given a signed-in learner on `/profile`, when they choose **Review log
      only** and download, then the JSON contains only `review_log` rows.
- [ ] Given a signed-in learner, when they choose **Complete archive** and
      download, then the JSON includes account email and `review_log`.
- [ ] Given the delete dialog, when the learner confirms, then they land on `/`
      and cannot access `(app)` routes without signing in again.
- [ ] Given the delete dialog, when backdrop is clicked, then nothing happens
      (`dismissOnBackdrop={false}`).
- [ ] Given `/profile`, then axe-core reports no violations.

## Check

`npm test -- account-data`
