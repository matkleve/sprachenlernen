# data/

Per-language data. **Never code** — see `docs/specs/service/lexicon.md`.

```
languages/<code>.json    the language profile
frequency/<code>.txt     `{form} {count}`, rank = line order
lemma/<code>.json        generated: form → analyses, gen'd by scripts/build-lemma-tables.mjs
```

## Why this is data and not code

Almost everything in this app is language-independent: the scheduler, the
coverage maths, the level model, the whole interface. What differs per language
is data. Adding a language means adding files here, not extending the app.
Background: `docs/study/18-language-kit.md`.

## The frequency lists are FORM frequencies

The shipped Spanish and Italian lists count **word forms**, not lemmas. Spanish
*es*, *son*, *era* and *fue* are four entries for one lemma. This is declared in
each profile as `frequency.unit: "form"`.

## The lemma tables — tier B, not yet tier A

Both languages now ship a generated `lemma/<code>.json`, which is what moves them
from quality tier C to **B** ([`docs/specs/service/lexicon.md`](../docs/specs/service/lexicon.md)):
a level value can be reported, with a widened uncertainty band, but there is
still no dated calibration behind it.

The table is generated **at build time**, never at runtime:
`node scripts/build-lemma-tables.mjs [es|it]`. Two source shapes, because no
single project covers both languages — UniMorph (complete Wiktionary paradigms)
for Spanish, Morph-it! (a full-form lexicon) for Italian, both complemented by
Universal Dependencies treebanks for function words and fused-form decomposition
(`del` = de + el). Sources are cached in `.cache/morph/` (gitignored, large,
network-fetched); the generated table is committed so a normal checkout needs no
network. Details, including what each analysis carries and why ambiguity is
reported rather than resolved: `docs/specs/service/lexicon.md`.

**Both paradigm sources have real gaps** — UniMorph ships no Spanish `tener` at
all — and the generator measures and records what it actually produced
(`seedCoverage`, `verbParadigmsComplete`) rather than assuming completeness.

## Provenance

| | |
| --- | --- |
| Source | [hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords), MIT |
| Corpus | OpenSubtitles 2018 ([opus.nlpl.eu](https://opus.nlpl.eu)) |
| Extent | top 5,000 alphabetic forms per language |
| Register | subtitles — dialogue-heavy, interjection-heavy. Not representative of written prose |

Provenance travels with the data because a rank cannot be compared across
recalibrations without it (`docs/study/03-level-model.md`, honesty rule 4).
