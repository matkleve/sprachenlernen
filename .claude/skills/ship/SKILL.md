---
name: ship
description: Walk the Definition of Done before calling work finished. Use at stage 7 — when the user asks whether something is ready, ready to merge, ready to ship, or to check the work over.
---

# Ship

You are at **stage 7** of `docs/WORKFLOW.md`. Your job here is to find the
reason this is *not* done. Approach it adversarially: assume something was
missed, because something usually was.

Report honestly. A finding you suppress to deliver good news costs far more than
the delay of reporting it.

## The Definition of Done

Walk each item and state the evidence. "Looks fine" is not evidence.

- [ ] **Every acceptance criterion demonstrated.** Open the spec, read the
      criteria, and for each one name the test or the observation that proves it.
      A criterion with nothing behind it is the finding.
- [ ] **Scoped verify green** while building (`npm run verify:scope`). Run it now
      for this turn — do not trust a run from earlier in the session.
- [ ] **Full `npm run verify` green** only when merging to `main` or the change is
      cross-cutting (auth, DB, i18n, version). Not for every commit.
- [ ] **Red-test-first**, for Sensitive changes. Was the test shown failing
      before the implementation? If nobody can point to that, the test may be
      asserting nothing. Verify by breaking the implementation and confirming it
      goes red.
- [ ] **Change-completeness.** Grep every removed symbol, field and concept
      across `app/ components/ features/ lib/` **and** `docs/specs/`. Zero hits.
      This is where most finished-looking work is actually unfinished.
- [ ] **Spec matches final behavior**, including any change the user asked for
      mid-session.
- [ ] **No new component without a reuse decision** — check
      `docs/specs/component/`.
- [ ] **Anything that cost you time is in `docs/TRAPS.md`.** If you were
      surprised, the next person will be too.
- [ ] **Learner-facing — three layers** (`docs/AGENT-PITFALLS.md` §21). Report
      each layer explicitly; never say "shipped" for layer 1 only:
      - **Verified:** scoped or full verify green (paste output; full only if
        merging to `main`).
      - **Merged:** commit is on `origin/main`.
      - **Deployed:** footer / Profile **App** shows the bumped Pride version;
        user gets **LIVE CHECK (you)** steps if you could not observe deploy.
- [ ] **Version released on `main` after merge** (not on the feature branch):
      checkout `main`, pull, then `npm run release:shame` for bugfixes/regressions
      or `npm run release:ship` for features; add `--no-push` if GitHub is down.
      See `docs/VERSIONING.md`. Skip only when nothing ships to learners (e.g.
      CI-only). `verify` on `main` fails until the version is bumped.

## Then say plainly

One of:

- **Done** — with the verify output and the criteria-to-evidence mapping.
- **Not done** — with the specific gap, and what it would take.

Do not soften a "not done" into a "done, with a small follow-up". If it needs
follow-up, it is not done.
