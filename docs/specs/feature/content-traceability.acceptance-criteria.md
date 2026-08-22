# Content traceability — acceptance criteria

Split child of [`content-traceability.md`](content-traceability.md).

- [x] Given a held lemma that appears in a fixture source, when the learner
      selects that word on `/words`, then the trace block names the source and
      links to its detail page.
- [x] Given a held lemma in a **catalogue** source, when selected on `/words`,
      then the trace block names that source (same as fixture/learner).
- [x] Given a lemma in no persisted source, when selected, then the empty-state copy
      appears and **no** source links are shown.
- [x] Given a demanding fixture source, when its detail opens, then coverage %
      and gap count are visible as text and the demanding loop line is present.
- [x] Given session complete after a word becomes held, when that word raised a
      source's coverage, then the session loop line names the lemma count and
      points to `/words` or `/content` — **and no mid-session card shows this**.
- [x] Given coverage history with a prior demanding snapshot, when a comfortable
      source detail opens, then the before→after unlocked line is visible as text.
- [x] Given sources that crossed into comfortable this calendar month, when `/content`
      opens, then the monthly rollup line names how many items moved.
- [x] Given any traceability surface, when rendered, then UC-021 textual
      equivalents are present for every connection named above.
