# Exercise recipe composer — per-method mixes

Split child of [`exercise-recipe-composer.md`](exercise-recipe-composer.md).
Session kinds: [`method-guided-sessions.md`](method-guided-sessions.md).

Notation: `→` sequence, `×N` loop, `+` combined on one step. Step =
`type:component`.

**Session kind:** `graded` = app material + scoring; `guided` = off-screen work +
`confirm-done`; `card` = `/words/review`; `check-in` = commitment prompt.

## Reading (8)

| Method id | Kind | Recipe mix |
| --- | --- | --- |
| `extensive-reading` | graded | P:material-preview → D:text-display → R:comprehension-questions → C:offers |
| `narrow-reading` | graded | P:instruction → ×4 [ D:text-display + D:series-progress ] → C:summary |
| `intensive-reading` | graded | P:material-preview → D:text-display → R:reveal-answer → D:prompt → C:offers |
| `reading-aloud` | graded | P:checklist → D:text-display → D:speak-prompt → C:summary |
| `reading-while-listening` | graded | P:checklist → D:sync-text-audio → C:summary |
| `reread-something-hard` | graded | P:material-preview → D:text-display → R:rubric → C:summary |
| `parallel-text` | graded | P:material-preview → D:parallel-text → C:offers |
| `book-you-know` | guided | P:instruction → D:prompt → W:wait → S:confirm-done → C:debrief-prompt |

## Listening (8)

| Method id | Kind | Recipe mix |
| --- | --- | --- |
| `listening-level-1` | graded | P:checklist → D:audio-play → R:comprehension-questions → C:offers |
| `narrow-listening` | graded | P:instruction → ×N D:audio-play → C:summary |
| `repeated-listening` | graded | P:instruction → D:audio-with-transcript(L3) → W:rest → D:audio-with-transcript(L2) → W:rest → D:audio-play(L1) → R:comprehension-questions → C:offers |
| `partial-dictation` | graded | P:checklist → ×N [ D:gap-fill → W:wait ] → S:capture → R:self-mark → C:offers **(shipped v1: N=1)** |
| `full-dictation` | graded | P:checklist + P:sheet-download → ×N [ D:full-dictation → W:wait ] → S:capture → R:self-mark → C:offers |
| `dictogloss` | graded | P:checklist + P:material-preview → D:audio-play → W:wait → D:audio-play → D:type-freely → R:diff-highlight → C:offers |
| `listening-faster` | graded | P:checklist → D:speed-listen → R:comprehension-questions → C:offers |
| `background-listening` | guided | P:instruction → W:wait(open) → S:confirm-done → C:summary |

## Speaking (10)

| Method id | Kind | Recipe mix |
| --- | --- | --- |
| `four-three-two` | graded | P:instruction → ×3 [ D:round-marker + D:speak-prompt + W:wait ] → S:voice-submit(opt) → R:rubric → C:offers |
| `shadowing` | graded | P:checklist → ×N D:shadow-line → C:summary |
| `retell-what-you-read` | graded | P:material-preview → D:text-display → W:wait → D:speak-prompt → S:voice-submit → R:rubric → C:offers |
| `self-talk` | guided | P:instruction → D:timed-write(voice) → S:confirm-done → C:debrief-prompt |
| `describe-a-picture` | graded | P:checklist → D:image-prompt → D:speak-prompt → S:voice-submit → R:rubric → C:offers |
| `voice-message` | guided | P:instruction → D:speak-prompt → W:wait → S:confirm-done → C:debrief-prompt |
| `role-play` | guided | P:instruction + P:sheet-download → W:wait → S:confirm-done → C:debrief-prompt |
| `recite-memorised` | graded | P:material-preview → D:speak-prompt → C:summary |
| `singing-along` | guided | P:instruction → D:sync-text-audio → W:wait → S:confirm-done → C:summary |
| `interpreting` | guided | P:instruction → W:wait → S:confirm-done → C:debrief-prompt |

## Writing (10)

