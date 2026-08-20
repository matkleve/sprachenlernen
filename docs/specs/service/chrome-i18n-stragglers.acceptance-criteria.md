# Chrome i18n stragglers — acceptance criteria

<!-- parent: SPEC-service-chrome-i18n-stragglers -->

- [ ] Given `spoken_language` `de`, when the card report popover opens during
      review, then title, outcome line, category pills, note field, and buttons
      are German — not English literals from `review-session/content.ts`.
- [ ] Given `spoken_language` `de`, when `/methods` shows the demonstration
      sentence, then label, flip hint, grade labels, and feedback are German.
- [ ] Given `spoken_language` `de`, when a saved text detail shows the reading
      section, then the section heading and gloss dialog chrome are German.
- [ ] Given `spoken_language` `de`, when `/progress` shows a weekly reflection,
      then the entry row, deck navigation copy, card headlines/teasers, and
      visual captions are German.
- [ ] Given any of the four surfaces above, when `spoken_language` is `en`, then
      English copy still renders and no raw message keys appear.
