# Exercise step components — acceptance criteria

- [x] Given a shipped component id in a recipe, when the runner renders that
      step, then the registry delegate renders that component — not a generic
      fallback.
- [x] Given an unknown `component` id, when the runner renders, then honest
      not-built copy appears — not a silent empty step.
- [x] Given `gap-fill` under listening defer (UC-077), when the step renders,
      then audio controls are hidden and type-only blanks remain.
- [x] Given a text Source on a dictation step, when the learner taps Play audio,
      then the sentence is spoken via browser speech synthesis in the learning
      language — no external clip required.
- [ ] Given the component table in `exercise-step-components.md`, when a new
      hosted Method is added to the catalogue, then it maps to at least one
      component id in `exercise-recipe-composer.methods.md`.
