# Method guided sessions — acceptance criteria

- [ ] Given every row in `exercise-recipe-composer.methods.md`, when the
      catalogue is loaded, then the `methodId` exists in `data/methods/*.json`.
- [ ] Given every catalogue method and commitment id, when
      `exercise-recipe-composer.methods.md` is read, then exactly one row
      declares **session kind** (`graded`, `guided`, `card`, or `check-in`) and
      a non-empty recipe mix.
- [ ] Given `hosted: false`, when `method-guided-sessions.md` and
      `method-catalogue.md` are read, then **guided** sessions on `/practice` are
      allowed — `hosted` does not forbid Start.
- [ ] Given a guided recipe, when the step list is read, then it includes
      `confirm-done` or honest self-report before terminal `decide`, except
      card-only Methods.
- [ ] Given `translate-a-song`, when the recipe is read, then it includes
      `song-picker`, adaptive line selection, and `type-freely` — not only
      static catalogue lyrics.
- [ ] Given `role-play`, when the recipe is read, then it includes `wait` for
      the off-screen block between prep and `confirm-done`.
