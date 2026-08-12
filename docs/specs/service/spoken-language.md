# Spoken language

<!-- id: SPEC-service-spoken-language -->
<!-- use-case: UC-069 -->
<!-- status: active -->

The account-level **spoken language** — one value per Account, stored in
`public.profiles`, driving chrome translation (stage 1, `next-intl`, later) and
the key for card description text (stage 3, later). **Sensitive** — persisted,
owned per Account.

Parent: [ADR-0012](../../adr/0012-ux-decisions-requeue-i18n-leech-nav.md) decisions
10–11, [`I18N.md`](../../I18N.md).

## Scope

- **In:** `public.profiles` migration, `lib/db/profiles.ts`, `lib/spoken-language.ts`
  (supported codes + `Accept-Language` resolution), seeding at first sign-in,
  profile UI to read and change the setting via [`language-list-row.md`](../component/language-list-row.md).
- **Out:** `next-intl` wiring and `messages/<locale>.json` (T-B11 slice 2);
  stage-3 `app_texts` tables; runtime card-description lookup by spoken language;
  RTL layout.

## Behavior

| # | Input | System response |
| --- | --- | --- |
| 1 | Account created (email signup with session, OAuth, or email confirmation callback) | One `profiles` row is inserted with `spoken_language` from `Accept-Language`, mapped to the nearest shipped code, else `en` |
| 2 | Signed-in Account with no `profiles` row (legacy) | First read inserts a row with `en` |
| 3 | Account opens `/profile` | Current spoken language shown by endonym; picker lists every shipped code |
| 4 | Account selects a different spoken language | Row updates; learning languages and review history unchanged |
| 5 | Read fails | `error` outcome — never a silent default that hides a database failure |

## States

Not a UI machine. Adapter returns `ok | error`.

## Data

```sql
create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  spoken_language text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

| Column | Notes |
| --- | --- |
| `user_id` | Owner — session only, never from the client |
| `spoken_language` | BCP-47 primary subtag; v1 ships `en` and `de` |

**RLS:** select/insert/update own row only. No delete policy — row cascades with
the Account.

Shipped spoken languages (v1): `en`, `de`. Endonyms are fixed literals per
`I18N.md` — never passed through `t()`.

## Acceptance criteria

See [`spoken-language.acceptance-criteria.md`](spoken-language.acceptance-criteria.md).

## Check

`npm test -- spoken-language profiles`

## Open

- **`next-intl` route strategy** — cookie vs `[locale]` prefix. Deferred to
  slice 2; this slice only persists the setting.
