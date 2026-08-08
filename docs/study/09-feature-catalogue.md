# 09 · Feature catalogue

Every idea in one place, each with evidence grade, effort and verdict. Meant to
be gone through and cut — the list is deliberately longer than what gets built.

**Columns:**
`Ev.` = evidence grade **[A]–[D]** ([README](README.md)) ·
`Eff.` = S / M / L / XL ·
`Verdict` = **V1** (first version) · **V2** · **later** · **no**

---

## A · Flashcards and repetition → [04](04-flashcards-srs.md)

| # | Feature | Ev. | Eff. | Verdict |
| --- | --- | --- | --- | --- |
| F01 | FSRS scheduler with stability / difficulty / retrievability | A | M | **V1** |
| F02 | "Why is this card here now?" — explanation panel per card | C | S | **V1** — the distinguishing feature, and cheap |
| F03 | Review horizon: 30-day forecast **with a causal line** | C | S | **V1** |
| F04 | Fixed-length session instead of a backlog counter | D | S | **V1** — prevents the commonest exit route |
| F05 | Staged card types (recognition → meaning recall → form recall) | A | M | **V1** |
| F06 | Audio-recall card for every word | B | M | **V1** — otherwise a purely written vocabulary forms |
| F07 | Shipped, frequency-ordered starter decks per language | B | M | **V1** — without it day 1 is a hurdle |
| F08 | Vocabulary atlas (frequency rank × stability) | D | M | **V1** — promoted to a primary display by [19](19-milestones-and-map.md) |
| F09 | Leech detection with a diagnosis instead of more repetitions | B | M | **V2** |
| F10 | Target retention as a user dial (85 % / 90 % / 95 %) | A | S | **V2** — needs explanation, otherwise confusing |
| F11 | Cloze and minimal-pair cards | A | M | **V2** |
| F12 | Cards from words tapped while reading | B | S | **V1** — couples the two pillars |
| F13 | Collocation / chunk cards rather than single words | B | M | **V2** — language consists of phrases, not words |
| F14 | Goal-dependent deck selection (travel / work / exam / reading) | C | S | **V2** |
| F15 | Import from Anki (.apkg) / CSV | D | M | **later** — niche audience, high support cost |
| F16 | Picture cards instead of translation (bypassing L1) | C | M | **later** — evidence thinner than its reputation |

---

## B · Level and progress → [03](03-level-model.md)

| # | Feature | Ev. | Eff. | Verdict |
| --- | --- | --- | --- | --- |
| F17 | Vocabulary size estimate from SRS data + frequency rank | B | L | **V1** — the foundation for everything else |
| F18 | Four separate skill levels | A | M | **V1** |
| F19 | 24 sub-levels (A1.1 … C2.4) + percentage within the level | D | S | **V1** |
| F20 | Overall level from the counting skills (second-lowest from three, minimum at two), plus an explanatory sentence | D | S | **V1** |
| F110 | Skill status as a state: measured · uncertain · not measured · not in profile | D | S | **V1** — one owner for a rule that otherwise drifts across three chapters |
| F133 | Paradigm cell stored with every form (`parliamo → parlare, 1st pl. pres.`) | — | M | **V1** — free now, later a table rebuild plus re-scoring every history |
| F134 | Form mastery as its own layer-1 signal, separate from vocabulary size | D | M | **V2** |
| F135 | Distinguish and display form gaps separately from vocabulary gaps | D | M | **V2** |
| F21 | Trend curve per skill (30 / 90 / 365 days) | D | M | **V1** — answers "am I getting better?" |
| F22 | Uncertainty band on thin data | D | S | **V1** — the precondition for believing the number |
| F23 | Expandable derivation of every figure | D | M | **V2** |
| F24 | Adaptive placement test (IRT), offered **after** the first exercise | B | L | **V2** |
| F25 | Goal projection ("at this pace, B2 in August ± 6 weeks") | D | M | **V2** — only with visible uncertainty |
| F26 | Progress per hour invested | D | S | **V2** — the most uncomfortable and most honest display |
| F27 | Cohort comparison, opt-in, as a distribution rather than a ranking | D | M | **later** — benefit unclear, harm documented |
| F28 | Calibration marker in the history when the calculation changes | D | S | **V2** — a matter of trust |

---

## C · Reading → [05](05-input-reading-listening.md)

