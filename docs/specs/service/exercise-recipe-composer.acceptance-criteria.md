# Exercise recipe composer — acceptance criteria

- [x] Given `partial-dictation` and a valid `sourceId`, when
      `resolveExerciseRecipe` runs, then a recipe with all six step types is
      returned.
- [x] Given a Method with no registered composer, when `resolveExerciseRecipe`
      runs, then `null` is returned.
- [x] Given `variantId: "short"` on a dictation composer (when wired), when the
      recipe is composed, then exactly one `do` loop iteration is present.
- [x] Given every row in `exercise-recipe-composer.methods.md`, when reviewed,
      then each `methodId` exists in `data/methods/*.json`.
