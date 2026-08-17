# Interaction inventory — production surfaces

<!-- parent: SPEC-system-interaction-inventory -->

Every interactive in `app/` and `features/`, mapped to its primitive.
Update this file in the same PR as any new control or migration.

## App shell

| Control | File | Primitive | Variant / policy | P |
| --- | --- | --- | --- | --- |
| Destination nav (desktop) | `DestinationNavItems.tsx` | `NavLink` | `layout="header"`; `current` from pathname | ✓ |
| Destination nav (mobile pill) | `DestinationNavItems.tsx` | `IconLink` | `layout="pill"`; `current` from pathname | ring |
| Mobile back chip | `FloatingShellChrome.tsx` | `IconLink` | drill-in only; neutral at rest; `pendingPolicy="nav"` | ring |
| Mobile language chip | `FloatingShellChrome.tsx` | `LanguageSwitcher` | destination roots only (`layout="floating"`) | ring |
| Mobile profile icon | `FloatingShellChrome.tsx` | `IconLink` | `current` on `/profile`; `nav` | ring |
| Desktop account | `DesktopShellHeader.tsx` | `ActionLink` | `ghost sm`; `current` on `/profile` | ✓ |
| Language trigger | `LanguageSwitcher.tsx` | `IconButton` | `nav`; disabled while switching | ring |
| Language menu row | `LanguageSwitcher.tsx` | `LanguageListRow` | disabled while `pending` | — |
| Add language (menu) | `LanguageSwitcher.tsx` | `ActionLink` | `secondary sm` | ✓ |
| Language scrim | `LanguageSwitcher.tsx` | raw `<button>` | **exempt** — dismiss overlay | — |
| Page content wrapper | `ShellPageContent.tsx` | layout shell | `mode` + `width` from [`page-layout.md`](../feature/page-layout.md) | — |

## Marketing (signed out)

| Control | File | Primitive | Variant | P |
| --- | --- | --- | --- | --- |
| Brand | `PublicHeader.tsx` | `TextLink` | `ink sm` | — |
| Sign in | `PublicHeader.tsx` | `ActionLink` | `ghost sm`; `aria-current` on `/login` | ✓ |
| Sign up | `PublicHeader.tsx` | `ActionLink` | `primary sm` | ✓ |
| Primary CTA | `LandingHero.tsx` | `ActionLink` | `primary lg` | ✓ |
| Secondary CTA | `LandingHero.tsx` | `ActionLink` | `secondary lg` | muted |
| Footer links ×2 | `LandingHero.tsx` | `TextLink` | `accent` | — |
| 404 back | `not-found.tsx` | `ActionLink` | `secondary` | ✓ |

## Auth

| Control | File | Primitive | Variant | P |
| --- | --- | --- | --- | --- |
| Sign in / up submit | `SignInForm.tsx`, `SignUpForm.tsx` | `SubmitButton` | default | auto |
| OAuth ×2 | `OAuthButtons.tsx` | `SubmitButton` | `secondary`, round icon-only, row | auto |
| Switch link | `SignInForm.tsx`, `SignUpForm.tsx` | `TextLink` | `sm` | — |

## Words / review

| Control | File | Primitive | Variant | P |
| --- | --- | --- | --- | --- |
| Start review | `WordsHome.tsx` | `ActionLink` | `primary lg` | ✓ |
| Lemma callout | `LemmaCallout.tsx` | `Disclosure` / `DisclosureSummary` / `DisclosurePanel` | accent-soft shell; mobile only | — |
| Flip card | `ReviewCard.tsx` | `PressableCard` | interactive when flippable | — |
| Report flag | `ReviewCard.tsx` | `IconButton` `sm` | `pendingPolicy="none"` | on report |
| Sync retry | `ReviewSession.tsx` | `Button` | `secondary sm`, manual pending | ✓ |
| Complete CTAs ×2 | `SessionComplete.tsx` | `ActionLink` | primary + secondary | ✓ |
| Error back | `ReviewSession.tsx` | `TextLink` | `muted sm` | — |

## Methods

