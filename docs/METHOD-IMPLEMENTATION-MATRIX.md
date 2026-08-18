# Method implementation matrix

**Last synced:** 2026-08-18 — run `node scripts/generate-method-matrix.mjs` to refresh counts from `data/methods/`.

Single view of every catalogue Method: **evidence**, **hosting**, **planned engine**,
**recipe** (specced in [`exercise-recipe-composer.methods.md`](specs/service/exercise-recipe-composer.methods.md)),
and **build status** (code in [`lib/exercise-recipe-built.ts`](../lib/exercise-recipe-built.ts),
[`lib/method-session.ts`](../lib/method-session.ts)).

## Summary

| | Count |
| --- | ---: |
| Methods | 53 |
| Commitments | 6 |
| Hosted (`hosted: true`) | 34 |
| **Built in-app** | **2** (`srs-session`, `partial-dictation`) |
| Exercise runner specced | 40 |
| Card engine specced | 4 |
| Off-app / debrief only | 19 |

### Legend

| Column | Meaning |
| --- | --- |
| **Ev** | Evidence grade A–D ([study/21](study/21-method-catalogue-and-context.md)) |
| **Host** | `hosted: true` — product intends to run in-app |
| **Engine** | `card` → `/words/review`; `runner` → `/practice`; `off` → detail + optional debrief |
| **Mat.** | Material setup on detail (`materialTopics`) |
| **Built** | ✅ runnable · ◐ partial · ❌ specced not built · off-app · pool only |
| **Pri** | Suggested build order (this doc) — not a spec |

## Reading (8)

| id | Ev | Host | Engine | Mat. | Built | Pri | Components still needed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `extensive-reading` | A | Y | runner | Y | ✅ | done | material-preview, text-display, comprehension-questions |
| `narrow-reading` | B | Y | runner | — | ❌ | P3–P4 | see recipe doc |
| `intensive-reading` | B | Y | runner | — | ❌ | P3–P4 | see recipe doc |
| `reading-aloud` | B | Y | runner | — | ❌ | P3–P4 | see recipe doc |
| `reading-while-listening` | B | Y | runner | — | ❌ | P3–P4 | see recipe doc |
| `reread-something-hard` | D | Y | runner | — | ❌ | P3–P4 | see recipe doc |
| `parallel-text` | C | Y | runner | — | ❌ | P3–P4 | see recipe doc |
| `book-you-know` | C | N | off | — | off-app | defer | debrief |

## Listening (8)

| id | Ev | Host | Engine | Mat. | Built | Pri | Components still needed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `listening-level-1` | B | Y | runner | — | ❌ | P3 | audio-play, comprehension-questions |
| `narrow-listening` | B | Y | runner | — | ❌ | P3–P4 | see recipe doc |
| `repeated-listening` | B | Y | runner | — | ❌ | P3–P4 | see recipe doc |
| `partial-dictation` | B | Y | runner | Y | ✅ | done | — (shipped: short/standard/long) |
| `full-dictation` | B | Y | runner | Y | ✅ | done | audio-play, full-dictation, sheet-download |
| `dictogloss` | B | Y | runner | — | ❌ | P3 | audio-play, type-freely, diff-highlight |
| `listening-faster` | C | Y | runner | — | ❌ | P3–P4 | see recipe doc |
| `background-listening` | C | N | off | — | off-app | defer | debrief |

## Speaking (10)

| id | Ev | Host | Engine | Mat. | Built | Pri | Components still needed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `four-three-two` | B | Y | runner | — | ❌ | P3 | round-marker, speak-prompt, voice-submit, rubric |
| `shadowing` | B | Y | runner | — | ❌ | P3–P4 | shadow-line, audio-play |
| `retell-what-you-read` | B | Y | runner | — | ❌ | P3–P4 | see recipe doc |
| `self-talk` | C | N | off | — | off-app | defer | debrief |
| `describe-a-picture` | C | Y | runner | — | ❌ | P3–P4 | see recipe doc |
| `voice-message` | D | N | off | — | off-app | defer | debrief |
| `role-play` | B | N | off | — | off-app | defer | debrief |
| `recite-memorised` | C | Y | runner | — | ❌ | P3–P4 | see recipe doc |
| `singing-along` | C | N | off | — | off-app | defer | debrief |
| `interpreting` | D | N | off | — | off-app | defer | debrief |

## Writing (10)

