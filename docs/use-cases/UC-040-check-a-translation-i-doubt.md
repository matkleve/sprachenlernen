# UC-040 — Check a translation I do not trust

<!-- id: UC-040 -->
<!-- specs:  -->

**Who:** a learner who has just been shown a translation that feels wrong.
**Wants to:** see where it came from and get a second opinion.
**So that:** a machine translation error does not become a memorised fact.

Derived from
[`../study/18-language-kit.md`](../study/18-language-kit.md) U4 and
[`../study/10-antipatterns.md`](../study/10-antipatterns.md) A5.

## Today

Translations appear without provenance. Machine translation is excellent for
high-resource pairs and noticeably worse for the rest, and the learner has no way
to tell which situation they are in. The one person who cannot audit the
translation is the person relying on it.

## Success looks like

- Every translation states its origin: checked source, machine translation, or
  generated with the rest of an item.
- One action asks for a second rendering — a different source or an alternative
  phrasing — so the learner can compare rather than accept.
- Where a word has several senses, the app shows that the shown meaning is
  **the one in this context**, and the others are one tap away. Most trust
  failures here are a correct translation of a different sense.
- Disputing a translation flags the item, stops it being scheduled while
  disputed, and feeds UC-023.
- The learner can override the translation on their own card, and the override
  wins from then on.
- For a language pair where translation quality is known to be weaker, that is
  stated with the language's quality tier (UC-036) rather than discovered
  case by case.

## Out of scope

Building a dictionary, resolving disputes between sources automatically, and
sharing overrides between learners.
