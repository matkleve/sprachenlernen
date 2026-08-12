# UC-069 — Use the app in my own language

<!-- id: UC-069 -->
<!-- specs:  -->

**Who:** a learner whose comfortable reading language is not English — for
example a German speaker learning Spanish or Italian.
**Wants to:** read menus, buttons, errors and grade prompts in a language they
already know.
**So that:** using the app does not add a second literacy barrier on top of
learning the target language.

Derived from [`../I18N.md`](../I18N.md) (interface copy stages 0→1) and
[`../study/18-language-kit.md`](../study/18-language-kit.md) (the product
targets German → Romance pairs from day one).

## Today

The app is **stage 0** for interface copy: every string lives in per-feature
`content.ts` files, written in English. There is no locale switcher, no
`messages/<locale>.json`, and no `[locale]` route segment.

Switching "language" in the app today means **learning language** only
(`learner_language` — Spanish vs Italian). That changes which starter deck loads;
it does **not** change the language of the chrome.

## Success looks like

- The learner chooses an **interface language** independently of which languages
  they are learning. [`GLOSSARY.md`](../GLOSSARY.md) already warns against
  confusing these; this use case makes the split explicit.
- Navigation, settings, method copy, progress explanations, grade buttons and
  session prompts (`What does it mean?`, `Did you recall the form?`) render in
  the chosen interface language.
- Native language names in the language picker stay in their own endonym
  (`Español`, `Deutsch`) — per `I18N.md`, never translated.
- Adding a new interface language is a **data/pipeline** change (stage 1:
  `messages/<locale>.json` with key parity gates), not a hunt through two hundred
  components for inline English.
- A missing translation falls back to the source locale rather than showing a
  raw key on screen.

## Out of scope

- Translating **card glosses** (the English on meaning-recall backs and
  form-recall fronts) — that is UC-070. Interface language and gloss language
  are related but not the same knob.
- Translating the **target language** being learned. Spanish cards still show
  Spanish lemmas.
- Right-to-left layout (decide before building, per `I18N.md` — not assumed here).

## Undecided

- **⚠ SPEC GAP: where the interface locale is stored** — account preference,
  cookie, URL prefix, or browser `Accept-Language` default only?
- **⚠ SPEC GAP: default interface language for a new account** — infer from
  browser, ask on first run, or default to English until chosen?
- **⚠ SPEC GAP: stage-1 library choice** — `I18N.md` names `next-intl`; confirm
  before the `[locale]` route migration, because undoing the wrong abstraction is
  more expensive than adding the right one late.
