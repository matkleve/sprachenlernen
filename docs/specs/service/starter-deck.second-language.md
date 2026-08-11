# Starter deck — a second language

<!-- parent: SPEC-service-starter-deck -->

What Italian needs before a pool can be built. Investigated 2026-08-11.

Italian was investigated on 2026-08-11 and **is not buildable yet**, for three
independent reasons. None is a coding problem, which is why no Italian
scaffolding was committed — machinery for a pool that cannot be produced is
anticipation, not preparation.

The parts that *do* work: `data/frequency/it.txt` and `data/lemma/it.json` both
ship, the same ranking pipeline runs on them unchanged, and it yields **3,135**
unique lemmas — enough for stage 1 and stage 2. The top of the list is right
(`il, essere, e, avere, non, che, uno, di, a, per, fare …`), and only 6 of the
top 500 fail to resolve through the lemma table.

**1. No reachable gloss source.** `kaikki.org` is refused by the agent network
policy. The Spanish deck only exists because its glosses had already been
fetched; there is no equivalent for Italian, and no substitute was found —
Wikidata interwiki data is encyclopedic, not lexical, and FreeDict's `ita-eng`
is generated rather than in-repo. Either the host is allowed, or a different
source is chosen and its provenance recorded in `data/README.md`.

**2. The frequency list splits accented and unaccented spellings, and the
unaccented one often wins.** This is [`I18N.md`](../../I18N.md)'s "unaccented
Italian vowels" warning showing up in the source data rather than in a
translation. 91 folded groups contain both variants:

| Written | Counts | Effect |
| --- | --- | --- |
| `perche` / `perché` / `perchè` | 489,341 / 417,508 / 71,521 | one word, three ranks |
| `più` / `piu` | 424,219 / 394,239 | true count ~2× the shipped one |
| `così` / `cosi` | 351,367 / 369,960 | the misspelling outranks the word |

It cannot be folded blindly, which is the trap: `e`/`è`, `si`/`sì`, `se`/`sé`,
`da`/`dà`, `ne`/`né`, `te`/`tè` are **genuine minimal pairs** (and/is, oneself/yes,
if/self, from/gives, of-it/nor, you/tea), while `perchè` and `cosi` are simply
misspellings. So it needs a per-group ruling by someone who reads Italian, and
merging counts re-ranks the whole list — a calibration event under
[`lexicon.md`](lexicon.md), with provenance to match. Spanish does not have this
problem: its lookalikes (`más`/`mas`, `sí`/`si`, `está`/`esta`) are all real
distinct words.

**3. The app has no model for a second *learning* language.**
[`I18N.md`](../../I18N.md) covers interface copy, which is a different axis and
is at stage 0. Nothing describes how an Account chooses what it is learning,
whether progress partitions per language, or what the method catalogue does —
and `lib/starter-deck.ts` exposes `loadSpanishMeaningRecallDeck()` directly to
three callers. ⚠ **SPEC GAP: the multi-learning-language model is undecided.**
An Italian deck would have no surface to appear on until it is.
