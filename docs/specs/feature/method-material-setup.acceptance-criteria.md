# Method material setup — acceptance criteria

Split child of [`method-material-setup.md`](method-material-setup.md).

- [x] AC-1 · Given `extensive-reading` with `materialTopics`, when detail renders,
      then chips show App picks, each declared topic, and Your own.
- [x] AC-2 · Given `srs-session`, when detail renders, then no topic chip row appears.
- [x] AC-3 · Given **News** chip selected and a matching Source at 93 %, when the
      preview renders, then coverage is text and Start is enabled — upload hidden.
- [x] AC-4 · Given **Your own** selected, when the panel renders, then upload,
      paste, and link controls are visible and catalogue preview is hidden.
- [x] AC-5 · Given pasted text at 78 %, when preview renders, then demanding band
      copy appears before Start is enabled.
- [x] AC-6 · Given a catalogue topic chip with zero Sources, when rendered, then
      the chip is disabled or shows empty-state — **no** upload field under it.
- [x] AC-7 · Given band-level adapted text with **personal** coverage ≥ 95 % on
      shown body, when preview renders, then comfortable copy and Start after ~N min.
- [x] AC-8 · Given band-level adapted text with personal coverage 80–94 %, when
      preview renders, then T1/gap copy appears and Start follows support ladder.
- [x] AC-10 · Given band-level adapted text with personal coverage &lt; 80 %, when
      preview renders, then honest block copy — Start disabled.
- [x] AC-9 · Given a method with `materialTopics`, when detail renders, then topic
      chips and Start appear **above** `trains` prose — not below the article body.
- [x] AC-11 · Given active Lernwelt `politics`, when App picks runs, then only
      sources with `world = politics` or unset are ranked (T-W26).
- [x] AC-12 · Given active Lernwelt `politics`, when a topic chip resolves a
      catalogue source, then the same world prefilter applies before tag ranking
      (T-W26).
