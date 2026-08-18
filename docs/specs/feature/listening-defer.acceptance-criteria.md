# Listening defer — acceptance criteria

Split child of [`listening-defer.md`](listening-defer.md).

Menu ACs **deferred** with mixed stacks (owner 2026-08-18). Runner AC stays.

- [ ] AC-1 · Given defer off, when menu filters with sound refine, then sound
      methods appear per UC-045 rules. *(deferred — no menu defer UI)*
- [ ] AC-2 · Given user taps Can't listen now, when menu re-renders, then methods
      with `requires.sound` are absent (not greyed). *(deferred — mixed stacks)*
- [x] AC-3 · Given defer active, when partial dictation runs, then gap-fill step
      has no audio control and accepts typed input only.
- [ ] AC-4 · Given defer started at T, when T + 15 min passes, then defer clears
      without navigation.
- [ ] AC-5 · Given defer active, when user taps Listen again on banner, then
      defer clears immediately. *(deferred — mixed stacks)*
