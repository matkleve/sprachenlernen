# Method implementation matrix

**Last synced:** 2026-08-18 — run `node scripts/generate-method-matrix.mjs` to refresh counts from `data/methods/`.

Single view of every catalogue Method: **evidence**, **hosting**, **planned engine**,
**recipe** (specced in [`exercise-recipe-composer.methods.md`](specs/service/exercise-recipe-composer.methods.md)),
and **build status** (code in [`lib/exercise-recipe-built.ts`](../lib/exercise-recipe-built.ts),
[`lib/method-session.ts`](../lib/method-session.ts)). **I-tier** = implementation
maturity ([`method-implementation-maturity.md`](specs/service/method-implementation-maturity.md)).

## Summary

| | Count |
| --- | ---: |
| Methods | 53 |
| Commitments | 6 |
| Hosted (`hosted: true`) | 34 |
| **Built in-app** | **35** (`srs-session`, `partial-dictation`, `full-dictation`, `extensive-reading`, `reading-aloud`, `listening-level-1`, `build-a-sentence`, `cloze-sentences`, `minimal-pairs`, `free-production`, `dictogloss`, `four-three-two`, `diary-three-sentences`, `narrow-reading`, `intensive-reading`, `retell-what-you-read`, `recite-memorised`, `summarise-what-you-read`, `rule-at-point-of-error`, `book-you-know`, `background-listening`, `self-talk`, `voice-message`, `role-play`, `singing-along`, `interpreting`, `translate-a-song`, `write-and-perform-a-play`, `mine-your-own-sentences`, `handwriting-shakiest`, `cook-from-a-recipe`, `video-game-in-target-language`, `tandem-or-language-cafe`, `order-ask-complain`, `film-you-know-by-heart`) |
| Exercise runner specced | 40 |
| Card engine specced | 4 |
| Off-app / debrief only | 19 |

### Legend

| Column | Meaning |
| --- | --- |
| **Ev** | Evidence grade A–D ([study/21](study/21-method-catalogue-and-context.md)) |
| **Host** | `hosted: true` — product intends to run in-app |
| **Engine** | `card` · `graded` · `guided` · `check-in` — see method-guided-sessions |
| **Mat.** | Material setup on detail (`materialTopics`) |
| **Built** | ✅ runnable · ◐ partial · ❌ specced · guided-only · pool only |
| **I** | Implementation maturity I0–I4 — not learner level |
| **Pri** | Suggested build order (this doc) — not a spec |

## Reading (8)

| id | Ev | Host | Engine | Mat. | Built | I | Pri | Components still needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `extensive-reading` | A | Y | runner | Y | ✅ | I3 | done | material-preview, text-display, comprehension-questions |
| `narrow-reading` | B | Y | runner | — | ✅ | I2 | P3–P4 | see recipe doc |
| `intensive-reading` | B | Y | runner | — | ✅ | I2 | P3–P4 | see recipe doc |
| `reading-aloud` | B | Y | runner | Y | ✅ | I3 | done | — (shipped) |
| `reading-while-listening` | B | Y | runner | — | ❌ | I1 | P3–P4 | see recipe doc |
| `reread-something-hard` | D | Y | runner | — | ❌ | I1 | P3–P4 | see recipe doc |
| `parallel-text` | C | Y | runner | — | ❌ | I1 | P3–P4 | see recipe doc |
| `book-you-know` | C | N | guided | — | ✅ | I2 | defer | see recipe doc |

## Listening (8)

| id | Ev | Host | Engine | Mat. | Built | I | Pri | Components still needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `listening-level-1` | B | Y | runner | — | ✅ | I2 | P3 | audio-play, comprehension-questions |
| `narrow-listening` | B | Y | runner | — | ❌ | I1 | P3–P4 | see recipe doc |
| `repeated-listening` | B | Y | runner | — | ❌ | I1 | P3–P4 | see recipe doc |
| `partial-dictation` | B | Y | runner | Y | ✅ | I3 | done | — (shipped: short/standard/long) |
| `full-dictation` | B | Y | runner | Y | ✅ | I3 | done | audio-play, full-dictation, sheet-download |
| `dictogloss` | B | Y | runner | — | ✅ | I2 | P3 | audio-play, type-freely, diff-highlight |
| `listening-faster` | C | Y | runner | — | ❌ | I1 | P3–P4 | see recipe doc |
| `background-listening` | C | N | guided | — | ✅ | I2 | defer | see recipe doc |

## Speaking (10)

| id | Ev | Host | Engine | Mat. | Built | I | Pri | Components still needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `four-three-two` | B | Y | runner | — | ✅ | I2 | P3 | round-marker, speak-prompt, voice-submit, rubric |
| `shadowing` | B | Y | runner | — | ❌ | I1 | P3–P4 | shadow-line, audio-play |
| `retell-what-you-read` | B | Y | runner | — | ✅ | I2 | P3–P4 | see recipe doc |
| `self-talk` | C | N | guided | — | ✅ | I2 | defer | see recipe doc |
| `describe-a-picture` | C | Y | runner | — | ❌ | I1 | P3–P4 | see recipe doc |
| `voice-message` | D | N | guided | — | ✅ | I2 | defer | see recipe doc |
| `role-play` | B | N | guided | — | ✅ | I2 | defer | see recipe doc |
| `recite-memorised` | C | Y | runner | — | ✅ | I2 | P3–P4 | see recipe doc |
| `singing-along` | C | N | guided | — | ✅ | I2 | defer | see recipe doc |
| `interpreting` | D | N | guided | — | ✅ | I2 | defer | see recipe doc |

## Writing (10)

