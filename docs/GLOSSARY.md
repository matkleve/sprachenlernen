# Glossary

Canonical terminology. Use these exact words in code, specs, UI copy and
conversation. When one concept has two names, people eventually believe it is
two concepts — and then someone builds it twice.

**Rules**

- One term, one meaning. If you need a second meaning, you need a second term.
- The term used in the UI is the term used in the code. No internal-only
  synonyms for user-visible things.
- Renaming a term means renaming it **everywhere in the same change** — code,
  specs, tests, copy. Half-renames are the reason glossaries stop being trusted.
- Add the term here *before* using it in a spec.

---

## Process terms (fixed — these ship with the base project)

| Term | Means | Not |
| --- | --- | --- |
| **Use case** | What a person is trying to accomplish, in their words. Lives in `docs/use-cases/`. | a feature, a screen |
| **Spec** | The implementation contract for one thing. Lives in `docs/specs/`. | a design doc, a ticket |
| **Acceptance criterion** | One testable statement of observable behavior. | a task, a checklist item |
| **Change class** | Trivial / Standard / Sensitive. Declared before work starts. | a priority or a size estimate |
| **Gate** | A check that can fail and block. Runs in `npm run verify`. | a guideline |
| **Terminal state** | A state that can never be left; acting on it is a no-op. | a final UI screen |
| **Trap** | A documented way this codebase misleads people. Lives in `docs/TRAPS.md`. | a known bug |

---

## Domain terms

Derived from [`studie/`](studie/). Code, specs and UI copy use the English term;
the German column exists because the study and the product's first UI language
are German, and a term that translates two ways is a term that will be built
twice.

Terms marked **⚠ undecided** have no canonical form yet — using them in a spec
requires a `⚠ SPEC GAP` line, not a guess.

### Vocabulary and scheduling → [`studie/04`](studie/04-karteikarten-srs.md)

| Term | Deutsch | Means | Not |
| --- | --- | --- | --- |
| **Word** | Wort | A lexical entry in the target language, identified by lemma + part of speech. Owns one or more Tasks. | a Card, a word form |
| **Task** | Aufgabe | One question about a Word (meaning recall, form recall, audio recall, cloze …). **Carries its own schedule.** | a Card |
| **Card** | Karte | The user-facing word for a Task. UI copy only — never a code identifier. | a Word |
| **Review** | Wiederholung | One answered Task with its grade, latency and timestamp. Append-only. | a session |
| **Session** | Lerneinheit | A fixed-length run of Tasks. Has a visible end. | a lesson, a level |
| **Stability** | Stabilität | FSRS: days until recall probability falls to the target. Grows with successful review. | difficulty, ease |
| **Difficulty** | Schwierigkeit | FSRS: how hard *this* Word is for *this* user. | the CEFR level of the Word |
| **Retrievability** | Abrufwahrscheinlichkeit | FSRS: probability of recall right now. Drives what is due. | due date |
| **Target retention** | Zielretention | The recall probability the schedule aims for (e.g. 0.9). A user setting. | accuracy |
| **Leech** | Sperrkarte | A Task that keeps failing. Suspended and flagged for repair, not repeated harder. | a hard Task |
| **Paradigm cell** | Paradigmenzelle | The position a form occupies in its inflection pattern — class × tense/mood × person for verbs, number/gender for nouns. Stored **with** each form→lemma mapping. Failing `parliamo` while passing `parlare` is a form gap, not a vocabulary gap. | a word form, a grammar topic |
| **Form mastery** | Formbeherrschung | A level-model signal of its own: which paradigm cells the learner can produce. Never folded into vocabulary size. | vocabulary, grammar knowledge |
| **Frequency rank** | Frequenzrang | Position of a Word in the language's frequency list. The bridge between Reviews and Level. | difficulty |

### Level and progress → [`studie/03`](studie/03-level-modell.md)

