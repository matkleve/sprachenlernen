# Exercise recipe composer — per-method mixes

Split child of [`exercise-recipe-composer.md`](exercise-recipe-composer.md).

Notation: `→` sequence, `×N` loop, `+` combined on one step. Step =
`type:component`. **Engine:** `card` = `/words/review`; `runner` = `/practice`;
`off` = off-app (optional debrief recipe); `—` = not built.

## Reading (8)

| Method id | Engine | Recipe mix |
| --- | --- | --- |
| `extensive-reading` | runner | P:material-preview → D:text-display → R:comprehension-questions → C:offers |
| `narrow-reading` | runner | P:instruction → ×4 [ D:text-display + D:series-progress ] → C:summary |
| `intensive-reading` | runner | P:material-preview → D:text-display → R:reveal-answer → D:prompt → C:offers |
| `reading-aloud` | runner | P:checklist → D:text-display → D:speak-prompt → C:summary |
| `reading-while-listening` | runner | P:checklist → D:sync-text-audio → C:summary |
| `reread-something-hard` | runner | P:material-preview → D:text-display → R:rubric → C:summary |
| `parallel-text` | runner | P:material-preview → D:parallel-text → C:offers |
| `book-you-know` | off | P:instruction → D:prompt → S:confirm-done → C:debrief-prompt |

## Listening (8)

| Method id | Engine | Recipe mix |
| --- | --- | --- |
| `listening-level-1` | runner | P:checklist → D:audio-play → R:comprehension-questions → C:offers |
| `narrow-listening` | runner | P:instruction → ×N D:audio-play → C:summary |
| `repeated-listening` | runner | P:instruction → D:audio-with-transcript(L3) → W:rest → D:audio-with-transcript(L2) → W:rest → D:audio-play(L1) → R:comprehension-questions → C:offers |
| `partial-dictation` | runner | P:checklist → ×N [ D:gap-fill → W:wait ] → S:capture → R:self-mark → C:offers **(shipped v1: N=1)** |
| `full-dictation` | runner | P:checklist + P:sheet-download → ×N [ D:full-dictation → W:wait ] → S:capture → R:self-mark → C:offers |
| `dictogloss` | runner | P:checklist + P:material-preview → D:audio-play → W:wait → D:audio-play → D:type-freely → R:diff-highlight → C:offers |
| `listening-faster` | runner | P:checklist → D:speed-listen → R:comprehension-questions → C:offers |
| `background-listening` | off | P:instruction → S:confirm-done → C:summary |

## Speaking (10)

| Method id | Engine | Recipe mix |
| --- | --- | --- |
| `four-three-two` | runner | P:instruction → ×3 [ D:round-marker + D:speak-prompt + W:wait ] → S:voice-submit(opt) → R:rubric → C:offers |
| `shadowing` | runner | P:checklist → ×N D:shadow-line → C:summary |
| `retell-what-you-read` | runner | P:material-preview → D:text-display → W:wait → D:speak-prompt → S:voice-submit → R:rubric → C:offers |
| `self-talk` | off | P:instruction → D:timed-write(voice) → S:confirm-done → C:debrief-prompt |
| `describe-a-picture` | runner | P:checklist → D:image-prompt → D:speak-prompt → S:voice-submit → R:rubric → C:offers |
| `voice-message` | off | P:instruction → S:confirm-done → C:debrief-prompt |
| `role-play` | off | P:instruction + P:sheet-download → S:confirm-done → C:debrief-prompt |
| `recite-memorised` | runner | P:material-preview → D:speak-prompt → C:summary |
| `singing-along` | off | P:instruction → D:sync-text-audio → S:confirm-done → C:summary |
| `interpreting` | off | P:instruction → S:confirm-done → C:debrief-prompt |

## Writing (10)

| Method id | Engine | Recipe mix |
| --- | --- | --- |
| `build-a-sentence` | runner | **shipped:** ×3–5 D:sentence-check → C:offers — write and correct in one step, feedback mode `checked` (G2 in-step); no prepare (G6); budget-scaled batch (T-MV2) |
| `free-production` | runner | P:checklist → D:timed-write → S:capture → R:feedback → C:offers |
| `diary-three-sentences` | runner | D:timed-write(3-sentences) → R:feedback → C:offers |
| `summarise-what-you-read` | runner | P:material-preview → D:text-display → W:wait → D:timed-write → R:feedback → C:offers |
| `back-translation` | runner | P:material-preview → D:text-display → D:transform(out) → W:wait → D:transform(back) → R:compare → C:offers |
| `copy-a-paragraph` | runner | P:sheet-download → D:copy-display → S:confirm-done → R:self-mark → C:offers |
| `rewrite-in-your-own-words` | runner | P:material-preview → D:text-display → D:timed-write → R:diff-highlight → C:offers |
| `caption-your-photos` | runner | D:image-prompt(own) → D:type-freely → C:offers |
| `translate-a-song` | off | P:instruction → D:sync-text-audio → D:type-freely → C:debrief-prompt |
| `write-and-perform-a-play` | off | P:instruction → S:confirm-done → C:debrief-prompt |