| # | Feature | Ev. | Eff. | Verdict |
| --- | --- | --- | --- | --- |
| F29 | Coverage calculator (95–98 % known words per user and text) | A | L | **V1** — the selection principle for all input |
| F30 | Coverage shown before opening ("98 % known · 6 min") | D | S | **V1** |
| F31 | Tap: word → meaning in context + create card | B | M | **V1** |
| F32 | Tap: sentence → translation | C | S | **V1** — your original idea |
| F33 | Tap: paragraph → summary rather than translation | D | S | **V2** — helps without removing the work |
| F34 | Delay brake before the translation | B | S | **V1** — without it no retrieval attempt, without retrieval no learning |
| F35 | Pre-teaching: 5 key words before the text | B | S | **V1** |
| F36 | 2–3 comprehension questions after the text | A | M | **V1** — retrieval practice, and a level measurement point |
| F37 | Measure reading speed (wpm) | B | S | **V2** — the only automatisation indicator |
| F38 | Thematic series (narrow reading), 4–6 texts | B | S | **V2** — a pure sorting rule, large effect |
| F39 | Generated texts with automatic frequency/level checking | D | L | **V1** — otherwise material at every level is not financeable |
| F40 | Curated original texts from B2 | D | XL | **later** — licensing and editorial cost |

---

## D · Listening → [05](05-input-reading-listening.md)

| # | Feature | Ev. | Eff. | Verdict |
| --- | --- | --- | --- | --- |
| F41 | Audio + synchronised transcript (reading while listening) | B | L | **V1** |
| F42 | Three visibility levels (audio only / captions / + translation) | B | M | **V1** |
| F43 | Record which level was used | D | S | **V1** — otherwise the level model measures reading and calls it listening |
| F44 | Voice commands: repeat · translate · slower · save | C | L | **V1** — your core idea; enables screen-free learning |
| F45 | The same commands as buttons, including on the lock screen | D | M | **V1** — voice is unusable on a bus |
| F46 | Speed change without pitch distortion | D | S | **V1** |
| F47 | Clusters of "repeat" → candidate cards | D | M | **V2** — a behavioural signal for non-understanding |
| F48 | Rewind density recalibrates the difficulty estimate | D | M | **later** |
| F49 | Import your own audiobooks/podcasts (transcript via ASR) | D | XL | **later** — legally and technically the most expensive item |
| F50 | Audio flashcards, fully operable blind | C | M | **V2** |

---

## E · Production → [06](06-production.md)

| # | Feature | Ev. | Eff. | Verdict |
| --- | --- | --- | --- | --- |
| F51 | LLM conversation partner, text | B | M | **V2** |
| F52 | Correction dial (let me talk / gentle / strict) | B | M | **V2** — without it the partner entrenches errors |
| F53 | Debrief with error categories → cards | B | M | **V2** |
| F54 | "Steered around" analysis (what did you avoid?) | D | L | **later** — best idea in the study, most expensive to build |
| F55 | 60-second briefing on working with the AI partner | B | S | **V2** |
| F56 | Voice version of the conversation partner | B | L | **later** |
| F57 | Pronunciation: confidence band rather than ✓/✗ | B | M | **V2** |
| F58 | Pronunciation: self-comparison (own recording ↔ native speaker) | C | S | **V2** — the cheapest effective pronunciation feature |
| F59 | Sound-specific feedback for the pair's known problem sounds | B | L | **later** |
| F60 | Writing: build a sentence with a target word (in the SRS) | A | S | **V1** — production recall, minimal effort |
| F61 | Writing: diary, 3 sentences, with a correction diff | B | M | **V2** |
| F62 | Writing: back-translation with a model comparison | B | M | **V2** — the best format against avoidance |
| F63 | Count corrections by category → error-type history | D | M | **V2** |

---

## F · Offline and paper → [07](07-offline-and-paper.md)

