# Material unit — acceptance criteria

Split child of [`material-unit.md`](material-unit.md).

- [ ] AC-1 · Given a text Source and `sentence` unit, when resolved, then output
      is one substantial sentence and frequency-stub sentences are skipped.
- [ ] AC-2 · Given an audio Source and `window` unit with `durationSec: 300`,
      when resolved, then output is the best 300 s window by coverage service.
- [ ] AC-3 · Given partial dictation gaps, when generated, then no gap rule is
      alternating-only; function-word-only gaps are avoided in v1 subset rule.
- [ ] AC-4 · Given listening defer active, when gap-fill step renders, then
      `type-only` mode is offered and audio control is hidden.
- [ ] AC-5 · Given `full` unit on a text Source, when resolved, then output
      equals `sourceText(source)` from coverage service.
