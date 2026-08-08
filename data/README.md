# data/

Per-language data. **Never code** — see `docs/specs/service/lexicon.md`.

```
languages/<code>.json    the language profile
frequency/<code>.txt     `{form} {count}`, rank = line order
```

## Why this is data and not code

Almost everything in this app is language-independent: the scheduler, the
coverage maths, the level model, the whole interface. What differs per language
is data. Adding a language means adding files here, not extending the app.
Background: `docs/studie/18-sprachen-baukasten.md`.

## The frequency lists are FORM frequencies

The shipped Spanish and Italian lists count **word forms**, not lemmas. Spanish
*es*, *son*, *era* and *fue* are four entries for one lemma. This is declared in
each profile as `frequency.unit: "form"` and it is the reason both languages
currently derive quality tier **C** — and therefore report no level value at all.

That is the mechanism working. A vocabulary count whose unit is undefined is not
a measurement, so the app declines to make one rather than producing a plausible
number that means nothing.

To reach tier B, a form → lemma table is needed. It is generated **at build
time** by a morphological analyser (Stanza / UDPipe, ~70 languages on one
UD-based architecture) and shipped as a lookup table; nothing analyses morphology
at runtime.

## Provenance

| | |
| --- | --- |
| Source | [hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords), MIT |
| Corpus | OpenSubtitles 2018 ([opus.nlpl.eu](https://opus.nlpl.eu)) |
| Extent | top 5,000 alphabetic forms per language |
| Register | subtitles — dialogue-heavy, interjection-heavy. Not representative of written prose |

Provenance travels with the data because a rank cannot be compared across
recalibrations without it (`docs/studie/03-level-modell.md`, honesty rule 4).
