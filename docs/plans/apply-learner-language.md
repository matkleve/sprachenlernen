# Runbook — put `learner_language` on the live project

**Status:** waiting on the owner. Nothing else in the language work can be
exercised until this runs — `/methods`, `/words`, `/progress` and the review
session all read `learner_language`, and against a project without that table
every one of them shows the error surface.

**Why an agent did not do it.** The credentials are the owner's: `.env` is
gitignored and unset here, and a `SUPABASE_SERVICE_ROLE_KEY` is unrestricted
database access. There is also no local Postgres in the agent environment (no
daemon, `psql` is a client with nothing to connect to), so the migration could
not be rehearsed either. **It has never been executed anywhere.**

## 1. Apply the migration (~2 min)

Supabase dashboard → SQL editor → paste
[`supabase/migrations/20260811150000_learner_language.sql`](../../supabase/migrations/20260811150000_learner_language.sql)
verbatim → Run.

It creates one table, three indexes, and three policies. It drops nothing and
touches no existing table, so it is reversible by `drop table
public.learner_language;` — unlike the `review_log` migrations, which are not.

**Expected:** `Success. No rows returned.`

## 2. Check the four things the code depends on

```sql
-- 1. one row per (account, language), and at most one active
select indexname from pg_indexes
 where tablename = 'learner_language';
-- expect: learner_language_unique_per_account,
--         learner_language_one_active_per_account,
--         learner_language_user_id_idx (+ the pkey)

-- 2. RLS is on
select relrowsecurity from pg_class where relname = 'learner_language';
-- expect: t

-- 3. three policies, and no delete policy
select policyname, cmd from pg_policies where tablename = 'learner_language';
-- expect: select / insert / update only

-- 4. authenticated has no DELETE grant
select privilege_type from information_schema.role_table_grants
 where table_name = 'learner_language' and grantee = 'authenticated';
-- expect: SELECT, INSERT, UPDATE — no DELETE
```

Items 3 and 4 are deliberate: whether removing a language is offered is an open
question in [`learning-languages.md`](../specs/service/learning-languages.md),
and granting the capability first would decide it by accident.

## 3. Let the access-control suite prove the rest (~1 min)

Add the three secrets in GitHub → Settings → Secrets and variables → Actions:

| Secret | Where it is |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | same page, the publishable/anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | same page — **service role**, treat as a password |

The workflow already forwards all three; without them
`lib/db/access-control.test.ts` skips itself, which is why CI has reported green
over **11 tests it never ran** — six of which cover this table, including the
UPDATE surface it is the first to grant.

The suite creates two throwaway accounts, tries to read, update and delete each
other's rows, and deletes both users afterwards. It writes only to
`review_log` and `learner_language`.

**Expected after the secrets land:** `Tests 524 passed` and no `↓ skipped` line.
If the RLS tests fail, the policies are wrong and the table should come back out
— that is the outcome this suite exists to produce, and it has never had the
chance.

## What is still not covered even then

The suite proves the **policy**. It does not prove `setActiveLanguage`'s
clear-then-promote sequence under concurrency, because both statements run
through PostgREST rather than one transaction. The adapter restores the previous
row when the promotion touches nothing, and that path is unit-tested against a
stub — not against a real database. Named here rather than implied by a green
run.
