# Verify scopes

Scoped is the default gate. Full `verify` is rare.

| Gate | When | Command | Typical time |
| --- | --- | --- | --- |
| **Scoped** | Every turn, commit, merge to `main`, `release:shame` | `npm run verify:scope -- <scope>` | ~30s–2min |
| **Full** | `release:ship` / `release:proud` only (optional) | `npm run verify` | ~7–10min |

**Never run full `verify` on every agent turn, on merge, or on shame release.**
It runs the whole test suite plus a production build — correct occasionally,
wrong as a default.

Paste **scoped** output for review, commit, merge, and shame ship. Paste **full**
output only when you ran it for a ship release.

---

## Pick a scope

| You changed… | Scope | Example |
| --- | --- | --- |
| Unsure / mixed files | `changed` | `npm run verify:scope -- changed` |
| Specs/studies only | `docs` | `npm run verify:scope -- docs` |
| Method cards, badges, `/methods` | `method-menu` | `npm run verify:scope -- method-menu` |
| Shell header, page layout | `app-shell` | `npm run verify:scope -- app-shell` |
| Words home / review UI | `words` | `npm run verify:scope -- words` |
| Any component classes/tokens | `ui` + patterns | `npm run verify:scope -- ui method-card-header` |
| `lib/` helper only | `lib` + test path | `npm run verify:scope -- lib lib/skill-tier.test.ts` |
| New `app/` route or layout | `route` | `npm run verify:scope -- route` |
| Auth, DB, cross-cutting | `changed` or widest scope | pick the matching scope |

List all scopes: `npm run verify:scope -- --help`

**`changed`** uses `vitest --changed` (git diff) to pick related tests.

---

## What each scoped gate runs

Defined in `scripts/verify-scope.mjs`. Summary:

- **docs** — `specs` only
- **changed** — typecheck, lint, tokens, contrast, specs + vitest `--changed`
- **ui** — typecheck, lint, tokens, contrast, specs + **your** vitest patterns
- **method-menu** — above checks + method-menu feature + method lib tests (~15s)
- **app-shell** — above + interaction + shell tests
- **words** — above + words/vocabulary/review tests
- **lib** — typecheck, lint + **your** test file(s)
- **route** — typecheck, lint, specs, **build** (no full test suite)

Scoped gates **omit**: full test suite, `neighbors`, `i18n`, `version-*`, and
(except `route`) **build**.

---

## Single check from the full gate

```bash
node scripts/verify.mjs tokens
node scripts/verify.mjs specs test
```

While typing, vitest watch on a folder:

```bash
npm run test:watch -- features/method-menu
```

---

## Agent reporting

| Status | Say | Prove |
| --- | --- | --- |
| Iterating / review / commit / merge to `main` | "Scoped verify green" | Paste `verify:scope` output + `LIVE CHECK (you)` when UI |
| `release:shame` | "Scoped verify green" | Paste `verify:scope` output |
| `release:ship` / `release:proud` | scoped green; full optional | Paste scoped output; full only if you ran it |

Merge to `main` does **not** require full verify. Shame release does **not**
require full verify.
