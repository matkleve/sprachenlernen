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

Current version: read `package.json` or the label under the mobile nav pill
(`v0.1.0` today).

## Commands

```bash
npm run version:proud    # proud bump
npm run version:default  # default bump
npm run version:shame    # shame bump
```

Each command updates `package.json` and prints the new version.

## For agents

**Bump before merge** whenever the change should reach users on the next deploy.
Without a bump, the running bundle and the server report the same version — the
update prompt never appears.

| Change | Command |
| --- | --- |
| Bugfix, small correction | `npm run version:shame` |
| Normal feature or ship | `npm run version:default` |
| Milestone you are proud of | `npm run version:proud` |

Commit the bumped `package.json` in the **same PR** as the code. Do not bump on
docs-only or CI-only changes unless the user asks for a release.

## How it works end-to-end

1. **Build time** — Next.js bundles `package.json` `version` into the client
   (`lib/pride-version.ts` → `APP_VERSION_LABEL`, e.g. `v0.1.0`).
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

So: **you ship code + version bump together**; learners see green `vX.Y.Z` when
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
| `app/api/app-version/route.ts` | Deployed version endpoint |
| `features/app-shell/AppVersionLabel.tsx` | UI label |
| `features/app-shell/useAppUpdateAvailable.ts` | Client check |
| `docs/VERSIONING.md` | This document |

Wire `AppVersionLabel` under your mobile nav pill and add the npm scripts from
`package.json`. Add `--font-size-shell-version` and `--spacing-shell-float-version`
to `globals.css` if you use the same footer scrim tokens.
