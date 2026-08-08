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
| **Use case** | a feature, a screen |
| **Spec** | a design doc, a ticket |
| **Acceptance criterion** | a task, a checklist item |
| **Change class** | a priority or a size estimate |
| **Gate** | a guideline |
| **Terminal state** | a final UI screen |
| **Trap** | a known bug |

---

## Domain terms

Derived from [`study/`](study/). One term, one meaning, everywhere — code,
specs, UI copy and conversation.

Terms marked **⚠ undecided** have no canonical form yet — using them in a spec
requires a `⚠ SPEC GAP` line, not a guess.

### Vocabulary and scheduling → [`study/04`](study/04-flashcards-srs.md)

| Term | Means | Not |
| --- | --- | --- |
| **Word** | A lexical entry in the target language, identified by lemma + part of speech. Owns one or more Tasks. | a Card, a word form |
| **Task** | One question about a Word (meaning recall, form recall, audio recall, cloze …). **Carries its own schedule.** | a Card |
| **Card** | The user-facing word for a Task. UI copy only — never a code identifier. | a Word |
| **Review** | One answered Task with its grade, latency and timestamp. Append-only. | a session |
| **Session** | A fixed-length run of Tasks. Has a visible end. | a lesson, a level |
| **Stability** | FSRS: days until recall probability falls to the target. Grows with successful review. | difficulty, ease |
| **Difficulty** | FSRS: how hard *this* Word is for *this* user. | the CEFR level of the Word |
| **Retrievability** | FSRS: probability of recall right now. Drives what is due. | due date |
| **Target retention** | The recall probability the schedule aims for (e.g. 0.9). A user setting. | accuracy |
| **Leech** | A Task that keeps failing. Suspended and flagged for repair, not repeated harder. | a hard Task |
| **Paradigm cell** | The position a form occupies in its inflection pattern — class × tense/mood × person for verbs, number/gender for nouns. Stored **with** each form→lemma mapping. Failing `parliamo` while passing `parlare` is a form gap, not a vocabulary gap. | a word form, a grammar topic |
| **Form mastery** | A level-model signal of its own: which paradigm cells the learner can produce. Never folded into vocabulary size. | vocabulary, grammar knowledge |
| **Frequency rank** | Position of a Word in the language's frequency list. The bridge between Reviews and Level. | difficulty |

### Level and progress → [`study/03`](study/03-level-model.md)

| Term | Means | Not |
| --- | --- | --- |
| **Skill** | One of exactly four: reading, listening, speaking, writing. | a topic, an exercise type |
| **Level** | A CEFR sub-level, `A1.1` … `C2.4`, plus percent within it. Always per Skill. | XP, a course position |
| **Overall level** | Derived from the Skills that **count**: second-lowest of three or four, the minimum of two, undefined for one. Never stored as truth. | the average, a score over all four regardless of status |
| **Skill status** | One of: measured · uncertain · not measured · not in profile. The last two are out of the Overall level. Defined in exactly one place — [`study/03`](study/03-level-model.md). | a difficulty, a goal |
| **Estimated vocabulary size** | Modelled count of known word families, from Stability × Frequency rank. | the number of Cards |
| **Coverage** | Share of tokens in a given text this user knows. Selects content; 95–98 % is the target band. | reading level |
| **Signal** | One measured input to a Level (the six in `study/03`). The only thing recorded directly. | a score |
| **Calibration** | The versioned mapping from Signals to Levels. Changing it is a dated, visible event. | a formula |
| **Demonstrated level** | A level the learner just showed rather than one computed for them — the Demonstration sentence read without tapping anything. One item, and treated as one item. | the Level, a test result |
| **Home** | The signed-in first screen. What it contains is a spec question, not a terminology one — an earlier version of this row listed four blocks (including a "stats" block that is not a term here) and thereby settled a composition no spec had decided. | the Landing page (that is signed-out), the Map |
| **Landing page** | The **signed-out** public surface at `/`. Everything a visitor sees before creating the account [ADR-0006](adr/0006-require-an-account.md) requires. | Home |
| **Demonstration sentence** | One sentence shown on Home, a level step above the estimate, that the learner checks by tapping what they are unsure of. A demonstration, never a claim or a self-report. | a test, a placement question, a daily goal |
| **Stagnation marker** | One of four observable patterns: below-norm accuracy on a cell, **alternation** on the same cell, backsliding, de-acceleration. Named as an observation with a matched Method, never as a verdict. | a plateau, low activity |

### Content → [`study/05`](study/05-input-reading-listening.md)

| Term | Means | Not |
| --- | --- | --- |
| **Text** | A readable unit with a known token profile. | a lesson |
| **Track** | An audio unit with a synchronised transcript. | a Text |
| **Transcript** | Target-language text time-aligned to a Track. | a translation |
| **Reveal level** | Audio only / + transcript / + translation. Recorded per listening, because it changes what the listening proves. | a difficulty setting |
| **Series** | 4–6 Texts or Tracks on one topic (narrow reading/listening). | a course, a unit |
| **Sheet** | A printable offline exercise, and the record that closes its loop back into Reviews. | a worksheet PDF |

### Practice methods → [`study/12`](study/12-method-cards.md)

