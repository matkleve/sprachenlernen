# UC-011 — Start learning in the first minute, without deciding anything

<!-- id: UC-011 -->
<!-- specs: SPEC-service-auth, SPEC-service-discovery, SPEC-page-landing, SPEC-feature-privacy-consent, SPEC-service-session-builder, SPEC-service-session-sampling, SPEC-service-method-session-budget, SPEC-feature-review-session, SPEC-service-starter-deck, SPEC-page-language-picker -->

**Who:** someone who has just signed up and has not yet decided whether they
mean it.
**Wants to:** learn something, now.
**So that:** they find out whether this is for them before being asked to invest
anything **beyond the account**.

Derived from [`../study/STUDY-001-duolingo.md`](../study/STUDY-001-duolingo.md) S1 and S3,
and [`../study/STUDY-009-antipatterns.md`](../study/STUDY-009-antipatterns.md) A9 and A10.

## Today

Serious tools ask first: which deck, which settings, which level, take this
placement test, create an account. Every one of those is a place to leave, and
most people do. Duolingo's single largest advantage is that it asks none of
them — you tap a language and you are learning.

## Success looks like

- Signing up and choosing the language pair are the **only** two things asked
  before the first exercise. Nothing else — no deck, no settings, no level.
- Signup asks for nothing beyond what authentication needs. No name, no goal, no
  survey; each of those is a step S1 says costs users permanently.
- From the end of signup, the first real exercise is reachable in well under a
  minute.
- The first session uses a **supplied, frequency-ordered starting set**. Nobody
  has to create a card, pick a deck, or understand card design first. Session
  length is **fixed for onboarding** (15 cards today); menu-driven **budget
  minutes** apply once the learner browses Methods
  ([`method-session-budget.md`](../specs/service/method-session-budget.md), T-MV5).
- **No placement test before the first exercise.** It is offered afterwards, and
  skipping it is a normal outcome, not a deferred chore.
- Nothing in the first session depends on a setting the learner has not seen.
- A learner who stops after the first session and returns in three weeks finds
  their few cards intact and a session sized for them (UC-006).

## The account is a known cost, not an oversight

An account **is** required
([ADR-0006](../adr/0006-require-an-account.md)) — which contradicts the earlier
criterion here, and contradicts S1's [A]-graded finding on purpose. The
reasoning: the tool serves its author first, so the friction is paid once by
someone who is already committed. Everything else on the list above therefore
matters more, not less: the account is the only step that survives, so no second
step may be added beside it.

The trigger to revisit is in the ADR — the first time the product tries to gain a
user who is not its author.

## Out of scope

Choosing goals (UC-019), the level estimate itself (UC-004), and any
personalisation that needs data that does not exist yet.
