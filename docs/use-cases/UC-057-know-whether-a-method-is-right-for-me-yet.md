# UC-057 — Know whether a method is right for me *yet*

<!-- id: UC-057 -->
<!-- specs: SPEC-service-method-implementation-maturity -->

**Who:** a learner looking at a method they have not done before, or one they
have not done in months.
**Wants to:** find out whether it will work at their current standing, before
spending twelve minutes finding out the hard way.
**So that:** the catalogue reads as guidance rather than as a wall of equally
plausible options.

**Not the same as implementation maturity (I0–I4).** Readiness is learner ↔
material fit (**I3** when adaptive compose ships). I-tier measures whether the
app implements the Method well — see
[`method-implementation-maturity.md`](../specs/service/method-implementation-maturity.md).

Derived from
[`../study/21-method-catalogue-and-context.md`](../study/21-method-catalogue-and-context.md)
(context filters first) and
[`../study/03-level-model.md`](../study/03-level-model.md) (form mastery as its
own signal). The distinction it rests on is a **[D — user decision, 2026-08-08]**:
readiness may inform and demote, never hide and never gate.

## Today

Every method looks equally available, so the learner discovers unsuitability by
failing. A reading exercise at 70 % coverage is not practice, it is decoding with
a dictionary; a mixed paradigm drill for someone holding four verbs has nothing
to mix. Apps that do address this address it with locks — content behind a level
gate — which trades one bad state for a worse one.

## Success looks like

- A method carries one of three readiness states, and the state is a fact about
  **what the app can currently build**, never a judgement of the learner:
  **ready** · **better later** · **no material yet**.
- "Better later" shows one line naming what would make it work, drawn from the
  learner's own holdings — not a level, not a percentage of a curriculum.
- "Better later" is fully startable. See UC-058.
- The reason is phrased as the limit of the app's knowledge or stock. "This works
  better once more of your plural forms are stable" — never "locked", never
  "you need", never a threshold presented as a requirement.
- Readiness demotes a method's position; it never removes it from the catalogue
  and never shortens the list the learner can browse (UC-046).
- A method whose readiness the app cannot judge — the whole off-app half of the
  catalogue, permanently — says nothing at all rather than showing an empty or
  pending readiness state.
- The state is recomputed from current holdings, so it changes on its own as the
  learner progresses, and the learner can see that it changed.

## Out of scope

Hiding, greying out or ordering methods into a curriculum; readiness for methods
the app does not run; and any per-card admission of absence — an absence is
stated once, at the level where it is true, never sixty times.

## Undecided

- **⚠ SPEC GAP: may a "better later" method occupy one of the three daily menu
  slots**, or does it appear only in the full catalogue? Three slots are scarce
  and one is reserved for high measured effect
  ([12](../study/12-method-cards.md)); spending one on something the app just
  said works better later is a real cost, and keeping it out makes the guidance
  invisible to anyone who never browses.
- **⚠ SPEC GAP: what quantity readiness is computed from, per method.** Coverage
  over lemmas, coverage over forms, stable paradigm cells, FSRS recall
  probability, or a count of holdings — each gives a different answer, and the
  lexicon spec already flags that mastery over an incomplete paradigm is
  undefined. No threshold may be written until this is chosen.
