# Agent start

Read [`../AGENTS.md`](../AGENTS.md) first. Use this page when you need a
checklist, not the full trap/pitfall corpus.

## 1. Declare change class

| Class | When |
| --- | --- |
| **Trivial** | Copy, comment, single-token swap |
| **Standard** | New component, hook, or self-contained UI |
| **Sensitive** | Auth, persistence, FSM UI, irreversible actions |

## 2. Find context

| Need | Read |
| --- | --- |
| What to build | `docs/specs/` — [`specs/README.md`](specs/README.md) |
| Where code lives | [`features/README.md`](../features/README.md), [`lib/README.md`](../lib/README.md) |
| Resuming an area | Latest [`diary/`](diary/) entry |
| States / two surfaces | [`STATE.md`](STATE.md) |
| Second attempt failing | [`TRAPS.md`](TRAPS.md) |

## 3. Verify

```bash
npm run verify:scope -- <scope>   # default — docs/VERIFY-SCOPES.md
```

Full `npm run verify` only when cross-cutting — state why in the PR.

## 4. Before declaring done

- [ ] Spec and code agree (same commit if you changed behaviour).
- [ ] Removed symbols grep-clean across `app/`, `components/`, `features/`, `lib/`, `docs/specs/`.
- [ ] Reuse check: `Reuse: <component>` or `Gap: <variant>` from `docs/specs/component/`.
- [ ] Paste scoped verify output in the PR.

## 5. LIVE CHECK (you)

For anything browser-only, end with click steps and expected outcome. Do not
claim verified without observing.

```
LIVE CHECK (you)
1. …
   → expect …
```

Deep reference (read when stuck, not up front): [`AGENT-PITFALLS.md`](AGENT-PITFALLS.md),
[`IMPLEMENTATION-PLAN.md`](IMPLEMENTATION-PLAN.md), [`TRAPS.md`](TRAPS.md).