| id | Ev | Host | Engine | Mat. | Built | I | Pri | Components still needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `build-a-sentence` | A | Y | runner | — | ✅ | I2 | P2 | type-with-word, reveal-answer |
| `free-production` | B | Y | runner | — | ✅ | I2 | P2 | timed-write, feedback |
| `diary-three-sentences` | B | Y | runner | — | ✅ | I2 | P3 | timed-write, feedback |
| `summarise-what-you-read` | B | Y | runner | — | ✅ | I2 | P3–P4 | see recipe doc |
| `back-translation` | B | Y | runner | — | ❌ | I1 | P3–P4 | see recipe doc |
| `copy-a-paragraph` | C | Y | runner | — | ❌ | I1 | P3–P4 | see recipe doc |
| `rewrite-in-your-own-words` | C | Y | runner | — | ❌ | I1 | P3–P4 | see recipe doc |
| `caption-your-photos` | D | Y | runner | — | ❌ | I1 | P3–P4 | see recipe doc |
| `translate-a-song` | D | N | guided | — | ✅ | I2 | defer | see recipe doc |
| `write-and-perform-a-play` | C | N | guided | — | ✅ | I2 | defer | see recipe doc |

## Form (6)

| id | Ev | Host | Engine | Mat. | Built | I | Pri | Components still needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `paradigm-tables-mixed` | A | Y | runner | — | ❌ | I1 | P2–P3 | see recipe doc |
| `minimal-pairs` | A | Y | runner | — | ✅ | I2 | P2 | minimal-pair |
| `cloze-sentences` | A | Y | runner | — | ✅ | I2 | P2 | cloze-type |
| `sentence-transformation` | B | Y | runner | — | ❌ | I1 | P3–P4 | see recipe doc |
| `own-error-log` | C | Y | runner | — | ❌ | I1 | P3–P4 | see recipe doc |
| `rule-at-point-of-error` | A | Y | runner | — | ✅ | I2 | P2–P3 | see recipe doc |

## Vocabulary (6)

| id | Ev | Host | Engine | Mat. | Built | I | Pri | Components still needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `srs-session` | A | Y | card | — | ✅ | I4 | P2–P3 | see recipe doc |
| `audio-cards` | B | N | card | — | pool only | I1 | defer | see recipe doc |
| `mine-your-own-sentences` | C | N | guided | — | ✅ | I2 | defer | see recipe doc |
| `collocation-cards` | B | N | card | — | pool only | I1 | defer | see recipe doc |
| `close-a-frequency-block` | A | N | card | — | pool only | I1 | defer | see recipe doc |
| `handwriting-shakiest` | B | N | guided | — | ✅ | I2 | defer | see recipe doc |

## World (5)

| id | Ev | Host | Engine | Mat. | Built | I | Pri | Components still needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `cook-from-a-recipe` | D | N | guided | — | ✅ | I2 | defer | see recipe doc |
| `video-game-in-target-language` | C | N | guided | — | ✅ | I2 | defer | see recipe doc |
| `tandem-or-language-cafe` | B | N | guided | — | ✅ | I2 | defer | see recipe doc |
| `order-ask-complain` | D | N | guided | — | ✅ | I2 | defer | see recipe doc |
| `film-you-know-by-heart` | C | N | guided | — | ✅ | I2 | defer | see recipe doc |

## Commitments (6 commitments)

| id | Ev | Host | Engine | Mat. | Built | I | Pri | Components still needed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `switch-phone-language` | D | N | commitment | — | ❌ | I1 | defer | see recipe doc |
| `write-to-one-friend` | D | N | commitment | — | ❌ | I1 | defer | see recipe doc |
| `label-the-flat` | C | N | commitment | — | ❌ | I1 | defer | see recipe doc |
| `one-series-target-audio` | D | N | commitment | — | ❌ | I1 | defer | see recipe doc |
| `shopping-list-in-your-head` | D | N | commitment | — | ❌ | I1 | defer | see recipe doc |
| `hobby-in-target-language` | D | N | commitment | — | ❌ | I1 | defer | see recipe doc |

## Recommended build order

| Wave | Methods | Why |
| --- | --- | --- |
| **P1** | `full-dictation`, `extensive-reading` | Dictation reuse; reading has material setup in catalogue |
| **P2** | `free-production`, `build-a-sentence`, `cloze-sentences`, `minimal-pairs` | Evidence A, short recipes, no TTS |
| **P3** | `dictogloss`, `four-three-two`, `diary-three-sentences`, `listening-level-1` | Needs audio + production components |
| **P4** | Remaining hosted runners | Shared components from P1–P3 |
| **Card** | Form-recall practice, `close-a-frequency-block` | Extend card engine |
| **Defer** | Thin-evidence hosted, unbuilt components | Low ROI until P1–P3 land |

## Related docs

| Doc | Owns |
| --- | --- |
| [`method-implementation-maturity.md`](specs/service/method-implementation-maturity.md) | I0–I4 implementation quality |
| [`method-guided-sessions.md`](specs/service/method-guided-sessions.md) | Every method has a guided path |
| [`playbooks/wire-a-method.md`](playbooks/wire-a-method.md) | Wire a catalogue Method to a runnable session |
| [`data/methods/`](../data/methods/) | Catalogue source of truth |
| [`exercise-recipe-composer.methods.md`](specs/service/exercise-recipe-composer.methods.md) | Specced step sequence |
| [`exercise-step-components.md`](specs/service/exercise-step-components.md) | Component catalogue |
| [`method-engines.md`](specs/service/method-engines.md) | Routing contract |
| [`study/21-method-catalogue-and-context.md`](study/21-method-catalogue-and-context.md) | Pedagogy narrative |