| Control | File | Primitive | Variant | P |
| --- | --- | --- | --- | --- |
| Method card link | `MethodCard.tsx` | `SurfaceLink` | `cardPressable` on the card shell (border + header + body) | ✓ |
| Filter pills | `MethodFilter.tsx`, `RefineFilter.tsx` | `FilterPill` | `aria-pressed` | — |
| Refine panel toggle | `RefineFilter.tsx` | `Disclosure` / `DisclosureSummary` | native `<details>` | — |
| Time slider | `TimeSlider.tsx` | `<input type="range">` | focus ring | — |
| Empty → review | `CurrentStanding.tsx` | `ActionLink` | `secondary` | ✓ |
| Progress link | `CurrentStanding.tsx` | `TextLink` | `ink sm` | — |
| Back link | `MethodDetail.tsx` | `ActionLink` | `ghost sm` + hover override | ✓ |
| Start session | `MethodDetail.tsx` | `ActionLink` | `primary lg` | ✓ |
| Load error | `MethodMenu.tsx` | `ErrorCallout` | retry slot if provided | — |

## Progress

| Control | File | Primitive | Variant | P |
| --- | --- | --- | --- | --- |
| Empty start review | `ProgressReport.tsx` | `ActionLink` | `primary` | ✓ |

## Profile / account

| Control | File | Primitive | Variant | P |
| --- | --- | --- | --- | --- |
| Section pills | `ProfileSectionNav.tsx` | `FilterPill` | `aria-pressed`; toggles server panels by id | — |
| Spoken language row | `ProfileSpokenLanguage.tsx` | `LanguageListRow` | `names` override | — |
| Spoken make active | `ProfileSpokenLanguage.tsx` | `SubmitButton` | `secondary sm` | auto |
| Choose first | `ProfileLanguages.tsx` | `ActionLink` | primary (default) | ✓ |
| View progress | `ProfileLanguages.tsx` | `ActionLink` | `text-sm` override | ✓ |
| Make active | `ProfileLanguages.tsx` | `SubmitButton` | `secondary sm` | auto |
| Add language | `ProfileLanguages.tsx` | `ActionLink` | `secondary` | ✓ |
| Export scope | `AccountDataPanel.tsx` | `Select` | native | — |
| Download | `AccountDataPanel.tsx` | `Button` | `secondary`, manual pending | ✓ |
| Delete open | `AccountDataPanel.tsx` | `Button` | `danger` | — |
| Dialog cancel / confirm | `AccountDataPanel.tsx` | `Button` | secondary / danger | ✓ on confirm |
| Sign out | `profile/page.tsx` | `SubmitButton` | `secondary` | auto |

## Privacy

| Control | File | Primitive | Variant | P |
| --- | --- | --- | --- | --- |
| Policy link | `CookieConsent.tsx` | `TextLink` | `sm` | — |
| Essential / Accept | `CookieConsent.tsx` | `Button` | secondary + primary | — (instant) |

## Language picker

| Control | File | Primitive | Variant | P |
| --- | --- | --- | --- | --- |
| Choose (per tile) | `LanguagePicker.tsx` | `SubmitButton` | default | auto |
| Unavailable tile | `LanguagePicker.tsx` | — | no control rendered | — |

## Design explorer (`/dev/design`)

| Control | File | Primitive | Variant | P |
| --- | --- | --- | --- | --- |
| Choose theme | `ThemePreview.tsx` | `Button` | primary/secondary toggle | — (instant) |
| Preview demos ×3 | `ThemePreview.tsx` | `Button` | sm variants | display only |
| Preview input | `ThemePreview.tsx` | `Input` | `readOnly` | — |

## Error boundaries

| Control | File | Primitive | Variant | P |
| --- | --- | --- | --- | --- |
| Try again | `RouteErrorSurface.tsx` | `Button` | `secondary`, `useTransition`; hard reload on `render/boundary` | ✓ |
| Back to Methods | `RouteErrorSurface.tsx` | `ActionLink` | `secondary`; non-destination routes only | ✓ |
| Route / global error | `error.tsx`, `global-error.tsx` | via `RouteErrorSurface` | — | ✓ |
| Destination error | `DestinationError.tsx` | via `RouteErrorSurface` | — | ✓ |
