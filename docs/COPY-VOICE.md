# Copy voice

How the product talks. Owned here, so it cannot be re-decided per feature.

This file exists because it was missing: with no rule, the German copy drifted
into 168 `Sie` strings and 32 `du` strings — the landing page addressed the
visitor informally and the app they signed up for switched to formal two clicks
later. Nobody chose that. It is what "no owner" looks like.

> The product's honesty is not the same thing as its vocabulary. Saying *"a
> level you have not been tested on is not a level"* is the promise. Saying it
> with the word **Extrapolation** is a choice, and it was the wrong one.

---

## 1. Address the reader as `du` / "you"

German: **`du`, lowercase**, everywhere — UI, errors, legal banners, the landing
page. No `Sie`, no mixed surfaces, no "formal because it is about the account".

English: "you". Never "the user" or "the learner" in copy that the learner reads.

Enforced by `npm run verify` → `check-i18n-address`.

---

## 2. Everyday word on the surface, technical word inside the disclosure

The catalogue is derived from research and the research has its own vocabulary.
That vocabulary is welcome in `docs/`, in code, and in a disclosure panel. It is
not welcome on a tile, a heading, a column header, or a button.

The pattern already exists in the app (`components/ui/Disclosure`, `LemmaCallout`)
and in the glossary, where **Card** is the user-facing name for **Task**. Extend
it, do not invent a second mechanism.

| Concept | On the surface (de) | On the surface (en) | Technical term lives in |
| --- | --- | --- | --- |
| Lemma | Grundform | dictionary form | `LemmaCallout` disclosure |
| Paradigm cell | Wortform | word form | `ParadigmCellCallout` disclosure |
| Frequency rank | Platz / Häufigkeit | rank / how common | word detail |
| Held | Sitzt | Solid | `WordsCountDefinitions` |
| Fragile | Wackelt | Shaky | `WordsCountDefinitions` |
| Mature | Sitzt fest | Rock solid | atlas tier only |
| Signal | Messwert | measurement | Progress prose |
| Evidence grade | Gut / Solide / Dünn belegt | Strong / Solid / Thin evidence | method detail prose |

When a technical term genuinely has to appear, name it as one in parentheses:
*"(Fachwort: Lemma.)"* Readers who want it find it; readers who do not are not
taxed by it.

**Method names describe first, then label.** A card headed `Shadowing` or
`HVPT` tells a newcomer nothing, and a catalogue of sixty of those is a wall.
The name leads with what you would actually do. Where the method has an
established name a learner would want in order to find material elsewhere, that
name follows in parentheses — it is not dropped:

> *"Mitsprechen, kurz versetzt (Shadowing)"* · *"Ähnliche Laute unterscheiden
> (Minimalpaare)"* · *"Hören, dann aus dem Kopf nachbauen (Dictogloss)"*

Four entries earn the parenthesis. An acronym nobody searches for does not —
`HVPT` was dropped rather than parenthesised.

**A concept the glossary owns keeps one name.** Changing the surface word means
editing [`GLOSSARY.md`](GLOSSARY.md) in the same change — that is what the
"one term, one meaning" rule is for. It does not mean the surface word must be
the internal one.

---

## 3. One idea per sentence, about twenty words

The old copy averaged well over that, and nineteen sentences ran past 22 words.
Long sentences are not more honest, they are just harder to finish.

- Split on the semicolon. A semicolon in UI copy is almost always two sentences.
- At most one em-dash aside per sentence, never two.
- Cut the aphorism. *"Feeling slow at that pace is arithmetic, not failure"* is
  a good line in an essay and a wall in an interface. Say what it means.
- No compound nouns over ~18 characters. `Abstands-Wiederholungssitzung` is not
  a word anyone says out loud.

---

## 4. Say what happened and what to do

Failure copy names the thing that failed and what is still true. It never
apologises and never blames. The rule for `userMessage` in
[`specs/service/errors.md`](specs/service/errors.md) applies to all copy:

> *"Deine Bewertung konnte nicht gespeichert werden."* — not *"Ein Fehler ist
> aufgetreten."*

Empty states are a starting position, not a verdict: *"Das ist der ehrliche
Anfang"* survives; *"kein Versagen"* does not need saying twice.

---

## 5. Where copy lives

`messages/en.json` (source) and `messages/de.json`. Never inline in JSX —
[`AGENTS.md`](../AGENTS.md) § Code style, [`I18N.md`](I18N.md) stage 1.

Two blocks are **generated** and must be edited at their source, then synced
with `node scripts/sync-method-catalogue-i18n.mjs`:

- `methodMenu.entries.*` (en) ← `data/methods/*.json`
- `methodMenu.entries.*` (de) ← `data/i18n/method-catalogue/de.json`

Editing them directly in `messages/` looks fine until the next sync silently
reverts it.

---

## Known gaps

- `features/language-status/content.ts` and
  `features/progress/weekly-reflection/content.ts` are still English-only
  `content.ts` copy, outside `messages/`. `/languages` is a **public** page
  linked from the German landing page and shows English to a German visitor.
  Moving them into `messages/` adds i18n keys, so it is its own change.
- `features/review-session/content.ts` and the other `content.ts` files marked
  *Legacy* still hold the pre-`messages/` English copy. They are unread by the
  app; nothing was updated in them.
