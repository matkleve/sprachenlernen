# Verify scopes

**Default gate:** scoped. Full `verify` (~10min) is the exception — use it only
when you can state a concrete reason (see below). Never run full verify just
because you are merging, committing, or running `release:*`.

| Gate | When | Command | Typical time |
| --- | --- | --- | --- |
| **Scoped** | Default — iterate, commit, merge to `main`, `release:shame`, `release:ship` | `npm run verify:scope -- <scope>` | ~30s–2min |
| **Full** | Cross-cutting change or user explicitly asks — **state the reason** | `npm run verify` | ~7–10min |

Paste scoped output for handoff and ship. Paste full output only when you ran
full verify and said why.

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

List all scopes: `npm run verify:scope -- --help`

**`changed`** uses `vitest --changed` (git diff) to pick related tests.

---

## What scoped runs

Defined in `scripts/verify-scope.mjs`. Summary:

- **docs** — `specs` only
- **changed** — typecheck, lint, tokens, contrast, specs + vitest `--changed`
- **ui** — typecheck, lint, tokens, contrast, specs + **your** vitest patterns
- **method-menu** — above + method-menu feature + method lib tests (~15s)
- **app-shell** — above + interaction + shell tests
- **words** — above + words/vocabulary/review tests
- **lib** — typecheck, lint + **your** test file(s)
- **route** — typecheck, lint, specs, **build** (no full test suite)

Scoped gates **omit**: full test suite, `neighbors`, `i18n`, `version-*`, and
(except `route`) **build**.

---

## When full verify is justified

Run full **only** if you can name the reason out loud:

- Auth, DB, or persisted data paths touched
- i18n keys added/renamed across locales
- Several unrelated areas in one change (no single scope fits)
- User explicitly asked for full verify

**Not justified:** merge to `main`, `release:shame`, `release:ship`, "being careful",
or "it's the gate". Those use scoped (or `route` when a new route needs build).

---

## Single check from the full gate

```bash
node scripts/verify.mjs tokens
node scripts/verify.mjs specs test
```

While typing:

```bash
npm run test:watch -- features/method-menu
```

---

## Agent reporting

| Status | Say | Prove |
| --- | --- | --- |
| Any normal handoff / commit / merge / release | "Scoped verify green" | Paste `verify:scope` output + `LIVE CHECK (you)` when UI |
| Full verify (rare) | "Full verify green — because …" | Paste output + the stated reason |