| # | Feature | Ev. | Eff. | Verdict |
| --- | --- | --- | --- | --- |
| F64 | Dictation generated from your own card holdings, read three times | B | M | **V2** |
| F65 | Self-correction reconciliation → errors become cards | D | M | **V2** |
| F66 | Printable handwriting sheet (20 shakiest cards) | B | S | **V2** |
| F67 | Paradigm tables (conjugation, declension, comparison), **mixed** | A | M | **V2** — your idea; the mixing is the active ingredient |
| F68 | Dictogloss from B1 | B | M | **later** |
| F69 | Photo recognition of handwritten answers **for self-marking** | D | XL | **no for V1/V2** — hangs the idea on a technology it does not need |
| F69b | Photo of free writing **for correction** | D | M | **V2** — a different case: there is no key to compare against ([23](23-how-an-exercise-runs.md)) |
| F70 | Conversation cards for a real tandem partner | D | S | **later** |
| F71 | Preparation sheet for a specific occasion (doctor, office, interview) | D | M | **later** |
| F72 | Debrief: "what could you not say?" → cards | D | S | **V2** — the best card source there is |

---

## G · Motivation and framing → [08](08-motivation.md)

| # | Feature | Ev. | Eff. | Verdict |
| --- | --- | --- | --- | --- |
| F73 | Short unit with a visible end | A | S | **V1** |
| F74 | Notification with content ("12 cards tipping today · 6 min") | D | S | **V1** |
| F75 | Weekly streak (≥3 study days), below the level, no purchase offer | D | S | **V2** |
| F76 | Weekly review as a narrative with a causal sentence | D | M | **V2** |
| F77 | Competence moment: re-offer old content that was too hard | D | M | **V2** — the strongest real motivator, cheap to build |
| F78 | Break mode without punishment | D | S | **V1** |
| F79 | Ask for the learning goal and **actually** let it affect content | B | M | **V2** |
| F80 | Leagues, hearts, XP, purchasable streak protection | — | — | **no** — see [10](10-antipatterns.md) |

---

## I · Method choice → [12](12-method-cards.md)

| # | Feature | Ev. | Eff. | Verdict |
| --- | --- | --- | --- | --- |
| F87 | Method catalogue: each with target skill, **target signal**, intensity, duration variants, setting | D | M | **V2** — without a target signal the effect is unmeasurable |
| F88 | Method card with intensity, duration, "trains mainly" | D | S | **V2** — your idea |
| F89 | Daily menu: exactly 3 cards, filtered by budget and setting | B | M | **V2** |
| F90 | Budget/energy filter ("5 / 15 / 30 min · tired / okay / sharp") | C | S | **V2** — more honest than a daily goal |
| F91 | Thumbs up/down **plus** one diagnostic follow-up | D | S | **V2** — the bare thumb is nearly worthless |
| F92 | Floor per method, with a reason and "shorter rather than rarer" | D | M | **V2** — your "once a week"; keeps the system stable |
| F93 | Cap: at most **one** floor prompt per day | D | S | **V2** |
| F94 | Effect estimate per method and signal, with a population prior and uncertainty | D | L | **later** — statistically hard, see [12](12-method-cards.md) |
| F95 | Exploration share (10–20 % unchosen methods in the menu) | D | S | **later** — without it the estimate is a self-confirming loop |
| F96 | Preference and effect stored separately, never netted into one value | D | S | **V2** — once merged, the distinction is unrecoverable |

---

## J · Perception → [13](13-pronunciation-perception.md)

| # | Feature | Ev. | Eff. | Verdict |
| --- | --- | --- | --- | --- |
| F97 | Contrast list per language pair as data | A | M | **V2** |
| F98 | HVPT training: two-choice, immediate feedback, **many speakers** | A | M | **V2** — the best evidence-to-effort ratio in the study |
| F99 | Contrast screening: which categories does this user lack? | A | S | **V2** — the only defensible pronunciation diagnosis here |
| F100 | Solved contrasts as a layer-1 signal for listening | D | S | **V2** — a genuine ability threshold rather than a frequency statistic |
| F101 | Speaker pool with an enforced minimum count | A | M | **V2** — too few speakers look like HVPT and do nothing |

---

## K · Accessibility → [14](14-accessibility.md)

| # | Feature | Ev. | Eff. | Verdict |
| --- | --- | --- | --- | --- |
| F102 | Configurable skill profile; overall level only from the chosen ones | D | M | **V1** — otherwise the level model is permanently wrong for some users |
| F103 | Cards answerable by voice or selection, counted equally | B | M | **V1** — otherwise the app measures spelling and calls it vocabulary |
| F104 | Audio for **every** text, not only for listening content | B | M | **V2** |
| F105 | Adjustable typography (typeface, line spacing, line length, background) | C | S | **V2** |
| F106 | Textual equivalent for the trend curve and the vocabulary atlas | — | S | **V2** — otherwise the core information is visual-only |
| F107 | Spec rule: every skill-bound task names its alternative route | — | S | **V1** — a process rule; cheap now, very expensive later |