| id | Ev | Host | Engine | Mat. | Built | Pri | Components still needed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `build-a-sentence` | A | Y | runner | — | ❌ | P2 | type-with-word, reveal-answer |
| `free-production` | B | Y | runner | — | ❌ | P2 | timed-write, feedback |
| `diary-three-sentences` | B | Y | runner | — | ❌ | P3 | timed-write, feedback |
| `summarise-what-you-read` | B | Y | runner | — | ❌ | P3–P4 | see recipe doc |
| `back-translation` | B | Y | runner | — | ❌ | P3–P4 | see recipe doc |
| `copy-a-paragraph` | C | Y | runner | — | ❌ | P3–P4 | see recipe doc |
| `rewrite-in-your-own-words` | C | Y | runner | — | ❌ | P3–P4 | see recipe doc |
| `caption-your-photos` | D | Y | runner | — | ❌ | P3–P4 | see recipe doc |
| `translate-a-song` | D | N | off | — | off-app | defer | debrief |
| `write-and-perform-a-play` | C | N | off | — | off-app | defer | debrief |

## Form (6)

| id | Ev | Host | Engine | Mat. | Built | Pri | Components still needed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `paradigm-tables-mixed` | A | Y | runner | — | ❌ | P2–P3 | see recipe doc |
| `minimal-pairs` | A | Y | runner | — | ❌ | P2 | minimal-pair |
| `cloze-sentences` | A | Y | runner | — | ❌ | P2 | cloze-type |
| `sentence-transformation` | B | Y | runner | — | ❌ | P3–P4 | see recipe doc |
| `own-error-log` | C | Y | runner | — | ❌ | P3–P4 | see recipe doc |
| `rule-at-point-of-error` | A | Y | runner | — | ❌ | P2–P3 | see recipe doc |

## Vocabulary (6)

| id | Ev | Host | Engine | Mat. | Built | Pri | Components still needed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `srs-session` | A | Y | card | — | ✅ | P2–P3 | see recipe doc |
| `audio-cards` | B | N | off | — | off-app | defer | debrief |
| `mine-your-own-sentences` | C | N | off | — | off-app | defer | debrief |
| `collocation-cards` | B | N | off | — | off-app | defer | debrief |
| `close-a-frequency-block` | A | N | off | — | off-app | defer | debrief |
| `handwriting-shakiest` | B | N | off | — | off-app | defer | debrief |

## World (5)

| id | Ev | Host | Engine | Mat. | Built | Pri | Components still needed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `cook-from-a-recipe` | D | N | off | — | off-app | defer | debrief |
| `video-game-in-target-language` | C | N | off | — | off-app | defer | debrief |
| `tandem-or-language-cafe` | B | N | off | — | off-app | defer | debrief |
| `order-ask-complain` | D | N | off | — | off-app | defer | debrief |
| `film-you-know-by-heart` | C | N | off | — | off-app | defer | debrief |

## Commitments (6 commitments)

| id | Ev | Host | Engine | Mat. | Built | Pri | Components still needed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `switch-phone-language` | D | N | commitment | — | ❌ | defer | see recipe doc |
| `write-to-one-friend` | D | N | commitment | — | ❌ | defer | see recipe doc |
| `label-the-flat` | C | N | commitment | — | ❌ | defer | see recipe doc |
| `one-series-target-audio` | D | N | commitment | — | ❌ | defer | see recipe doc |
| `shopping-list-in-your-head` | D | N | commitment | — | ❌ | defer | see recipe doc |
| `hobby-in-target-language` | D | N | commitment | — | ❌ | defer | see recipe doc |

## Recommended build order

| Wave | Methods | Why |
| --- | --- | --- |
| **P1** | `full-dictation`, `extensive-reading` | Dictation reuse; reading has material setup in catalogue |
| **P2** | `free-production`, `build-a-sentence`, `cloze-sentences`, `minimal-pairs` | Evidence A, short recipes, no TTS |
| **P3** | `dictogloss`, `four-three-two`, `diary-three-sentences`, `listening-level-1` | Needs audio + production components |
| **P4** | Remaining hosted runners | Shared components from P1–P3 |
| **Card** | Form-recall practice, `close-a-frequency-block` | Extend card engine |
| **Defer** | Off-app, thin-evidence hosted, commitments | No session or low ROI |

## Related docs

| Doc | Owns |
| --- | --- |
| [`data/methods/`](../data/methods/) | Catalogue source of truth |
| [`exercise-recipe-composer.methods.md`](specs/service/exercise-recipe-composer.methods.md) | Specced step sequence |
| [`exercise-step-components.md`](specs/service/exercise-step-components.md) | Component catalogue |
| [`method-engines.md`](specs/service/method-engines.md) | Routing contract |
| [`study/21-method-catalogue-and-context.md`](study/21-method-catalogue-and-context.md) | Pedagogy narrative |
