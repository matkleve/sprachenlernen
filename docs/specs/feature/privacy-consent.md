# Privacy and cookie consent

<!-- id: SPEC-feature-privacy-consent -->
<!-- use-case: UC-011 -->
<!-- status: active -->

GDPR-facing consent for non-essential cookies and a link to what is stored.
Essential cookies (auth session) always run; analytics wait for opt-in.

## Scope

- **In:** a bottom banner on first visit; accept / essential-only; link to
  `/privacy`; `localStorage` key recording the choice.
- **Out:** full legal text (placeholder page until counsel); analytics wiring;
  data-export and deletion flows (T-B2 / CONSTITUTION §2).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | First visit | Banner visible |
| 2 | Accept | Choice stored; banner hidden |
| 3 | Essential only | Choice stored; banner hidden |
| 4 | Opens `/privacy` | Placeholder policy listing what the app stores today |

## Acceptance criteria

- [ ] Given no stored choice, when any page renders, then the banner is visible.
- [ ] Given a stored choice, then the banner is absent.
- [ ] The banner links to `/privacy`.

## Check

`npm test -- privacy-consent`
