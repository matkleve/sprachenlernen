# UC-035 — Learn a language the app does not ship yet

<!-- id: UC-035 -->
<!-- specs: SPEC-service-lexicon -->

**Who:** someone who wants Norwegian, or Portuguese, or Czech — and finds the
app offers Spanish and Italian.
**Wants to:** add it and start.
**So that:** the choice of language is theirs, not a consequence of what someone
had time to build.

Derived from
[`../study/STUDY-016-language-kit.md`](../study/STUDY-016-language-kit.md).

## Today

Every app supports a fixed list, because each language is treated as a separate
product. In fact almost everything — the scheduler, the coverage maths, the
level model, the whole interface — is language-independent. What differs is
**data**: a frequency list, a lemmatiser, a calibration, voices.

## Success looks like

- Adding a language means supplying a **profile**, not writing code. The profile
  declares script, morphology type, what counts as a word, and where the
  frequency list and lemmatiser come from.
- With a frequency list and a lemmatiser, the learner can start: cards, reading,
  coverage all work.
- Where an off-the-shelf lemmatiser exists — which is the case for around 70
  languages — no linguistic work is required to get there.
- A starting deck can be generated from the top frequency ranks with machine
  translation and synthetic audio, and is marked as generated throughout.
- A profile missing its counting-unit declaration **cannot be loaded**. A
  silently wrong vocabulary count is worse than an unavailable language, and it
  goes unnoticed longest in exactly the languages where it is most wrong.
- What the language does not yet support is stated up front, not discovered.

## Out of scope

Sign languages, constructed languages, dialects without a written standard, and
promising equal quality across languages — that is UC-036.
