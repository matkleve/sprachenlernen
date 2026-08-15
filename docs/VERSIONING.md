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

## Where it appears

- **Mobile shell:** tiny muted label centred under the destination pill
  (`AppVersionLabel`, `docs/specs/feature/mobile-nav-v2.md`).
- **Code:** `lib/pride-version.ts` — `APP_VERSION_LABEL` for display;
  `parsePrideVersion` / `bumpPrideVersion` for tooling.

## Grundriss port

[Grundriss](https://github.com/matkleve/sprachenlernen) is the Next.js starter this app extends.
Copy these files into a Grundriss-based repo to get the same system:

| File | Role |
| --- | --- |
| `lib/pride-version.ts` | Parse, format, bump |
| `lib/pride-version.test.ts` | Unit tests |
| `scripts/bump-pride-version.mjs` | CLI bump |
| `features/app-shell/AppVersionLabel.tsx` | UI label |
| `docs/VERSIONING.md` | This document |

Wire `AppVersionLabel` under your mobile nav pill and add the npm scripts from
`package.json`. Add `--font-size-shell-version` and `--spacing-shell-float-version`
to `globals.css` if you use the same footer scrim tokens.
