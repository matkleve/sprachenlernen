# 30 · Notifications, weekly reflections, and “how am I doing?”

The question behind this chapter: should Sprachenlernen **reach out** — push,
email, or a standing weekly summary — to tell the learner how they are doing and
invite reflection?

Short answer: **yes, but only a narrow slice, and mostly inside the app first.**
The product already decided most of the “no” cases in
[08](08-motivation.md), [10](10-antipatterns.md), and
[UC-051](../use-cases/UC-051-notice-that-i-stopped-getting-better.md). What
remains is worth doing carefully.

---

## What people usually mean

Three different things get lumped together:

| Kind | Example | What it optimises |
| --- | --- | --- |
| **Operational** | “12 cards are due · ~6 min” | Closing a loop the app already opened |
| **Reflective** | “34 words moved from shaky to solid this week; listening jumped” | Competence narrative ([08](08-motivation.md), M6) |
| **Evaluative** | “You’re falling behind / great job / streak at risk!” | Return frequency, not learning |

Only the first two belong here. The third is how language apps train uninstalls
([01](01-duolingo.md), [08](08-motivation.md) loss-escalation row).

“How well am I doing?” in *this* product is not a mood score. It is measured
competence per skill ([03](03-level-model.md)) — held vocabulary, fragile vs
stable recall, horizon, form mastery — always with a path into what produced the
number ([UC-004](../use-cases/UC-004-know-where-i-stand.md)).

---

## Evidence

### E1 · Reminders can work if they carry information, not guilt **[B]**

Retention research on mobile learning consistently finds that **timely, specific
cues** outperform generic nudges — but the effect is modest and decays fast once
the cue becomes predictable or shame-based. Meta-analytic work on digital
nudging (e.g. habit-formation and health-behaviour domains) supports the same
shape: **state + cost**, not **omission + judgment**.

Maps directly to M3 in [08](08-motivation.md):

> 12 cards are tipping over today. 6 minutes.

Not: *You haven’t practised today.*

### E2 · Self-determination theory: informational beats controlling **[A]**

Ryan & Deci’s SDT (summarised in [02](02-evidence.md), E7) is the binding rule:
messages that describe **where you stand** support competence; messages that
describe **what you failed to do** undermine autonomy and raise anxiety.
Dörnyei’s ideal-self vs ought-to-self split ([16](16-further-findings.md), W4)
says the same thing for language specifically: *“You can now read this headline”*
motivates; *“You are 400 words short of B1”* demotivates — even when both are
factually true.

**Rule [D]:** every outbound or weekly line is checked against the
informational/controlling table in [08](08-motivation.md) before it ships.

### E3 · Reflection helps when it is causal and actionable, not numeric **[B/C]**

Educational “learning analytics” reviews find that **dashboards alone** rarely
change behaviour; **narratives that link action → outcome → next step** do
better, especially when the learner opted in. Language-learning plateau
literature (see [UC-051](../use-cases/UC-051-notice-that-i-stopped-getting-better.md))
suggests the valuable unit is an **observation about a structure** (“ser/estar
still alternating”) not a global grade.

That is M6 — weekly review as sentences, not KPIs.

### E4 · Weekly push without new information is noise **[D]**

[12](12-method-cards.md) is explicit on persuasion: show effect data **once**,
calmly; do not re-argue weekly. A reflection that repeats the same chart every
Sunday trains ignore — the notification channel dies before the product does.

**Corollary [D]:** a weekly reflection must contain **at least one sentence that
could not have been true last week**. If nothing moved, say that honestly
(*“Nothing shifted in measured recall this week — that is normal after a light
week”*) rather than inventing motion.

---

## What the codebase already decided

| Item | Where | Verdict |
| --- | --- | --- |
| F74 Notification with content | [09](09-feature-catalogue.md) | **V1** — operational only |
| F76 Weekly review narrative | [09](09-feature-catalogue.md) | **V2** — in-app first |
| F75 Weekly streak (≥3 days/week) | [09](09-feature-catalogue.md) | **V2**, below level, no shop |
| UC-005 weekly summary in words | [UC-005](../use-cases/UC-005-trust-the-review-schedule.md) | scheduler trust, not gamification |
| UC-051 stagnation prompt | [UC-051](../use-cases/UC-051-notice-that-i-stopped-getting-better.md) | **no push**; max one/day in-app |
| Per-language notification fan-out | [UC-025](../use-cases/UC-025-learn-multiple-languages.md) | **rejected** |
| Error / toast channel | [error-callout spec](../specs/component/error-callout.md) | failures only, not progress |

