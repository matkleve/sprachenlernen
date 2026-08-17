<!-- Definition of Done — docs/WORKFLOW.md. Delete nothing; tick or explain. -->

## What and why

<!-- One or two sentences. Link the spec: docs/specs/… -->

**Change class:** Trivial / Standard / Sensitive
**Spec:** <!-- docs/specs/... -->

## Evidence

<!-- Paste the `npm run verify` output. Then map each acceptance criterion in
     the spec to the test or observation that demonstrates it. -->

## Definition of Done

- [ ] Every acceptance criterion demonstrated with evidence above — not asserted
- [ ] `npm run verify` green
- [ ] Sensitive only: the test was shown **failing before** and passing after
- [ ] Change-completeness: everything this replaces is gone, in code **and** in
      `docs/specs/` (grepped to zero)
- [ ] Spec matches the final behavior, including anything changed mid-review
- [ ] No new component without a reuse decision against `docs/specs/component/`
- [ ] Anything that cost time is written down in `docs/TRAPS.md`
- [ ] **Learner-facing:** after merge to `main`, run `npm run release:shame` or
      `npm run release:ship` (not on this branch — see `docs/VERSIONING.md`).
      Use `--no-push` if GitHub is unavailable; push the commit when billing is
      restored.

## Deliberately not done

<!-- Scope you left out on purpose, so a reviewer does not report it as a gap. -->