| Term | Deutsch | Means | Not |
| --- | --- | --- | --- |
| **Skill** | Fertigkeit | One of exactly four: reading, listening, speaking, writing. | a topic, an exercise type |
| **Level** | Level | A CEFR sub-level, `A1.1` … `C2.4`, plus percent within it. Always per Skill. | XP, a course position |
| **Overall level** | Gesamtlevel | Derived from the Skills that **count**: second-lowest of three or four, the minimum of two, undefined for one. Never stored as truth. | the average, a score over all four regardless of status |
| **Skill status** | Fertigkeitsstatus | One of: measured · uncertain · not measured · not in profile. The last two are out of the Overall level. Defined in exactly one place — [`studie/03`](studie/03-level-modell.md). | a difficulty, a goal |
| **Estimated vocabulary size** | Wortschatzgröße | Modelled count of known word families, from Stability × Frequency rank. | the number of Cards |
| **Coverage** | Abdeckung | Share of tokens in a given text this user knows. Selects content; 95–98 % is the target band. | reading level |
| **Signal** | Messgröße | One measured input to a Level (the six in `studie/03`). The only thing recorded directly. | a score |
| **Calibration** | Kalibrierung | The versioned mapping from Signals to Levels. Changing it is a dated, visible event. | a formula |

### Content → [`studie/05`](studie/05-input-lesen-hoeren.md)

| Term | Deutsch | Means | Not |
| --- | --- | --- | --- |
| **Text** | Text | A readable unit with a known token profile. | a lesson |
| **Track** | Hörstück | An audio unit with a synchronised transcript. | a Text |
| **Transcript** | Transkript | Target-language text time-aligned to a Track. | a translation |
| **Reveal level** | Sichtbarkeitsstufe | Audio only / + transcript / + translation. Recorded per listening, because it changes what the listening proves. | a difficulty setting |
| **Series** | Serie | 4–6 Texts or Tracks on one topic (narrow reading/listening). | a course, a unit |
| **Sheet** | Blatt | A printable offline exercise, and the record that closes its loop back into Reviews. | a worksheet PDF |

### Practice methods → [`studie/12`](studie/12-methodenkarten.md)

| Term | Deutsch | Means | Not |
| --- | --- | --- | --- |
| **Method** | Methode | A named way of practising (dictation, listening at reveal level 1, free production …). Declares a target skill, a **target signal**, an intensity, duration variants and setting requirements. | a Task, a Session |
| **Method card** | Methodenkarte | The user-facing presentation of a Method. | a Card (that is a Task) |
| **Daily menu** | Tagesmenü | The three Methods offered today, given budget, setting, floors, effect and preference. | a plan, a course |
| **Intensity** | Intensität | Cognitive load of a Method, in three steps. Answers "can I manage this now?" | duration, difficulty of the material |
| **Context** | Kontext | What is available to the learner right now, across eight dimensions: eyes, hands, voice, writing surface, sound, attention, time, company. **Filters the menu before anything else** — a Method that cannot be performed now has an effect of zero. Always stated by the learner, never inferred. | a place, a preference, a time of day |
| **Context preset** | Kontext-Voreinstellung | A named, editable bundle of context values the learner recognises — at the desk, cooking, on transit. | a location |
| **Demanding method** | Harte Methode | A Method that is slow, error-rich, unmeasurable or off-app, and which engagement-optimised products therefore cannot offer. Labelled, never hidden. | an advanced Method |
| **Preference** | Vorliebe | The thumbs signal. Governs **form** — length, timing, share, framing. | a measure of effectiveness |
| **Effect estimate** | Wirkungsschätzung | Measured movement of a Method's target signal per hour invested, with uncertainty. Governs **selection**. | Preference |
| **Floor** | Grundfrequenz | The minimum rate at which a Method is offered regardless of Preference, derived from its role. Negotiates over length, never over existence. | a goal, a streak |
| **Exploration** | Erkundung | The share of menu slots deliberately filled with a Method the system would not have chosen, so the Effect estimate has causal footing. | randomness, variety |
| **Hidden** | Ausgeblendet | A Method the *learner* deliberately switched off, from settings. Stays visibly hidden and is restorable. The **algorithm** may never put a Method in this state — that is A15. | a Method with a low share |