---

## L · Chunks and phrases → [16](16-further-findings.md)

| # | Feature | Ev. | Eff. | Verdict |
| --- | --- | --- | --- | --- |
| F108 | Tapping detects a fixed expression and offers the whole thing | B | M | **V2** |
| F109 | Expressions do not count as *n* words in the vocabulary estimate | — | M | **V2** — ⚠ open modelling question, belongs with question 4 |

---

## M · Own content → [17](17-own-content.md)

| # | Feature | Ev. | Eff. | Verdict |
| --- | --- | --- | --- | --- |
| F111 | Own audio sources: RSS, file, link — **no catalogue** | D | M | **V2** |
| F112 | Coverage over a **sliding window** → suggest a passage rather than an episode | D | M | **V2** — the cheapest answer to "podcasts are too hard" |
| F113 | Partial dictation over the transcript, gaps chosen **deliberately** | B | M | **V2** — replaces "correcting text", for which there is no evidence |
| F114 | Support ladder instead of simplification (rungs 0–4, lowest that fits) | B | M | **V2** |
| F115 | Targeted simplification: only the words *this* user does not know | D | M | **later** |
| F116 | Text upload, processed locally, processing location visible | — | M | **V2** |
| F117 | Series suggestion (narrow listening) from your own sources | B | S | **V2** |
| F118 | Support-removal ladder across several passes of the same item | B | S | **V2** |
| F119 | ASR transcript where none is supplied | — | L | **later** — without a transcript an audio item is unusable for us |

---

## N · The language kit → [18](18-language-kit.md)

| # | Feature | Ev. | Eff. | Verdict |
| --- | --- | --- | --- | --- |
| F120 | Language profile as a validated schema (script, morphology, **counting unit**, sources) | — | M | **V1** — without a counting unit the level model computes silently wrongly |
| F121 | Pair profile (contrast list, translation quality) | — | S | **V2** |
| F122 | Lemmatisation via Stanza/UD rather than hand-written rules | — | M | **V1** — ~70 languages without doing linguistics |
| F123 | Quality tier A/B/C, **derived** from the profile, never hand-set | D | S | **V2** |
| F124 | Bootstrapping a new language: list + lemmatiser → tier C, generated deck → tier B | D | L | **V2** |
| F125 | At tier C no level value, but the status "not measured" | D | S | **V2** |

---

## O · Milestones and map → [19](19-milestones-and-map.md)

| # | Feature | Ev. | Eff. | Verdict |
| --- | --- | --- | --- | --- |
| F126 | Frequency blocks with **marginal** yield, calibrated per language | A | M | **V2** |
| F127 | Block progress counts **stable** knowledge, not cards seen | A | S | **V2** — otherwise it is an activity metric (A1) |
| F128 | Honest warning: "the next block only adds +4" | D | S | **V2** |
| F129 | **K3 · What is missing for this item?** — the coverage calculator backwards | D | M | **V2** — the strongest single idea: you unlock an episode rather than learn vocabulary |
| F130 | K2 · What moved from demanding to comfortable this month | D | M | **V2** |
| F131 | A word traceable: where it occurs in your content, which rank, which block | D | M | **later** |
| F132 | Historical coverage with a timestamp **and** the calibration in force | — | M | **V2** — otherwise a recalibration displays progress that did not happen |

---

## P · Speaking without AI → [20](20-speaking-and-sentences.md)

| # | Feature | Ev. | Eff. | Verdict |
| --- | --- | --- | --- | --- |
| F136 | **4/3/2**: the same story in 4, then 3, then 2 minutes | B | S | **V2** — the best effort-to-effect ratio in the study; a timer and a microphone suffice |
| F137 | Play your own three recordings back to back | C | S | **V2** — replaces the missing listener and is a competence moment |
| F138 | Visible planning phase before every speaking task | B | S | **V2** |
| F139 | Shadowing over existing audio + transcript | B | M | **V2** — complementary to HVPT, not interchangeable |
| F140 | Speaking tasks with an **outcome** rather than a topic (TBLT) | B | M | **V2** |

---

## Q · Info page and methods beyond the app → [12](12-method-cards.md)