| Method id | Kind | Recipe mix |
| --- | --- | --- |
| `build-a-sentence` | graded | P:checklist → D:type-with-word → R:reveal-answer → C:offers |
| `free-production` | graded | P:checklist → D:timed-write → S:capture → R:feedback → C:offers |
| `diary-three-sentences` | graded | P:checklist → D:timed-write(3-sentences) → R:feedback → C:offers |
| `summarise-what-you-read` | graded | P:material-preview → D:text-display → W:wait → D:timed-write → R:feedback → C:offers |
| `back-translation` | graded | P:material-preview → D:text-display → D:transform(out) → W:wait → D:transform(back) → R:compare → C:offers |
| `copy-a-paragraph` | graded | P:sheet-download → D:copy-display → S:confirm-done → R:self-mark → C:offers |
| `rewrite-in-your-own-words` | graded | P:material-preview → D:text-display → D:timed-write → R:diff-highlight → C:offers |
| `caption-your-photos` | graded | P:checklist → D:image-prompt(own) → D:type-freely → C:offers |
| `translate-a-song` | guided | P:instruction → D:song-picker → D:sync-text-audio(adaptive) → ×N D:type-freely(line) → C:debrief-prompt |
| `write-and-perform-a-play` | guided | P:instruction → W:wait → S:confirm-done → C:debrief-prompt |

## Form (6)

| Method id | Kind | Recipe mix |
| --- | --- | --- |
| `paradigm-tables-mixed` | graded | P:sheet-download → ×N D:cloze-type → S:capture(opt) → R:self-mark → C:offers |
| `minimal-pairs` | graded | P:checklist → ×N D:minimal-pair → C:summary |
| `cloze-sentences` | graded | P:checklist → ×N D:cloze-type → R:reveal-answer → C:offers |
| `sentence-transformation` | graded | P:instruction → ×N D:transform → R:compare → C:offers |
| `own-error-log` | graded | P:instruction → ×N [ D:prompt(error) → D:transform(fix) ] → C:offers |
| `rule-at-point-of-error` | graded | D:prompt(rule) → C:summary *(or inline in another Method's review)* |

## Vocabulary (6)

| Method id | Kind | Recipe mix |
| --- | --- | --- |
| `srs-session` | card | ×N card:meaning-recall **(shipped)**; +card:form-recall when held |
| `audio-cards` | card | ×N card:audio-recall (self-grade) |
| `mine-your-own-sentences` | guided | P:instruction → D:text-display(own) → D:mining-highlight → C:offers |
| `collocation-cards` | card | ×N card:collocation-match |
| `close-a-frequency-block` | card | ×N card:meaning-recall (filtered band) → C:summary |
| `handwriting-shakiest` | guided | P:instruction + P:sheet-download → W:wait → S:confirm-done → C:offers |

## World (5)

| Method id | Kind | Recipe mix |
| --- | --- | --- |
| `cook-from-a-recipe` | guided | P:instruction + P:sheet-download → W:wait → S:confirm-done → C:debrief-prompt |
| `video-game-in-target-language` | guided | P:instruction → W:wait(open) → S:confirm-done → C:summary |
| `tandem-or-language-cafe` | guided | P:instruction → W:wait → S:confirm-done → C:debrief-prompt |
| `order-ask-complain` | guided | P:instruction → W:wait → S:confirm-done → C:debrief-prompt |
| `film-you-know-by-heart` | guided | P:instruction → W:wait → S:confirm-done → C:summary |

## Commitments (6) — check-in recipes

| Commitment id | Kind | Recipe mix |
| --- | --- | --- |
| `switch-phone-language` | check-in | P:instruction → C:summary |
| `write-to-one-friend` | check-in | C:debrief-prompt |
| `label-the-flat` | check-in | P:instruction + P:sheet-download → C:summary |
| `one-series-target-audio` | check-in | P:instruction → C:summary |
| `shopping-list-in-your-head` | check-in | C:debrief-prompt |
| `hobby-in-target-language` | check-in | C:debrief-prompt |

## Component demand (derived)

Components needed by **≥5 Methods** (build first): `checklist`, `prompt`,
`audio-play`, `text-display`, `timed-write`, `capture`, `self-mark`, `offers`,
`instruction`, `material-preview`, `speak-prompt`, `comprehension-questions`,
`confirm-done`, `debrief-prompt`, `wait`.

**Guided-only (high demand):** `song-picker` (`translate-a-song`).

**Card-engine only:** `meaning-recall`, `form-recall`, `audio-recall`,
`collocation-match`, `recognition`.

Full id list: [`exercise-step-components.md`](exercise-step-components.md).
