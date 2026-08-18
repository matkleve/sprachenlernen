# Verify scopes

Two gates. Every agent must know which one applies.

| Gate | When | Command | Typical time |
| --- | --- | --- | --- |
| **Scoped** | While iterating; "ready for you to look" | `npm run verify:scope -- <scope>` | ~30s–2min |
| **Full** | Before commit, merge, or "done" | `npm run verify` | ~7–10min |

**Never run full `verify` on every agent turn.** It runs the whole test suite
(neighbors, simulation, …) plus a production build. Correct for merge, wrong for
a card-polish loop.

Paste **scoped** output when handing off for visual review. Paste **full**
output only when the change is commit-ready.

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
| Auth, DB, release, cross-cutting | *(no scope)* | `npm run verify` |

List all scopes: `npm run verify:scope -- --help`

**`changed`** uses `vitest --changed` (git diff) to pick related tests. Fastest
when you forgot to pick a named scope; named scopes are more predictable.

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

If you touched i18n keys, DB, or `package.json` version — run full verify.

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
| Ready for visual review | "Scoped verify green" | Paste `verify:scope` output + `LIVE CHECK (you)` |
| Ready to commit | "Full verify green" | Paste `npm run verify` output |

Do not claim commit-ready on scoped verify alone.