Nothing here contradicts adding reflections — it constrains **how**.

---

## Recommendation

### Tier 1 · Ship first (in-app, no push) **[D]**

1. **Progress destination** already holds measured figures — extend with a
   **“This week”** block: words that changed band (fragile → held), one skill
   that moved most, one structure still alternating (UC-051 logic, but only when
   triggered).
2. **Review horizon / scheduler surfaces** (UC-005): weekly sentence embedded
   where the learner already looks when trusting the schedule — not a new tab.
3. **Opt-in operational reminder** (F74): due-count + time estimate, user sets
   time window. Default **off**. Copy must pass the “no *you have not*” test.

Why in-app first: zero permission friction, full drill-down into derivation,
easier to honour Constitution §2 (user data stays user-controlled), and you can
A/B whether anyone reads it before touching push.

### Tier 2 · After Tier 1 proves readership **[D]**

1. **Weekly reflection digest** (email or push, user chooses channel):
   - 3–5 sentences, M6 shape, one causal link (*“mostly through …”*).
   - Single deep link into Progress with the chart that produced the sentence.
   - Send only if the account had **any** measured activity that week OR send a
     one-line honest idle message — never silence nor fake progress.
2. **Break mode** (F78 / M8): suppress all outbound while active.
3. **Competence moment** (F77): re-offer content that was too hard — event-driven,
   not calendar-driven; counts toward the **one prompt per day** cap (F93).

### Tier 3 · Do not build **[D]**

| Idea | Why |
| --- | --- |
| Daily “how are you doing?” mood check | Measures mood, not competence; confuses the product’s thesis |
| Streak-loss warnings | Controlling; [08](08-motivation.md) |
| XP, leagues, “you’re behind others” | [10](10-antipatterns.md) |
| Generic motivational quotes | Zero information; trains mute |
| Nightly “you forgot to practise” | Ought-to mechanic ([16](16-further-findings.md), W4) |
| Separate notification per learning language | UC-025 rejection |
| AI-generated weekly essay | Hard to make derivable; violates UC-004 “opens into data” |

---

## Design rules (checklist)

Before any notification or weekly block ships:

1. **Informational?** Describes state, not duty.
2. **Derivable?** Tapping opens the exact rows/log lines that produced the claim.
3. **New this period?** Weekly content has at least one non-repeatable sentence.
4. **Capped?** At most one proactive prompt per day (same cap as UC-051 / F93).
5. **Opt-in for outbound?** Push/email off by default; in-app surfaces on by
   default only where the learner already navigates.
6. **Break-safe?** Respect pause mode with zero exceptions.
7. **Language-neutral account?** One digest per account, active language named
   inside — not one ping per language.

---

## Example copy (good vs bad)

**Good — operational (F74)**

> 9 reviews due · about 4 minutes.  
> [Start]

**Good — weekly reflection (F76)**

> This week 28 words moved from shaky to held. Listening improved most — almost
> all of it from the two methods sessions you tagged as sharp. *Ser* and *estar*
> are still alternating; contrast practice would be the highest lever.  
> [See the words]

**Good — honest idle week**

> You did not review this week. Nothing changed in your measured vocabulary —
> that is expected. The queue will be larger when you return; the schedule is
> unchanged.  
> [Review horizon]

**Bad**

> 🔥 Don’t lose your streak!  
> You’re doing great — keep it up!  
> You haven’t opened the app in 3 days.  
> You are 62 % to B1!

---

## Open questions

1. **Channel priority:** email vs web push vs PWA — depends on install pattern;
   study does not pick a winner yet.
2. **Generation:** template-from-metrics vs light NLG — templates are easier to
   make derivable; NLG needs guardrails so every clause cites a metric id.
3. **Locale:** reflections ship in the learner’s **spoken language** (UC-069) once
   i18n stage 1 lands — until then English only, noted in spec.
4. **Measurement:** primary metric is not open rate but **“opened derivation”**
   rate — did they click through to the data behind the sentence?

---

## Product sentence **[D]**

Sprachenlernen should offer **one optional operational reminder** and **one
weekly competence narrative**, both informational, both derivable, both capped —
and should treat push as a **mirror** of what is already true in the app, not a
separate product trying to pull the user back.

That is aligned with thesis 1 ([08](08-motivation.md)): optimise for measured
competence, not daily return. Notifications are allowed only where they make
competence more visible, not where they manufacture guilt.
