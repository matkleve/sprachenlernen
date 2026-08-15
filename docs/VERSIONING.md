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

```bash
npm run version:ship     # ← after merge to main (default bump). Agents use this.
npm run version:proud    # proud bump (human decision)
npm run version:default  # default bump (low-level; prefer version:ship on main)
npm run version:shame    # shame bump
```

`version:ship` refuses to run off `main` (unless `--allow-branch` for emergencies).
Each bump updates **both** `package.json` and `package-lock.json`.

## Agent protocol (parallel agents)

Parallel cloud agents were colliding on `package.json` — different branches bumping
to different numbers, hardcoded version tests, and merge conflicts on every ship.

**Rules:**

1. **Never change `package.json` `version` on a feature branch.** `verify` runs
   `check-version-branch` and fails if the version differs from the merge-base
   with `origin/main`.
2. **Never hardcode the version in tests.** `lib/pride-version.test.ts` asserts
   against `package.json` at runtime — bumps do not require test edits.
3. **One bump, on `main`, after merge:** checkout `main`, pull, `npm run version:ship`,
   commit, push. Not in the feature PR.
4. **Do not use semver patch bumps.** `0.1.0` → `0.1.1` is a *shame* bump in
   Pride versioning (`0.1.1` = proud 0, default 1, shame **1**). A normal ship
   is `0.1.0` → `0.2.0` via `version:ship` / `version:default`.

| Change | Command (on `main` only, after merge) |
| --- | --- |
| Bugfix, small correction | `npm run version:shame` |
| Normal feature or ship | `npm run version:ship` |
| Milestone you are proud of | `npm run version:proud` |

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
  with an `ArrowDownCircle` icon — tap to reload. See
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
| `scripts/check-version-branch.mjs` | Blocks version bumps on feature branches |
| `app/api/app-version/route.ts` | Deployed version endpoint |
| `features/app-shell/AppVersionLabel.tsx` | UI label |
| `features/app-shell/useAppUpdateAvailable.ts` | Client check |
| `docs/VERSIONING.md` | This document |

Wire `AppVersionLabel` under your mobile nav pill and add the npm scripts from
`package.json`. Add `--font-size-shell-version` and `--spacing-shell-float-version`
to `globals.css` if you use the same footer scrim tokens.
