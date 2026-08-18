# Word capture — acceptance criteria

Split child of [`word-capture.md`](word-capture.md).

- [x] AC-1 · Given signed-in learner, own text, keep checked, when Start is
      pressed, then a `content_sources` row exists and practice resolves it.
- [x] AC-2 · Given saved learner sources for the active language, when `/content`
      loads, then they appear alongside fixture/catalogue sources.
- [x] AC-3 · Given own text and keep unchecked, when Start is pressed, then an
      ephemeral cookie is set and practice resolves — no `/content` list row.
- [x] AC-4 · Given own text above the ephemeral size budget with keep unchecked,
      then Start is rejected with honest copy (must save or shorten).
- [x] AC-5 · Given keep checked while signed out, then Start is blocked.
