# Exercise runner — acceptance criteria

Split child of [`exercise-runner.md`](exercise-runner.md).

- [ ] Given a fixture recipe with six step types, when the runner loads, then
      step 1 renders and the duration bar reflects the recipe.
- [ ] Given step 2 is active, when the learner taps ▶ without **Fertig**, then
      step 3 is **seen**, step 2 is not **done**, and any running wait timer
      continues.
- [ ] Given a `wait` step with a running timer, when the learner navigates away
      and back, then elapsed time increased and the timer pill is still visible.
- [ ] Given timer expiry on a `wait` step, when the banner appears, then the
      step is not auto-**done**.
- [ ] Given a `submit` step with `accept: ["photo","text"]`, when the learner
      taps **Eingereicht** with neither, then the step stays not **done**.
- [ ] Given a photo submitted, when the learner navigates to `review`, then the
      photo is still available for that session.
- [ ] Given `review` + `self-mark`, when the learner taps error tokens then
      **Durchgesehen**, then tokens are passed to `decide`.
- [ ] Given `review` + `feedback` in v1, when rendered, then honest
      not-automated copy appears and self-mark fallback is available.
- [ ] Given `decide` with two offers, when the learner taps decline, then phase
      is `complete` and nothing is scheduled for tomorrow.
- [ ] Given mid-recipe, when Stop is confirmed, then phase is `abandoned` and no
      backlog entry is created.
- [ ] Given viewport `< md`, when any step is active, then the page does not
      scroll (`one-screen-runner`).
