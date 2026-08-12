# UC-069 — Use the app in the language I speak

<!-- id: UC-069 -->
<!-- specs:  -->

**Who:** a learner whose comfortable language is not English — for example a
German speaker learning Spanish or Italian.
**Wants to:** read menus, buttons, errors, grade prompts, **and** card
definitions in a language they already know.
**So that:** using the app does not add a second literacy barrier on top of
learning the target language.

Derived from [`../I18N.md`](../I18N.md) (interface copy stages 0→1),
[`../study/18-language-kit.md`](../study/18-language-kit.md) (the product
targets German → Romance pairs from day one), and
[`../../data/README.md`](../../data/README.md) (starter pools ship English
glosses today).

**Correction, 2026-08-12:** this was originally written as two use cases —
"interface language" for the chrome and "gloss language" for card text —
treated as independently settable. That was wrong. A person has exactly two
languages in play at any point: the one they speak, and the one they are
learning. There is no second, independent "gloss language" — it is the same
spoken language, shown on a second surface. Folded into one use case; the old
`UC-070` file is retired, its content merged below.

## Today

Two different surfaces are both stuck in English, for two different reasons:

- **The chrome** is **stage 0**: every string lives in per-feature `content.ts`
  files, written in English. No locale switcher, no `messages/<locale>.json`,
  no `[locale]` route segment.
- **Card content** is **baked into shipped JSON at build time**, English only:

  | Card type | What the learner sees | Where it lives |
  | --- | --- | --- |
  | Meaning-recall | Target lemma on front; **English** gloss on back | `data/starter/<lang>-meaning-recall.json` |
  | Form-recall | **English** gloss + "write the Spanish/Italian form" on front; target surface form on back | `data/starter/<lang>-form-recall.json` |

  Glosses come from Kaikki's English sense lines plus hand-checked overrides
  in `*.overrides.json`. The build script writes the full `front` string into
  the JSON — it is not assembled from translatable parts at runtime. Reviews
  in the database store only `task_id` and grade, never the prompt text, so
  localizing cards is a **pool/content** problem, not a `review_log`
  migration.

Switching "language" in the app today means **learning language** only
(`learner_language` — Spanish vs Italian). That changes which starter deck
loads; it does not change the language anything is *described* in.

## Success looks like

- The learner has exactly **one** spoken-language setting for the whole
  account — not a per-surface choice. It drives both:
  - Navigation, settings, method copy, progress explanations, grade buttons
    and session prompts (`What does it mean?`, `Did you recall the form?`).
  - Meaning-recall card backs and form-recall card fronts, including
    human-readable paradigm hints where the cell is part of the prompt
    (UC-041) — e.g. German: *laufen — schreib die spanische Form*.
- **Storage — resolved 2026-08-12:** a new `public.profiles` table, one row
  per account, primary keyed on `user_id references auth.users(id)` — never a
  column bolted onto the auth table itself. This is a genuinely new pattern:
  every existing preference table (`learner_language`) is one-to-many per
  account; spoken language is a singleton, so it gets its own table rather
  than forcing a 1:1 relationship onto a 1:many one.
- **Default — resolved 2026-08-12:** a brand-new account is seeded from the
  browser/device locale at signup (`Accept-Language`, mapped to the nearest
  language this app ships an interface/gloss for; English if none match).
  Changeable at any time afterward from account settings.
- **Library — no objection raised.** Proceeding with `next-intl`, `I18N.md`'s
  existing stage-1 recommendation, for the chrome half of this.
- Native language names in the language picker stay in their own endonym
  (`Español`, `Deutsch`) — per `I18N.md`, never translated.
- Adding a new spoken language is a **data/pipeline** change (stage 1:
  `messages/<locale>.json` with key parity gates, plus a gloss source for that
  language), not a hunt through two hundred components for inline English.
- A missing translation falls back to the source locale rather than showing a
  raw key on screen.
- `task_id` stays stable across spoken languages so review history does not
  orphan when the setting changes — identity is the target-language item, not
  the wording of the prompt.

## Out of scope

- Translating the **target language** being learned. Spanish cards still show
  Spanish lemmas, regardless of spoken language.
- Right-to-left layout (decide before building, per `I18N.md` — not assumed
  here).
- Runtime machine translation of glosses on every card load (network,
  inconsistency, no review workflow — see `I18N.md` stage 2+ for how quality
  is gated when machines write copy).
- Multiple spoken languages active at once for the same account (one is
  enough to start).

## Undecided

Resolved this session: where the setting lives (`profiles` table), the
default (browser/device locale), and the library (`next-intl`, no objection).
Still open — these are about **card gloss content**, not about the setting
itself, and block [`UC-023`](UC-023-report-something-wrong.md)'s report scope:

- **⚠ SPEC GAP: gloss content storage shape** — duplicate starter pool files
  per spoken language (`de-es-meaning-recall.json`) vs. one deck + parallel
  `wordId`-keyed gloss tables resolved at load time.
- **⚠ SPEC GAP: form-recall prompt parts** — split `backGloss`, `paradigmHint`
  and `produceInstruction` so each is independently translatable, vs. one
  opaque `front` string per spoken language.
- **⚠ SPEC GAP: non-English gloss source** — Kaikki only ships English senses;
  a second lexical source, MT with human review, or hand-written overrides at
  scale, with provenance recorded per `data/README.md`.
