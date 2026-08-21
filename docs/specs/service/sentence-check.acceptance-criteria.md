# Sentence check — acceptance criteria

Split child of [`sentence-check.md`](sentence-check.md). Each row is one test in
`lib/sentence-check/`.

## Honesty

| # | Given | Then |
| --- | --- | --- |
| H1 | Any sentence with no findings | `status: "checked"`, `findings: []` — no field anywhere claims correctness |
| H2 | The result type | Has no `ok`/`correct`/`valid` token verdict — only `flagged` and `unchecked` |
| H3 | Lemma table missing for the language | `status: "unavailable"`, `reason: "no-lexicon"` — never `checked` with zero findings |
| H4 | Lexicon load throws | `status: "unavailable"`, `reason: "failed"` — the throw does not escape |

## Spelling

| # | Given | Then |
| --- | --- | --- |
| S1 | `Mi casa es grande` | No `spelling` finding — every token is a known form |
| S2 | `Mi caza es grandee` (es) | `spelling` on `grandee` only — `caza` is a real word (the checker does not read meaning) |
| S3 | `Vivo en Madrid` | No finding on `Madrid` — capitalised, unknown, proper-noun candidate |
| S4 | `vivo en madridd` | `spelling` on `madridd` |
| S5 | An unknown token one edit from exactly one known form | `suggestion` is that form |
| S6 | An unknown token one edit from several known forms | Finding without `suggestion` — no guess between candidates |
| S7 | `del`, `al` | Decomposed through `fused`; no `spelling` finding |
| S8 | Sentence-initial capital on a known lowercase word (`La casa`) | No `spelling` finding — case-folded before lookup |

## Agreement

| # | Given | Then |
| --- | --- | --- |
| A1 | `el casa` | `agreement` on `el`, suggestion `la` |
| A2 | `la casa` | No finding |
| A3 | `las casa` | `agreement` — number clash |
| A4 | `la mano` | No finding — table says `mano` is feminine despite the `-o` |
| A5 | `la agua` / `el agua` | No finding on `el agua` — one valid reading exists |
| A6 | A determiner whose noun is unknown to the table | No finding — nothing to clash against |
| A7 | A token with a pronoun reading that resolves the clash | No finding (ambiguity is exculpatory) |
| A8 | Adjective after its noun (`una casa blancos`) | `agreement` on `blancos` |

## Person

| # | Given | Then |
| --- | --- | --- |
| P1 | `yo tienes un perro` | `person` on `tienes`, suggestion `tengo` |
| P2 | `yo tengo un perro` | No finding |
| P3 | `tienes un perro` (no explicit pronoun) | No finding — pro-drop, nothing to contradict |
| P4 | `nosotros vamos` | No finding |
| P5 | A verb form with several person readings, one matching the pronoun | No finding |

## Target word

| # | Given | Then |
| --- | --- | --- |
| T1 | Target `casa`, sentence `Mi casa es grande` | No `missing-target` finding |
| T2 | Target `casa`, sentence `Las casas son grandes` | No finding — any form of the lemma counts |
| T3 | Target `casa`, sentence `Mi perro es grande` | `missing-target`, `tokenIndex: -1` |
| T4 | No target passed | No `missing-target` finding possible |

## Tokenising

| # | Given | Then |
| --- | --- | --- |
| K1 | `¿Dónde está la casa?` | Punctuation is not a token and never carries a finding |
| K2 | `no sé` vs `no se` | Accents are significant — both are known forms, neither flagged |
| K3 | Multiple spaces / newlines | Collapse; token indices stay contiguous |
| K4 | `tokenIndex` on every finding | Indexes into the returned `tokens` array (or `-1`) |
