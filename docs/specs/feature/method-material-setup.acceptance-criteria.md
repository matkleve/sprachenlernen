# Method material setup — acceptance criteria

Split child of [`method-material-setup.md`](method-material-setup.md).

- [ ] AC-1 · Given `extensive-reading` with `materialTopics`, when detail renders,
      then chips show App picks, each declared topic, and Your own.
- [ ] AC-2 · Given `srs-session`, when detail renders, then no topic chip row appears.
- [ ] AC-3 · Given **News** chip selected and a matching Source at 93 %, when the
      preview renders, then coverage is text and Start is enabled — upload hidden.
- [ ] AC-4 · Given **Your own** selected, when the panel renders, then upload,
      paste, and link controls are visible and catalogue preview is hidden.
- [ ] AC-5 · Given pasted text at 78 %, when preview renders, then demanding band
      copy appears before Start is enabled.
- [ ] AC-6 · Given a catalogue topic chip with zero Sources, when rendered, then
      the chip is disabled or shows empty-state — **no** upload field under it.
- [ ] AC-7 · Given keep unchecked after own material, when the session ends, then
      no new `/content` row appears.
- [ ] AC-8 · Given `partial-dictation` with `materialUnits` sentence + window,
      when detail renders, then preview shows unit label and coverage before Start.