## Form (6)

| Method id | Engine | Recipe mix |
| --- | --- | --- |
| `paradigm-tables-mixed` | runner | P:sheet-download → ×N D:cloze-type → S:capture(opt) → R:self-mark → C:offers |
| `minimal-pairs` | runner | ×N D:minimal-pair → C:summary |
| `cloze-sentences` | runner | ×N D:cloze-type → R:reveal-answer → C:offers |
| `sentence-transformation` | runner | ×N D:transform → R:compare → C:offers |
| `own-error-log` | runner | P:instruction → ×N [ D:prompt(error) → D:transform(fix) ] → C:offers |
| `rule-at-point-of-error` | runner | D:prompt(rule) → C:summary *(or inline in another Method's review)* |

## Vocabulary (6)

| Method id | Engine | Recipe mix |
| --- | --- | --- |
| `srs-session` | card | ×N card:meaning-recall **(shipped)**; +card:form-recall when held |
| `audio-cards` | card | ×N card:audio-recall (self-grade) |
| `mine-your-own-sentences` | runner | D:text-display → D:mining-highlight → C:offers |
| `collocation-cards` | card | ×N card:collocation-match |
| `close-a-frequency-block` | card | ×N card:meaning-recall (filtered band) → C:summary |
| `handwriting-shakiest` | runner | P:sheet-download → S:confirm-done → C:offers |

## World (5)

| Method id | Engine | Recipe mix |
| --- | --- | --- |
| `cook-from-a-recipe` | off | P:instruction + P:sheet-download → S:confirm-done → C:debrief-prompt |
| `video-game-in-target-language` | off | P:instruction → S:confirm-done → C:summary |
| `tandem-or-language-cafe` | off | P:instruction → S:confirm-done → C:debrief-prompt |
| `order-ask-complain` | off | P:instruction → S:confirm-done → C:debrief-prompt |
| `film-you-know-by-heart` | off | P:instruction → S:confirm-done → C:summary |

## Commitments (6) — not Methods; optional check-in recipe

| Commitment id | Recipe mix |
| --- | --- |
| `switch-phone-language` | C:summary (periodic review prompt only) |
| `write-to-one-friend` | C:debrief-prompt (periodic) |
| `label-the-flat` | P:sheet-download → C:summary |
| `one-series-target-audio` | C:summary (periodic) |
| `shopping-list-in-your-head` | C:debrief-prompt (periodic) |
| `hobby-in-target-language` | C:debrief-prompt (periodic) |

## Component demand (derived)

Components needed by **≥5 Methods** (build first): `checklist`, `prompt`,
`audio-play`, `text-display`, `timed-write`, `capture`, `self-mark`, `offers`,
`instruction`, `material-preview`, `speak-prompt`, `comprehension-questions`.

**Built methods — budget variants (target after T-MV5):**

| Method id | `durations` (min) | Compose volume at budget |
| --- | --- | --- |
| `srs-session` | 5, 10, 20 | 7 / 15 / 30 cards |
| `partial-dictation` | 5, 10, 15 | 2 / 4 / window sentences |
| `full-dictation` | 12, 25 | fixed ritual maps to N sentences |
| `extensive-reading` | 10, 20, 45 | `window` unit = budget |
| `reading-aloud` | 5, 10, 20 | `window` unit = budget |
| `build-a-sentence` | 5, 10 | 3 / 5 target words (+ feedback each) |
| `free-production` | 10, 20 | `timed-write` = budget − overhead |

Full audit: [`../../reviews/design/DR-042-method-usefulness-ux-audit.md`](../../reviews/design/DR-042-method-usefulness-ux-audit.md).

**Card-engine only:** `meaning-recall`, `form-recall`, `audio-recall`,
`collocation-match`, `recognition`.

Full id list: [`exercise-step-components.md`](exercise-step-components.md).
