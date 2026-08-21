# UC-069 — Use the app in the language I speak

<!-- id: UC-069 -->
<!-- specs: SPEC-service-spoken-language, SPEC-service-app-texts, SPEC-service-gloss-resolver, SPEC-service-method-catalogue-i18n, SPEC-service-chrome-i18n-stragglers -->

**Who:** a learner whose comfortable language is not English — for example a
German speaker learning Spanish or Italian.
**Wants to:** read menus, buttons, errors, grade prompts, **and** the text
that describes each card in a language they already know.
**So that:** using the app does not add a second literacy barrier on top of
learning the target language.

Derived from [`../I18N.md`](../I18N.md) (interface copy stages 0→1),
[`../study/STUDY-016-language-kit.md`](../study/STUDY-016-language-kit.md) (the product
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

Two surfaces, two implementation stages:

- **The chrome** is **stage 1 shipped** — `next-intl`, `messages/{en,de}.json`,
  driven by `profiles.spoken_language` and the locale cookie. Menus, grade
  buttons, and session prompts (e.g. „Was bedeutet es?“) follow the spoken
  language.
- **Card and content glosses** are still **English in shipped JSON**:

  | Card type | What the learner sees | Where it lives today |
  | --- | --- | --- |
  | Meaning-recall | Target lemma on front; **English** gloss on back | `data/starter/<lang>-meaning-recall.json` field `back` |
  | Form-recall | **English** prompt on front; target form on back | `data/starter/<lang>-form-recall.json` |

  The pool carries the gloss string inline. **`descriptionKey`** + runtime
  lookup ([`app-texts.md`](../specs/service/app-texts.md),
  [`gloss-resolver.md`](../specs/service/gloss-resolver.md)) is specced but not
  built — that is slice 3 of T-B11 / T-W15.

  Reviews store only `task_id` and grade — never the description text — so
  localizing glosses is a **content + render** change, not a `review_log`
  migration.

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
- **The word being learned and the text describing it are separate records —
  resolved 2026-08-12, specced 2026-08-18.** Pool JSON carries
  **`descriptionKey`** (e.g. `card.it:fare.meaning-recall.back`). The visible
  gloss is looked up at render time via [`gloss-resolver.md`](../specs/service/gloss-resolver.md)
  using (`descriptionKey`, `spoken_language`). English seeds
  [`app-texts.md`](../specs/service/app-texts.md); German and other locales are
  published translation rows — not a second deck file per locale.
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

None for slice 3 contract. Implementation slices: T-B11c–e / T-W15 in
[`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md).

Resolved — contract in [`app-texts.md`](../specs/service/app-texts.md) and
[`gloss-resolver.md`](../specs/service/gloss-resolver.md) (2026-08-12 decisions
10–11, specced 2026-08-18).
