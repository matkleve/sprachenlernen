# Language flag

<!-- id: SPEC-component-language-flag -->
<!-- use-case: UC-025 -->
<!-- status: active -->

A **decorative** flag glyph inside a circle for the shell language switcher.
The endonym remains the identifier everywhere — this is never the primary
label on profile or picker rows ([`../page/profile.md`](../page/profile.md),
[`../page/language-picker.md`](../page/language-picker.md)).

## Scope

- **In:** circular geometry, `header` and `row` sizes, flag glyph from
  `lib/languages.ts`.
- **Out:** interaction (the switcher owns the button); using a flag as the only
  label for a language anywhere else.

**Reuse: `buttonVariants`** for the `header` size so the circle matches other
floating corner chips.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Sees the flag circle | Reads the endonym from the parent control's label, not from the glyph |

## States

Non-interactive when rendered alone on a single-language account. When nested
in the switcher trigger, the parent button carries interaction states.

## Data

`code` → `languageLabel(code).flag`. Unknown codes fall back to 🌐.

## Acceptance criteria

- [ ] Given Spanish, when `LanguageFlag` renders with `size="header"`, then the
      circle shows 🇪🇸 and uses token utilities only.
- [ ] Given any code, when the flag renders, then the glyph is `aria-hidden` and
      the parent must supply the accessible name.

## Check

`npm test -- LanguageFlag`
