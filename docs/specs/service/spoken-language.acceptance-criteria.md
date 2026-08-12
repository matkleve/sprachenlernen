# Spoken language — acceptance criteria

<!-- parent: SPEC-service-spoken-language -->

- [ ] Given a new Account at signup with `Accept-Language: de-DE`, when the
      profile is ensured, then `spoken_language` is `de`.
- [ ] Given `Accept-Language` with no shipped match, when the profile is
      ensured, then `spoken_language` is `en`.
- [ ] Given an Account with `spoken_language` `de`, when they switch learning
      language on `/profile`, then `spoken_language` stays `de`.
- [ ] Given Account B signed in, when B reads or writes A's `profiles` row,
      then zero rows are returned and the write is refused (§8 test).
- [ ] Given `/profile`, when the learner changes spoken language to `de`, then
      the page shows Deutsch as the current value.
- [ ] Given a profile read failure, then the outcome is `error`, not a guessed
      default.
