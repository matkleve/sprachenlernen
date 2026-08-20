# UC-030 — Make a text I care about readable, without gutting it

<!-- id: UC-030 -->
<!-- specs: SPEC-feature-method-material-setup, SPEC-feature-content-traceability, SPEC-service-content-ingestion, SPEC-service-content-adaptation -->
<!-- status: active — revised 2026-08-20 -->

**Who:** a learner facing a text that matters to them — especially **news and
topic content** (politics, daily life) — above their current coverage.
**Wants to:** read or hear it **at their target level** (e.g. A2), not struggle
through raw feed text or receive a random excerpt.
**So that:** current topics feel reachable, not like a textbook from ten years ago.

Derived from [`../study/17-own-content.md`](../study/17-own-content.md).
**Owner revision 2026-08-20:** level-targeted adaptation is the **primary** path
for catalogue topic content — see [`../study/46-method-length-and-level-matched-content.md`](../study/46-method-length-and-level-matched-content.md),
[`../study/48-content-licensing-and-adaptation.md`](../study/48-content-licensing-and-adaptation.md),
[`../IDEAS.md`](../IDEAS.md) § 2026-08-20 stories 3 and 5.

## Today

Either struggle at low coverage, or receive a support ladder whose rewrite rung
was ranked last. Topic news is not offered at a named learner level.

## Success looks like

- For **catalogue topic content** (news, politics, daily): tapping a topic
  offers material **adapted to the learner's target level** (e.g. *"Politik ·
  adapted for A2"*) — full article in session, not a time-window cut.
- Adaptation is **labelled** (*adapted for you*, *generated*) — never presented
  as the original front-page article.
- Coverage on the **adapted** text is shown before Start (target 95–98 %).
- Catalogue topic content is ingested only via **licence-cleared or generated**
  lanes ([`content-ingestion.md`](../specs/service/content-ingestion.md)); LLM
  adaptation is **cached per article and level band**
  ([`content-adaptation.md`](../specs/service/content-adaptation.md)).
- For **learner-uploaded** originals (UC-029): adaptation runs only with explicit
  consent to processing; the original remains available.
- Optional **support rungs** (pre-teach, gloss, paraphrase beside original) remain
  for uploads the learner wants to read **unadapted** — ladder order unchanged
  for that path.
- The learner reads the **whole** adapted article in one session (UC-007); menu
  time filter uses estimated read time of the full piece.

## Out of scope

Treating adapted news as equivalent to authentic extensive-reading signals on
Progress without a separate signal label; adapting without marking generated
content; truncating articles to fit a duration window.

## Undecided

- **⚠ SPEC GAP:** target level source — learner-chosen CEFR band, inferred skill
  tier, or coverage-only band?
- **⚠ SPEC GAP:** refresh cadence for daily news adaptations.
