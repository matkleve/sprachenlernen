# UC-029 — Read a text I brought myself

<!-- id: UC-029 -->
<!-- specs: SPEC-feature-content-traceability, SPEC-feature-method-material-setup, SPEC-service-content-ingestion, SPEC-service-content-adaptation -->

**Who:** anyone holding a text in the target language they actually need or want
to read — an article, a letter, a contract, a chapter.
**Wants to:** read it with the same support the app gives its own texts — and
optionally **have it adapted to their level**.
**So that:** the app helps with real life instead of only with its own material.

Derived from [`../study/17-own-content.md`](../study/17-own-content.md),
[`../study/48-content-licensing-and-adaptation.md`](../study/48-content-licensing-and-adaptation.md).

## Success looks like

- A text can be added by file, paste or link, and is treated like any other
  Source: coverage shown before opening, tap a word for meaning in context,
  tap a sentence for a translation, unknown words offered as cards.
- Intake follows **learner-private lane** — [`content-ingestion.md`](../specs/service/content-ingestion.md):
  not republished to other users; paywall fetch fails honestly.
- Optional **adapt to my level** (UC-030) runs only after **explicit consent** to
  cloud/LLM processing; adapted copy stays on the account.
- The coverage figure appears **before** the learner starts on the **full text**.
- The text stays on the learner's device unless they choose otherwise, and where
  it is processed is stated rather than assumed. An uploaded text may be a
  medical letter.
- Reading time and words per minute are recorded the same way as for supplied
  texts, and count toward the reading skill.
- The text can be kept, so its coverage is recomputed as the learner improves
  (UC-033).

## Out of scope

OCR of photographed pages, sharing uploaded texts with anyone, and building a
library of other people's uploads.
