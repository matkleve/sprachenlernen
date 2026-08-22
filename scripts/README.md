# scripts/

Build tooling and verify gates. Entry points stay at the repo root of this
folder so `npm run verify` and `npm run verify:scope` keep stable paths.

```
scripts/
  verify.mjs          full gate orchestrator
  verify-scope.mjs    scoped gate — default for iteration
  checks/             CI gates (check-*.mjs, contrast-pairs.mjs)
  build/              data pipelines, exports, imports, generators
  release/            version bump and release automation
  design/             brand assets, wood synthesis, texture metrics (Python + mjs)
  docs/               spec/study scaffolding (new-spec, study tools)
  smoke/              manual smoke helpers
  lib/                shared helpers for scripts (color, png)
  lemma/              lemma-table build pipeline
```

## Common commands

| Command | Script |
| --- | --- |
| `npm run verify` | `verify.mjs` → `checks/*` |
| `npm run verify:scope -- <scope>` | `verify-scope.mjs` |
| `npm run check:specs` | `checks/check-specs.mjs` |
| `npm run new:spec` | `docs/new-spec.mjs` |
| `npm run build:starter-deck` | `build/build-starter-deck.mjs` |
| `npm run release:ship` | `release/release-version.mjs` |

Scoped verify scopes: [`docs/VERIFY-SCOPES.md`](../docs/VERIFY-SCOPES.md).

## Adding a new check

1. Add `checks/check-<name>.mjs`.
2. Register it in `verify.mjs` `CHECKS` array.
3. Wire into `verify-scope.mjs` scopes if needed.
