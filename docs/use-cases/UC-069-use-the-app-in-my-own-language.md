# UC-069 — Use the app in the language I speak

<!-- id: UC-069 -->
<!-- specs:  -->

**Who:** a learner whose comfortable language is not English — for example a
German speaker learning Spanish or Italian.
**Wants to:** read menus, buttons, errors, grade prompts, **and** the text
that describes each card in a language they already know.
**So that:** using the app does not add a second literacy barrier on top of
learning the target language.

Derived from [`../I18N.md`](../I18N.md) (interface copy stages 0→1),
[`../study/18-language-kit.md`](../study/18-language-kit.md) (the product
targets German → Romance pairs from day one), and
[`../../data/README.md`](../../data/README.md) (starter pools ship English
descriptions today).

**Correction, 2026-08-12:** this was originally written as two use cases —
"interface language" for the chrome and "gloss language" for the text on a
card — treated as independently settable. That was wrong, and confusingly
named. A person has exactly two languages in play: the one they speak, and
the one they are learning. Folded into one use case; the old `UC-070` file is
retired, its content merged below.

## Today

Two different surfaces are both stuck in English, for two different reasons:

- **The chrome** is **stage 0**: every string lives in per-feature `content.ts`
  files, written in English. No locale switcher, no `messages/<locale>.json`,
  no `[locale]` route segment.
- **Card content** is **baked into shipped JSON at build time**, English only:

  | Card type | What the learner sees | Where it lives |
  | --- | --- | --- |
  | Meaning-recall | Target lemma on front; **English** description on back | `data/starter/<lang>-meaning-recall.json` |
  | Form-recall | **English** description + "write the Spanish/Italian form" on front; target surface form on back | `data/starter/<lang>-form-recall.json` |

  The word being learned and the text that describes it are **one string in
  one JSON file today, not two separate things** — that is exactly the
  problem. Reviews in the database store only `task_id` and grade, never the
  description text, so localizing the description is a **content** change,
  not a `review_log` migration.

Switching "language" in the app today means **learning language** only
(`learner_language` — Spanish vs Italian). That changes which starter deck
loads; it does not change the language anything is *described* in.

## Success looks like

- The learner has exactly **one** spoken-language setting for the whole
  account — not a per-surface choice. It drives both:
  - Navigation, settings, method copy, progress explanations, grade buttons
    and session prompts (`What does it mean?`, `Did you recall the form?`).
  - The description text on a card — meaning-recall backs, form-recall
    fronts — including human-readable paradigm hints where the cell is part
    of the prompt (UC-041) — e.g. German: *laufen — schreib die spanische
    Form*.
- **The word being learned and the text describing it are two separate
  records, not one — resolved 2026-08-12.** The Spanish word `correr` (its
  identity, its `taskId`, its review history, its schedule) is one thing.
  The string "to run" or "laufen" that describes it is a **second, separate**
  record, looked up by (word, spoken language) at render time — never baked
  together into one file per spoken language. This is *why* it matters, not
  just *how*: **switching the account's spoken language from English to
  German, mid-course, changes only the description text. The Spanish word
  keeps the exact same identity and the exact same progress** — same
  stability, same due date, same review history. A design where each spoken
  language got its own duplicate deck (`de-es-meaning-recall.json` next to
  `en-es-meaning-recall.json`) would risk exactly the opposite: a different
  `taskId` per spoken language, and switching languages would look like
  starting over. That design is therefore **rejected**, not just one option
  among several.
- **Storage — resolved 2026-08-12:** a new `public.profiles` table, one row
  per account, primary keyed on `user_id references auth.users(id)` — never a
  column bolted onto the auth table itself. This is a genuinely new pattern:
  every existing preference table (`learner_language`) is one-to-many per
  account; spoken language is a singleton, so it gets its own table rather
  than forcing a 1:1 relationship onto a 1:many one.
- **Default — resolved 2026-08-12:** a brand-new account is seeded from the
  browser/device locale at signup (`Accept-Language`, mapped to the nearest
  language this app ships an interface/description for; English if none
  match). Changeable at any time afterward from account settings.
- **Library — no objection raised.** Proceeding with `next-intl`, `I18N.md`'s
  existing stage-1 recommendation, for the chrome half of this.
- Native language names in the language picker stay in their own endonym
  (`Español`, `Deutsch`) — per `I18N.md`, never translated.
- Adding a new spoken language is a **content** change (stage 1:
  `messages/<locale>.json` with key parity gates, plus description text for
  every word already shipped), not a hunt through two hundred components for
  inline English, and not a rebuild of the learning-language pool.
- A missing translation falls back to the source locale rather than showing a
  raw key on screen.

## Out of scope

- Translating the **target language** being learned. Spanish cards still show
  Spanish lemmas, regardless of spoken language.
- Right-to-left layout (decide before building, per `I18N.md` — not assumed
  here).
- Runtime machine translation on every card load (network, inconsistency, no
  review workflow — see `I18N.md` stage 2+ for how quality is gated when
  machines write copy).
- Multiple spoken languages active at once for the same account (one is
  enough to start).

## Undecided

Resolved 2026-08-12 (decisions 10–11, owner + UX):

- **Description-text source:** card descriptions use [`I18N.md`](../I18N.md)
  **stage 3** — `app_texts` + `app_text_translations`, keyed by (`wordId`,
  spoken language), `status` workflow, runtime snapshot JSON. English seeded
  from Kaikki; other locales MT → review → publish. App chrome stays stage 1
  (`next-intl` JSON). Same database-i18n pattern as Grundriss/Feldpost;
  contract is `I18N.md`, not a one-off.
- **One string per card face per spoken language** — no split into definition /
  hint / instruction parts for v1. Form-recall fronts like *"to run — write
  the Spanish form"* are translated as one row, not three fields.
