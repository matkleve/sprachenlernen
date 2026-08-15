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

### Accounts and access → [`adr/0006`](adr/0006-require-an-account.md), [`adr/0007`](adr/0007-supabase-as-the-provider.md)

| Term | Means | Not |
| --- | --- | --- |
| **Account** | The authenticated identity a person signs up for and signs in with — one row in Supabase Auth, one UUID, required before the first Review. | a Profile, a subscription, a device |
| **Auth session** | The signed-in state a browser holds after sign-in, restored on every request from Supabase's session cookie. Always qualified with "auth" because **Session** already means a fixed-length run of Tasks — the two must never share a bare name. | a Session, a review |

### Vocabulary and scheduling → [`study/04`](study/04-flashcards-srs.md)

| Term | Means | Not |
| --- | --- | --- |
| **Word** | A lexical entry in the target language, identified by lemma + part of speech. Owns one or more Tasks. | a Card, a word form |
| **Task** | One question about a Word (meaning recall, form recall, audio recall, cloze …). **Carries its own schedule.** | a Card |
| **Card** | The user-facing word for a Task. UI copy only — never a code identifier. | a Word |
| **Review** | One answered Task with its grade, latency and timestamp. Append-only. | a session |
| **Session** | A fixed-length run of Tasks. Has a visible end. | a lesson, a level, an auth session, a login |
| **Stability** | FSRS: days until recall probability falls to the target. Grows with successful review. | difficulty, ease |
| **Difficulty** | FSRS: how hard *this* Word is for *this* user. | the CEFR level of the Word |
| **Retrievability** | FSRS: probability of recall right now. Drives what is due. | due date |
| **Target retention** | The recall probability the schedule aims for (e.g. 0.9). A user setting. | accuracy |
| **Held** | A Task in `review` with stability ≥ held threshold (~7 days), ≥2 successes, no trailing `again`. Counts toward vocabulary size. | graduated, mature, seen |
| **Fragile** | Reviewed but not held — still in `learning`/`relearning`, below held threshold, or not enough evidence. | shaky, learning |
| **Mature** | A held Task whose stability ≥ mature threshold (~21 days). Atlas display tier, not a separate count. | graduated |
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
| **Method catalogue** | The shipped data listing every named way to practise (~53 Methods). Browsable and filterable; honest about evidence and hosting. Listing a Method does not mean the app runs it. | the daily menu, the method menu |
| **Method engine** | The runnable implementation that turns one catalogue Method into a session — content pool, grading, persistence. One engine may serve more than one Method; each Method has at most one engine. | a Method, the catalogue |
| **Hosted method** | A catalogue entry with `hosted: true` — the product intends to run it in-app. **Does not mean the session is built today.** | built, in-app-only |
| **Card engine** | The Method engine that ships first: FSRS scheduling over lemma Tasks. Today: `srs-session` on `/words/review`. | flashcards, the whole app |
| **Words destination** | The navigation surface for the card engine's material — holdings, horizon, atlas — not the home for every Method. | Methods, Home |
| **Method card** | The user-facing presentation of a Method — section header graphic, badge row, tag chips, and summary. | a Card (that is a Task) |
| **Method card header** | Decorative top band on a Method card: one abstract graphic per catalogue **section**, gradient fade, section label. Not shown on the detail page. | a per-method illustration, a quality badge |
| **Method badge** | One of three non-interactive marks on a Method card or detail page: **skill contribution** (per skill), **evidence grade** (A–D), or **effort load** (intensity dots). Never combined into one score. | a Chip, a quality tier, a streak |
| **Section graphic** | The shared header image for all Methods in one catalogue section (~8 assets). Groups cards visually without ranking them. | a Method badge, a section filter |
| **Skill contribution** | How much a Method serves one of the four Skills: primary, secondary, or slight. Shown as skill marks — not a global gold/silver/copper rank. | evidence grade, effect estimate |
| **Daily menu** | The three Methods offered today, given budget, setting, floors, effect and preference. | a plan, a course |
| **Intensity** | Cognitive load of a Method, in three steps. Answers "can I manage this now?" | duration, difficulty of the material |
| **Context** | What is available to the learner right now, across eight dimensions: eyes, hands, voice, writing surface, sound, attention, time, company. **Filters the menu before anything else** — a Method that cannot be performed now has an effect of zero. Always stated by the learner, never inferred. | a place, a preference, a time of day |
| **Context preset** | A named, editable bundle of context values the learner recognises — at the desk, cooking, on transit. | a location |
| **Demanding method** | A Method that is slow, error-rich, unmeasurable or off-app, and which engagement-optimised products therefore cannot offer. Labelled, never hidden. | an advanced Method |
| **Preference** | The thumbs signal. Governs **form** — length, timing, share, framing. | a measure of effectiveness |
| **Effect estimate** | Measured movement of a Method's target signal per hour invested, with uncertainty. Governs **selection**. | Preference |
| **Floor** | The minimum rate at which a Method is **offered** regardless of Preference, derived from its role. A floor on what the app offers, never on what the learner owes — declining costs nothing except measurement. | a goal, a streak, an obligation, a minimum amount of practice |
| **Readiness** | Whether the app can build material for a Method right now, in three states: **ready** · **better later** (startable, with a reason) · **no material yet** (nothing exists to start). A statement about the app's stock, never about the learner's worth. May demote a Method; may never hide or block one. | a level requirement, a lock, a prerequisite, permission |
| **Targeting** | The app's answer to a form the learner has not got: weight it into the material rather than withhold anything until it is learned. The opposite of gating, and the reason no Method is ever locked. **Scope: Method availability.** Ordering which *content* a learner meets first is a weighting decision and is allowed — what may never happen is a Method becoming unreachable, or content being removed from input — see [`study/26`](study/26-readiness-and-difficulty.md). | gating, unlocking, a prerequisite chain |
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
| **Learning language** | A language this Account is learning. There may be several at once. Owns its own Reviews, vocabulary reading, calibration and maintenance state — nothing is pooled across languages. | a Language profile (that is the data), a course, the spoken language |
| **Spoken language** | The language a learner already knows — one value, stored once on the account, used for **both** the app chrome (menus, buttons, grade prompts) and the description text on a card. Corrected 2026-08-12: originally split into two independent settings ("interface language" / "gloss language"); there is only ever one language the user speaks per account, so one field drives both surfaces. See UC-069. | the learning language, a second independent knob for cards vs chrome |
| **Active language** | The Learning language currently in focus, exactly one at a time — chosen from the profile, exactly like choosing which course you are in. Decides **both** what is displayed and what a session schedules: **corrected 2026-08-12** (UC-025) — languages never share a session or a schedule, so there is no longer a reason for display and scheduling to look at different languages. Switching it changes what happens next; every other language's stored progress is untouched and exactly where it was left. | two languages sharing one session, a language whose switch loses the other's progress |
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
| **Description-text source** | **Resolved 2026-08-12:** chrome = `I18N.md` stage 1 (`next-intl`); card descriptions = stage 3 DB (`app_texts` / `app_text_translations`) + snapshot JSON. One string per card face per spoken language — no split parts for v1. See UC-069. |
| **Error category** | The closed list used by writing/speaking feedback. Must be fixed before it is counted over time — see [`study/06`](study/06-production.md). |
| **Multiword item** | Collocations and fixed expressions are Words for practice but must **not** count as *n* Words in the vocabulary estimate, or the calibration breaks. Belongs with the Word/Task decision — see [`study/16`](study/16-further-findings.md) W2. |
