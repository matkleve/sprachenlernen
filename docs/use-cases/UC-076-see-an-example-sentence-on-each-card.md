# UC-076 — See an example sentence on each card I can mostly understand

<!-- id: UC-076 -->
<!-- specs: SPEC-feature-card-example-sentence -->

**Who:** a learner reviewing vocabulary who already knows most of the pool but
still needs context — not an isolated lemma floating in space.
**Wants to:** see a real sentence on each card where they understand roughly
nine out of ten words, so the target word lands in usage they can follow.
**So that:** recall is tied to meaning-in-context, not a dictionary line alone.

Derived from [`../study/STUDY-018-speaking-and-sentences.md`](../study/STUDY-018-speaking-and-sentences.md),
[`UC-050`](UC-050-see-that-i-can-already-read-this.md) (comprehension check on
methods), and [`UC-007`](UC-007-read-something-at-my-level.md) (coverage bands).

## Today

- Review cards show **lemma + gloss only** — no sentence ([`review-session.md`](../specs/feature/review-session.md)).
- [`demonstration-sentence.md`](../specs/feature/demonstration-sentence.md) puts
  one sentence on `/methods`, not in review; grades do not schedule FSRS.
- Coverage math exists ([`coverage.md`](../specs/service/coverage.md)) but is
  not wired to card faces.
- Sentence translations in the demonstration bank are **English only**.

## Success looks like

- Each meaning-recall card in a session can show **one** target-language
  sentence that contains the lemma (or a close form).
- The sentence is chosen so **coverage** over the learner's held lemmas falls
  in the **comfortable** band (95–98%) when possible — slightly above is
  acceptable when nothing in-band exists; far harder text is rejected.
- The sentence stays on the card when flipped; the gloss still appears in the
  **spoken language** ([`UC-069`](UC-069-use-the-app-in-my-own-language.md)).
- No sentence qualifies → card looks exactly as today (lemma only) — no error,
  no “missing content” shame state.
- Same `taskId` in one session → same sentence (stable pick); progress and
  scheduling unchanged.

## Out of scope

- Form-recall cards showing example sentences in v1.
- Generating new sentences with AI at runtime.
- Scheduling or grading the sentence separately from the lemma card.
- Full-sentence translation exercises (reading runner — UC-007 remainder).