| Term | Means | Not |
| --- | --- | --- |
| **Method** | A named way of practising (dictation, listening at reveal level 1, free production …). Declares a target skill, a **target signal**, an intensity, duration variants and setting requirements. | a Task, a Session |
| **Method card** | The user-facing presentation of a Method. | a Card (that is a Task) |
| **Daily menu** | The three Methods offered today, given budget, setting, floors, effect and preference. | a plan, a course |
| **Intensity** | Cognitive load of a Method, in three steps. Answers "can I manage this now?" | duration, difficulty of the material |
| **Context** | What is available to the learner right now, across eight dimensions: eyes, hands, voice, writing surface, sound, attention, time, company. **Filters the menu before anything else** — a Method that cannot be performed now has an effect of zero. Always stated by the learner, never inferred. | a place, a preference, a time of day |
| **Context preset** | A named, editable bundle of context values the learner recognises — at the desk, cooking, on transit. | a location |
| **Demanding method** | A Method that is slow, error-rich, unmeasurable or off-app, and which engagement-optimised products therefore cannot offer. Labelled, never hidden. | an advanced Method |
| **Preference** | The thumbs signal. Governs **form** — length, timing, share, framing. | a measure of effectiveness |
| **Effect estimate** | Measured movement of a Method's target signal per hour invested, with uncertainty. Governs **selection**. | Preference |
| **Floor** | The minimum rate at which a Method is **offered** regardless of Preference, derived from its role. A floor on what the app offers, never on what the learner owes — declining costs nothing except measurement. | a goal, a streak, an obligation, a minimum amount of practice |
| **Exploration** | The share of menu slots deliberately filled with a Method the system would not have chosen, so the Effect estimate has causal footing. | randomness, variety |
| **Hidden** | A Method the *learner* deliberately switched off, from settings. Stays visibly hidden and is restorable. The **algorithm** may never put a Method in this state — that is A15. | a Method with a low share |
| **Commitment** | The catalogue's **second entry type**: a standing rule about ordinary life (write to one friend only in Italian, switch the phone's language). Active or inactive, never done or not done. No completion tracking, no streak, at most two or three at once. | a Method, a habit tracker, a goal |
| **Goal** | The skill the learner is aiming at. Changes the headline Skill, the Floors and content selection — and **nothing** about how anything is measured. | the Overall level, a target level |

**Preference and Effect estimate are never combined into one number.** Once they
are, the distinction is gone and nothing surfaces the loss — see
[`study/12`](study/12-method-cards.md).

**A Goal never touches a measurement.** If setting a goal changes a number, the
number was reporting the goal and not the learner — see
[`study/24`](study/24-speaking-as-the-goal.md).

### Perception and access → [`study/13`](study/13-pronunciation-perception.md), [`study/14`](study/14-accessibility.md)

| Term | Means | Not |
| --- | --- | --- |
| **Contrast** | A pair of target-language sound categories this L1 does not separate (English *ship*/*sheep* for a German speaker). Per language pair, finite, and the unit HVPT trains. | a minimal pair (that is one example of it) |
| **Talker pool** | The distinct voices used to train one Contrast. Its **size is the active ingredient**, not a production detail — too few and the training looks like HVPT without working. | a voice setting |
| **Skill profile** | Which of the four Skills a user counts as theirs. Excluded Skills are left out of the overall level rather than scored low. | a difficulty setting, an accessibility toggle |
| **Alternative route** | The second way to answer a Task that is bound to one Skill — speaking or choosing instead of typing. Every such spec names one or says why there is none. | a fallback, an accommodation |

### Languages and own content → [`study/17`](study/17-own-content.md), [`study/18`](study/18-language-kit.md), [`study/19`](study/19-milestones-and-map.md)

| Term | Means | Not |
| --- | --- | --- |
| **Language profile** | Declarative data for one language: script, morphology type, **counting unit**, frequency list, lemmatiser, calibration, voices. Data, never code. | a course, a language pack |
| **Counting unit** | What "one word" means in this language — lemma, word family, or segment. Declared per language; without it the vocabulary estimate has no meaning. | a word |
| **Quality tier** | A / B / C, **derived** from what the profile contains. Governs how much the app is willing to claim, especially whether a level value exists at all. | a rating of the language |
| **Source** | An audio or text item the learner added — feed, file, link. The app never curates its own catalogue. | content, a lesson |
| **Window coverage** | Coverage over a sliding window inside an item, so a hard episode can still offer a workable passage. | coverage of the item |
| **Support rung** | One of five levels of help on a hard text, from untouched original to rewritten version. The app offers the lowest rung that reaches the comfortable band. | a difficulty level |
| **Block** | A frequency band of the language, carrying its own **marginal** coverage payoff. Progress counts stable knowledge only. | a level, a lesson group |
| **Map** | The surface answering where I am, what it unlocked, what is missing to a given item, and what today moved. | a progress screen |

### ⚠ Undecided

| Term | What is unresolved |
| --- | --- |
| **Word family vs. word form** | The vocabulary estimate counts lemmas; Tasks train forms. Resolved in part: form mastery is now its own signal, not part of vocabulary size — see [`study/03`](study/03-level-model.md). What is still open is whether the *estimate* counts lemmas or families. |
| **Error category** | The closed list used by writing/speaking feedback. Must be fixed before it is counted over time — see [`study/06`](study/06-production.md). |
| **Multiword item** | Collocations and fixed expressions are Words for practice but must **not** count as *n* Words in the vocabulary estimate, or the calibration breaks. Belongs with the Word/Task decision — see [`study/16`](study/16-further-findings.md) W2. |
