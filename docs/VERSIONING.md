# Versioning — Pride (PROUD.DEFAULT.SHAME)

This app uses **[Pride Versioning](https://pridever.org/)** instead of semantic
versioning. The `package.json` `version` field is the single source of truth.

## Format

`PROUD.DEFAULT.SHAME` — three non-negative integers:

| Segment | Bump when… |
| --- | --- |
| **PROUD** | You are genuinely proud of the release |
| **DEFAULT** | A normal, okay ship |
| **SHAME** | Fixing something too embarrassing to admit |

**Proud bump resets** default and shame to `0` (e.g. `1.4.3` → `2.0.0`).

Current version: read `package.json` or the label under the mobile nav pill.

## Commands

**Prefer `release:*` on `main`** — one command bumps, commits, and pushes (or
commits locally with `--no-push` when GitHub is down):

```bash
npm run release:ship     # feature / normal ship (default bump)
npm run release:shame    # bugfix, regression, small correction
npm run release:proud    # milestone you are proud of
npm run release:ship -- --no-push   # bump + commit only; push later
```

Low-level bumps (when you only need `package.json` changed, not commit/push):

```bash
npm run version:ship     # default bump on main only
npm run version:shame    # shame bump (any branch — but verify blocks feature branches)
npm run version:proud    # proud bump (human decision)
npm run version:default  # default bump (low-level; prefer release:ship on main)
```

`version:ship` refuses to run off `main` (unless `--allow-branch` for emergencies).
Each bump updates **both** `package.json` and `package-lock.json`.

**Local gate:** `verify` runs `check-version-shipped` on `main`. If learner-facing
files changed since the last version bump but `package.json` did not increase,
verify fails — run the matching `release:*` command. Works without GitHub CI.

**Not semver:** `0.14.1` is not a "patch release" — it is proud `0`, default `14`,
shame `1`. Bugfixes increment **shame** (`0.14.0` → `0.14.1`). Features increment
**default** (`0.14.0` → `0.15.0`).

## Agent protocol (parallel agents)

Parallel cloud agents were colliding on `package.json` — different branches bumping
to different numbers, hardcoded version tests, and merge conflicts on every ship.

**Rules:**

1. **Never change `package.json` `version` on a feature branch.** `verify` runs
   `check-version-branch` and fails if the version differs from the merge-base
   with `origin/main`.
2. **Never hardcode the version in tests.** `lib/pride-version.test.ts` asserts
   against `package.json` at runtime — bumps do not require test edits.
3. **One release, on `main`, after merge:** checkout `main`, pull, run
   `npm run release:shame` or `npm run release:ship` from the table below.
   Not in the feature PR. Add `--no-push` if GitHub is unavailable; push when
   billing is restored.
4. **Pick shame for bugfixes.** Regressions, layout fixes, restored assets, and
   other corrections use `version:shame` (`0.14.0` → `0.14.1`). Do **not** use
   `version:ship` for those — that is for features and normal ships
   (`0.14.0` → `0.15.0`).
5. **Do not use semver intuition.** `0.1.0` → `0.1.1` is a *shame* bump in Pride
   versioning (`0.1.1` = proud 0, default 1, shame **1**). A normal ship is
   `0.1.0` → `0.2.0` via `version:ship` / `version:default`.

| Change | Command (on `main` only, after merge) | Example |
| --- | --- | --- |
| Bugfix, regression, small correction | `npm run release:shame` | `0.14.0` → `0.14.1` |
| Normal feature or ship | `npm run release:ship` | `0.14.0` → `0.15.0` |
| Milestone you are proud of | `npm run release:proud` | `0.14.2` → `1.0.0` |

## How it works end-to-end

1. **Build time** — Next.js bundles `package.json` `version` into the client
   (`lib/pride-version.ts` → `APP_VERSION_LABEL`, e.g. `v0.2.1`).
2. **Deploy** — the server runs the new build; `/api/app-version` returns the
   same `version` string from its `package.json`.
3. **Learner's device** — still has the old bundle in memory (or PWA cache).
4. **Check** — `useAppUpdateAvailable` fetches `/api/app-version` on load, when
   the tab becomes visible, and every five minutes.
5. **Compare** — if the server Pride version is **numerically higher** than the
   bundled one, the footer shows the **new** version in green with a download
   icon (`docs/specs/feature/app-update.md`).
6. **Reload** — tap runs `location.reload()`; the new bundle loads and the label
   returns to muted grey.

So: **merge code first, then bump on `main`**; learners see green `vX.Y.Z` when
their tab is behind production.

## Where it appears

- **Mobile shell:** tiny muted label centred under the destination pill
  (`AppVersionLabel`, `docs/specs/feature/mobile-nav-v2.md`). When the server
  ships a newer Pride version, the label becomes a green **deployed version**
  with an `ArrowDownCircle` icon — tap to reload.
- **Profile (`/profile`):** **App** section with running version, **Check for
  updates**, and a green reload row when stale — see
  [`specs/feature/app-update.md`](specs/feature/app-update.md).
- **Code:** `lib/pride-version.ts` — `APP_VERSION_LABEL` for display;
  `parsePrideVersion` / `bumpPrideVersion` for tooling.

## Grundriss port

[Grundriss](https://github.com/matkleve/sprachenlernen) is the Next.js starter this app extends.
Copy these files into a Grundriss-based repo to get the same system:

| File | Role |
| --- | --- |
| `lib/pride-version.ts` | Parse, format, bump |
| `lib/pride-version.test.ts` | Unit tests |
| `lib/app-version.ts` | Compare bundled vs deployed |
| `scripts/bump-pride-version.mjs` | CLI bump |
| `scripts/ship-version.mjs` | Post-merge ship (main only) |
| `scripts/release-version.mjs` | Bump + commit + push (prefer over manual steps) |
| `scripts/check-version-branch.mjs` | Blocks version bumps on feature branches |
| `scripts/check-version-shipped.mjs` | On `main`: ship paths since last bump need newer version |
| `app/api/app-version/route.ts` | Deployed version endpoint |
| `features/app-shell/AppVersionLabel.tsx` | UI label |
| `features/app-shell/useAppUpdateAvailable.ts` | Client check |
| `docs/VERSIONING.md` | This document |

Wire `AppVersionLabel` under your mobile nav pill and add the npm scripts from
`package.json`. Add `--font-size-shell-version` and `--spacing-shell-float-version`
to `globals.css` if you use the same footer scrim tokens.