**Preference and Effect estimate are never combined into one number.** Once they
are, the distinction is gone and nothing surfaces the loss — see
[`studie/12`](studie/12-methodenkarten.md).

### Perception and access → [`studie/13`](studie/13-aussprache-hoerwahrnehmung.md), [`studie/14`](studie/14-barrierefreiheit.md)

| Term | Deutsch | Means | Not |
| --- | --- | --- | --- |
| **Contrast** | Kontrast | A pair of target-language sound categories this L1 does not separate (English *ship*/*sheep* for a German speaker). Per language pair, finite, and the unit HVPT trains. | a minimal pair (that is one example of it) |
| **Talker pool** | Sprecherpool | The distinct voices used to train one Contrast. Its **size is the active ingredient**, not a production detail — too few and the training looks like HVPT without working. | a voice setting |
| **Skill profile** | Fertigkeitsprofil | Which of the four Skills a user counts as theirs. Excluded Skills are left out of the overall level rather than scored low. | a difficulty setting, an accessibility toggle |
| **Alternative route** | Alternativweg | The second way to answer a Task that is bound to one Skill — speaking or choosing instead of typing. Every such spec names one or says why there is none. | a fallback, an accommodation |

### Languages and own content → [`studie/17`](studie/17-eigene-inhalte.md), [`studie/18`](studie/18-sprachen-baukasten.md), [`studie/19`](studie/19-meilensteine-und-karte.md)

| Term | Deutsch | Means | Not |
| --- | --- | --- | --- |
| **Language profile** | Sprachprofil | Declarative data for one language: script, morphology type, **counting unit**, frequency list, lemmatiser, calibration, voices. Data, never code. | a course, a language pack |
| **Counting unit** | Zähleinheit | What "one word" means in this language — lemma, word family, or segment. Declared per language; without it the vocabulary estimate has no meaning. | a word |
| **Quality tier** | Qualitätsstufe | A / B / C, **derived** from what the profile contains. Governs how much the app is willing to claim, especially whether a level value exists at all. | a rating of the language |
| **Source** | Quelle | An audio or text item the learner added — feed, file, link. The app never curates its own catalogue. | content, a lesson |
| **Window coverage** | Fensterabdeckung | Coverage over a sliding window inside an item, so a hard episode can still offer a workable passage. | coverage of the item |
| **Support rung** | Stützstufe | One of five levels of help on a hard text, from untouched original to rewritten version. The app offers the lowest rung that reaches the comfortable band. | a difficulty level |
| **Block** | Block | A frequency band of the language, carrying its own **marginal** coverage payoff. Progress counts stable knowledge only. | a level, a lesson group |
| **Map** | Karte | The surface answering where I am, what it unlocked, what is missing to a given item, and what today moved. | a progress screen |

### ⚠ Undecided

| Term | What is unresolved |
| --- | --- |
| **Word family vs. word form** | The vocabulary estimate counts lemmas; Tasks train forms. Resolved in part: form mastery is now its own signal, not part of vocabulary size — see [`studie/03`](studie/03-level-modell.md). What is still open is whether the *estimate* counts lemmas or families. |
| **Error category** | The closed list used by writing/speaking feedback. Must be fixed before it is counted over time — see [`studie/06`](studie/06-produktion.md). |
| **Multiword item** | Collocations and fixed expressions are Words for practice but must **not** count as *n* Words in the vocabulary estimate, or the calibration breaks. Belongs with the Word/Task decision — see [`studie/16`](studie/16-weitere-befunde.md) W2. |
