# Exercise recipe composer — acceptance criteria

- [x] Given `partial-dictation` and a valid `sourceId`, when
      `resolveExerciseRecipe` runs, then a recipe with all six step types is
      returned.
- [x] Given a Method with no registered composer, when `resolveExerciseRecipe`
      runs, then `null` is returned.
- [x] Given `variantId: "short"` on a dictation composer (when wired), when the
      recipe is composed, then exactly one `do` loop iteration is present.
- [x] Given `unitId: "paragraph"` on partial dictation Start, when the recipe is
      composed, then `variantId` resolves to `standard` with multiple `do` steps.
- [x] Given held lemmas at compose time, when gap-fill steps are built, then gaps
      prefer content words whose lemmas are held.
- [x] Given every row in `exercise-recipe-composer.methods.md`, when reviewed,
      then each `methodId` exists in `data/methods/*.json`.