| # | Feature | Ev. | Eff. | Verdict |
| --- | --- | --- | --- | --- |
| F141 | Info page per method: what · why · **how sure [A]–[D]** · limits · variants · requirements | B | M | **V2** — your idea |
| F142 | The "what it does *not* do" section is a **required field** | D | S | **V2** — otherwise the page is advertising |
| F143 | Methods the app does not run (drama, tandem, cooking, diary) in the same catalogue | D | M | **V2** — thesis 9 |
| F144 | For those: preparation + debrief, but **no** effect estimate | D | M | **V2** |
| F145 | Their place in the menu comes from the **floor**, not from measurement | D | S | **V2** — otherwise the measurable displaces what counts |
| F146 | Self-reported completion marked as such; does not feed layer 1 | D | S | **V2** |

---

## R · Catalogue and context → [21](21-method-catalogue-and-context.md)

| # | Feature | Ev. | Eff. | Verdict |
| --- | --- | --- | --- | --- |
| F147 | Method catalogue as **data** — adding a method is an entry, not a release | — | M | **V2** — otherwise the catalogue stops at ten entries |
| F148 | Context model: eight dimensions (eyes, hands, voice, surface, sound, attention, time, company) | D | M | **V2** |
| F149 | Named context presets, editable, user-creatable | D | S | **V2** |
| F150 | **Context filters first** — before floor, effect, preference | D | S | **V2** — corrects the menu order in [12](12-method-cards.md) |
| F151 | Context is **tapped**, never sensed (no location, no sensors) | — | S | **V2** — [`../CONSTITUTION.md`](../CONSTITUTION.md) §2 |
| F152 | Hard methods labelled as such rather than hidden | D | S | **V2** |
| F153 | Weakly evidenced methods stay in the catalogue, honestly marked | D | S | **V2** |
| F154 | Long-window mode: its own sequence rather than 24× the five-minute unit | A | M | **V2** — massed repetition is exactly what E2 forbids |
| F155 | Name the catalogue gap when nothing fits the context | D | S | **later** |
| F156 | The filter asks **four** criteria (time, eyes, voice, writing surface), not eight | D | S | **V2** |
| F157 | Favourites list as an explicit interface for the *preference* ledger | D | S | **V2** |
| F158 | Effect data stay **local**; aggregating across people is a separate decision | — | M | **V2** — [`../CONSTITUTION.md`](../CONSTITUTION.md) §2 |

---

## S · How an exercise runs → [23](23-how-an-exercise-runs.md)

| # | Feature | Ev. | Eff. | Verdict |
| --- | --- | --- | --- | --- |
| F159 | Exercise as an ordered list of typed steps (prepare · do · wait · check · decide) | D | M | **V2** — one runner instead of a bespoke screen per method |
| F160 | **Seen and done are separate states.** Swiping never marks anything done | D | S | **V2** — only *done* feeds the level model |
| F161 | Prepare step as a checklist of what the method physically requires | D | S | **V2** — makes the context model tangible |
| F162 | Timer belongs to the step, keeps running while navigating, pausing is recorded | D | M | **V2** |
| F163 | End of exercise: at most two offers, declining ends it | D | S | **V2** |
| F164 | After two consecutive abandonments, offer a shorter variant — **once** | D | S | **later** |

---

## H · Foundations (invisible, but load-bearing)

| # | Feature | Ev. | Eff. | Verdict |
| --- | --- | --- | --- | --- |
| F81 | Frequency lists + lemmatisation per language | — | L | **V1** — without it neither F17 nor F29 works |
| F82 | Offline capability for the SRS and downloaded audio | — | L | **V2** — commuting is the commonest learning situation |
| F83 | Data export (all cards, all history) | — | S | **V1** — [`../CONSTITUTION.md`](../CONSTITUTION.md) §2 |
| F84 | Several target languages per account | — | M | **V2** |
| F85 | A reporting route for wrong generated content | — | S | **V1** — the quality obligation for generated material |
| F86 | Efficacy measurement built in (pre-test, cohorts, including dropouts) | — | L | **V2** — otherwise we repeat [01](01-duolingo.md), S5 |

---

## The V1 cut in one sentence

**Flashcards with a visible schedule, a level profile computed from card data,
and reading and listening content selected by computed coverage.** Everything
else is extension.

The order and the reasoning behind the cut are in
[11](11-roadmap-open-questions.md).
