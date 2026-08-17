# Coverage — acceptance criteria

Split child of [`coverage.md`](coverage.md).

- [ ] AC-1 · Given a text where every token resolves to held lemmas, when
      coverage is computed, then the result is 100.0 %.
- [ ] AC-2 · Given a text with one unknown token in ten, when coverage is
      computed, then the result is 90.0 %.
- [ ] AC-3 · Given coverage 94.9 %, when band is derived, then `comfortBand` is
      `demanding`; at 95.0 % it is `comfortable`; at 98.1 % it is `speed`.
- [ ] AC-4 · Given a lemma held and appearing in two fixture sources, when the
      reverse index is built, then both source ids are listed for that lemma.
- [ ] AC-5 · Given an audio source whose full transcript is 80 % but contains a
      60 s window at 96 %, when window coverage runs, then the best window is
      returned first with its percent.
- [ ] AC-6 · Given a fused form where one part is held and one is not, when
      coverage is computed, then that token position counts as not fully known.
- [ ] AC-7 · Given a recalibrated language profile, when history is appended,
      then `calibrationDated` matches the profile’s `calibration.dated` value.
