# Lexicon — acceptance criteria

Split child of [`lexicon.md`](lexicon.md). The parent owns scope, behavior and
data; this file owns the criteria alone.

AC-11 to AC-22 were added on 2026-08-08, when the lemma tables arrived and
resolution stopped being "form → one lemma". They exist because the level model
needs to distinguish knowing a word from knowing its forms — and because the
first shape of `resolve` could not express ambiguity at all, so every ambiguous
form silently became whichever analysis happened to be first.

## Acceptance criteria

### Profile

- [ ] AC-1 · Given a profile without `countingUnit`, when it is loaded, then it
      is rejected and the error names that field.
- [ ] AC-2 · Given a profile with an unknown script or morphology value, when it
      is loaded, then it is rejected.
- [ ] AC-7 · Given a profile with no lemma table, when its tier is derived, then
      it is `C`; with a lemma table `B`; with a dated calibration too, `A`.
- [ ] AC-10 · Given the shipped Spanish and Italian profiles, when loaded, then
      both validate and report tier `B`.

### Text

- [ ] AC-3 · Given text in a Latin-script language, when it is tokenised, then
      punctuation and digits are not tokens and each token carries its position.
- [ ] AC-4 · Given the same word in different case or with different surrounding
      punctuation, when normalised, then both produce the same form.

### Frequency

- [ ] AC-8 · When a frequency list is loaded, ranks shall be dense, start at 1,
      and be strictly increasing in the file's order.
- [ ] AC-9 · Given a word not in the frequency list, when its rank is requested,
      then the result is absent — never zero, and never the list length.

### Resolution

- [ ] AC-5 · Given a form with exactly one analysis in the table, when resolved,
      then the result is `single` and carries lemma, part of speech and cell.
- [ ] AC-6 · Given a form absent from the table, when resolved, then the result
      is `unknown` and carries the normalised form — never a guessed lemma, and
      never an analysis borrowed from a similar form.
- [ ] AC-11 · Given a form with more than one analysis, when resolved, then the
      result is `ambiguous` and **every** analysis is present, in the table's
      order.
- [ ] AC-12 · Given a fused form (`del`, `alla`), when resolved, then the result
      is `fused` and lists the parts — and it is **not** reported as `ambiguous`,
      because the parts are simultaneous rather than alternative.
- [ ] AC-13 · Given no lemma table at all, when any form is resolved, then the
      result is `unknown` for every form, and nothing throws.
- [ ] AC-14 · Given a form differing from a table entry only in case or
      surrounding punctuation, when resolved, then it resolves to the same
      analyses as the entry.

### Paradigm cells

- [ ] AC-15 · Given the shipped Spanish table, when `hablo` is resolved, then its
      cell is `ind.pres.1sg`; when `hablado` is resolved, `part.past.m.sg`.
- [ ] AC-16 · Given the shipped Italian table, when `dormiamo` and `parliamo` are
      resolved, then both carry cell `ind.pres.1pl` under different lemmas —
      the same cell name across conjugation classes.
- [ ] AC-17 · Given any analysis produced by the shipped tables, when its cell is
      not `null`, then it is one of the documented cell names — no source-format
      tag ever reaches a caller.
- [ ] AC-18 · Given a verb lemma described by the table, when its description is
      requested, then the conjugation class is `1`, `2` or `3`; given a noun
      lemma, a gender.
- [ ] AC-19 · Given a lemma the table does not describe, when its description is
      requested, then the result is absent — never a default class.

### Honesty about the table's own limits

- [ ] AC-20 · Given a lemma table whose declared language does not match the
      profile, when it is loaded, then it is rejected. A Spanish table under an
      Italian profile resolves plausibly and is wrong everywhere.
- [ ] AC-21 · Given a lemma table, when it is loaded, then its measured coverage
      and paradigm completeness are available to callers — a caller may not have
      to re-derive how much of the language the table actually covers.
- [ ] AC-22 · Given a malformed table (an analysis that is not a triple, a
      `fused` entry with fewer than two parts), when it is loaded, then it is
      rejected with an error naming the entry, rather than loaded partially.
