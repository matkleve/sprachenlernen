# 54 · Context tags — methods, Words, and weighted sentences

**Status:** study only — implements [53](53-business-teacher-situational-model.md)
via **existing method machinery**, not card quotas.

**Owner question (2026-08-20):** Can we pass tags like **Business**, **Garten**,
**Natur**, **Politik** into methods so **Words and methods** more often show
matching words and sentences — **not all**, just **more likely**?

**Answer:** Yes. One shared **`LearnerContext`** (register + topics + optional
situation unit) flows into **session sampling**, **example-sentence picker**, and
**method runners**. Methods already have **`materialTopics`** chips; this extends
the same tag ids to **Sources**, **sentence bank**, and **lemma weights**.

---

## C0 · One context object — three consumers

```typescript
type LearnerContext = {
  register: "business" | "everyday" | "technical" | "general";
  topics: string[]; // e.g. ["sport", "politics", "nature"]
  situationUnit?: string; // e.g. "meetings" — from study 53 syllabus
};
```

| Consumer | What tags change | Hard filter? |
| --- | --- | --- |
| **Words / SRS** | Which **lemmas** get weight; which **example sentence** on card | **No** — weights only |
| **Methods with text** (reading, dictation) | Which **Source** is picked | Soft default; chips override |
| **Methods with prompts** (build-a-sentence, free production) | Prompt + target lemmas + model sentences | Soft bias |
| **Methods without material** (HVPT, srs-session) | Example sentence on card only (if any) | — |

**Default:** onboarding profile. **Override:** method-detail topic chip (already
in [`method-material-setup.md`](../specs/feature/method-material-setup.md)).

---

## C1 · Tag vocabulary (shared ids)

Two **namespaces** — same strings everywhere:

### Register (path)

| id | Learner-facing |
| --- | --- |
| `register:business` | Business |
| `register:everyday` | Alltag |
| `register:technical` | Technik |
| `register:general` | neutral / glue |

### Topic (interest + method chips)

| id | Examples |
| --- | --- |
| `topic:news` | already on `extensive-reading` |
| `topic:daily` | already shipped |
| `topic:politics` | Politik |
| `topic:nature` | Natur, Garten |
| `topic:sport` | Sport |
| `topic:economy` | Wirtschaft |
| `topic:environment` | already on reading pool |
| … | extend catalogue + onboarding chips together |

**Rule:** `materialTopics[].id` on a method **must** use `topic:*` ids that exist
on Sources and sentence-bank rows. No second naming scheme.

Optional v2: `situation:meetings`, `situation:email` for study 53 units.

---

## C2 · Weight function (not all, not fixed count)

For any candidate (lemma, sentence, Source, prompt):

```
score = coverageFit × registerWeight × topicWeight × randomNoise
```

| Factor | Match | Neutral | Mismatch |
| --- | --- | --- | --- |
| **registerWeight** | **3.0** | 1.0 (untagged or `general`) | **0.4** (still possible) |
| **topicWeight** | **2.5** per matching topic (cap 1) | 1.0 | 0.5 |

- **coverageFit** — existing 95–98 % band ([`coverage.md`](../specs/service/coverage.md));
  never pick unreadable text for a tag.
- **randomNoise** — small jitter so the same tag doesn't always win.
- **No candidate gets weight 0** unless coverage rejects it — owner: *not all*.

Example: Business + `topic:nature` learner reviewing *agua*:

- Sentence *El equipo riega las plantas del jardín.* — register everyday, topic nature → **medium**
- Sentence *Regamos el presupuesto del proyecto.* — business register → **high** (register match)
- Sentence *Necesito agua.* — neutral → **baseline**

All three can appear over time; business/nature **more often**.

---

## C3 · Words — what changes

### C3a · Session sampling ([`session-sampling.md`](../specs/service/session-sampling.md))

Add factor **`rᵢ`** to weight formula:

```
wᵢ = uᵢ × bᵢ × nᵢ × fᵢ × rᵢ × tᵢ
```

- `rᵢ` — register match for lemma / situation unit  
- `tᵢ` — topic relevance (lemma appears in tagged sentences for learner topics)  

Still **probabilistic** — no hard “3 business cards.” A **Meetings** week naturally
draws more meeting lemmas because their **situation unit** boosts them.

### C3b · Example sentences on cards ([`card-example-sentence.md`](../specs/feature/card-example-sentence.md))

Sentence bank row:

```json
{
  "id": "es:reunion:001",
  "lemma": "reunión",
  "text": "La reunión empieza a las nueve.",
  "tags": ["register:business", "situation:meetings", "topic:economy"]
}
```

Picker ([`card-example-sentence.md`](../specs/feature/card-example-sentence.md)):

1. Candidates for lemma  
2. Filter by coverage band  
3. **Score by register + topic weights**  
4. Weighted random pick (stable per session)  

**More sentences in register** = richer bank per lemma per tag — not “show 5
sentences on one card.” One sentence on card; **across sessions** different
business sentences for the same lemma.

---

## C4 · Methods — who gets what

| Method | Tags affect | Sentences / material |
| --- | --- | --- |
| **`srs-session`** (Words) | `rᵢ`, `tᵢ`, example sentence | 1 example sentence per card (UC-076) |
| **`build-a-sentence`** | Target word + **prompt line** from `situation:*` | Show **1 model sentence** in register; learner writes another |
| **`free-production`** | Prompt from situation unit + register | Optional 2–3 phrase hints (chunks), not all business |
| **`extensive-reading`** | **Source** pick via tags + chips | Full article ([UC-007](../use-cases/UC-007-read-something-at-my-level.md)) |
| **`narrow-reading`** | Topic chip **required** — ideal for `topic:nature` etc. | 4–6 texts same topic |
| **`intensive-reading`** | Source tags | Shorter text |
| **`partial-dictation`** | Audio Source tags | Passage from tagged catalogue |
| **`4-3-2` / shadowing** | Passage from tagged Source or sentence list | Multiple sentences from **one** tagged passage |
| **`demonstration-sentence`** (Home) | Register + topic | One sentence — weighted pick |
| **HVPT, commitments** | No tag surface v1 | — |

### C4a · Passing context into a method run

**Server-side default** (preferred):

```typescript
const ctx = loadLearnerContext(userId, languageCode);
// method detail chip may narrow ctx.topics to [selectedChip]
buildPracticeSession(methodId, ctx, resolvedSource);
```

**URL params** (existing pattern for `method`, `minutes`):

```
/practice?method=build-a-sentence&topic=politics
```

Chip selection **merges** with profile: `effectiveTopics = chip ?? profile.topics`.

### C4b · Build-a-sentence (concrete)

Today: random held lemma. **With context:**

1. Weight lemmas toward **current situation unit** + register  
2. Prompt: *"Schreib einen Satz nach dem Meeting — höflich nachfassen."*  
3. Model sentence (read-only): one tagged example  
4. Learner produces **one** sentence — graded on lemma use, not register purity  

Not all words in the batch are business — weighted pool from held + situation gaps.

### C4c · Reading / news

Already designed: Source `tags[]` ↔ `materialTopics` chips ([`content-traceability.md`](../specs/feature/content-traceability.md)).

**Add:** `register:*` on Source metadata. Filter:

```
sources where tag matches effectiveTopics AND (register matches OR register:general)
order by score × coverageFit
```

Onboarding **Politik + Natur** → **App picks** on extensive reading prefers
politics or nature articles **more often**, not exclusively.

---

## C5 · Method catalogue changes (data only)

Extend `data/methods/*.json`:

```json
"materialTopics": [
  { "id": "politics", "labelKey": "topic.politics" },
  { "id": "nature", "labelKey": "topic.nature" }
],
"contextUses": ["register", "topic", "situation"]
```

`contextUses` documents which axes the runner reads (validator optional).

**Default chip on open:** `app-pick` uses **profile** context; learner can tap
**Politik** to force that topic for one session.

---

## C6 · What we do **not** do

| Anti-pattern | Why |
| --- | --- |
| Every sentence business when register=Business | Owner: *not all* |
| Fixed N tagged cards per session | Study 52 withdrawn |
| Tag without tagged content in bank | Honest fallback to neutral |
| Separate Business method fork | One catalogue, weighted material |
| Generate sentences at runtime v1 | [`card-example-sentence.md`](../specs/feature/card-example-sentence.md) — bank only |

---

## C7 · Implementation map

| Artefact | Change |
| --- | --- |
| `docs/specs/service/learner-context.md` | **New** — profile storage, weight table |
| `docs/specs/feature/card-example-sentence.md` | Add `tags[]` on bank rows + weighted pick |
| `docs/specs/service/session-sampling.md` | Add `rᵢ`, `tᵢ` factors |
| `docs/specs/feature/content-traceability.md` | Add `register` on Source |
| `docs/specs/feature/method-material-setup.md` | Profile default + chip override |
| `data/example-sentences/{lang}.json` | Tags per sentence |
| `data/content/*.json` | `register` + `tags` on catalogue |
| `lib/learner-context.ts` | Load + effective context merge |
| `lib/tag-weight.ts` | Shared `score()` |
| Method runners | Accept `LearnerContext` in session build |

**Slices:** T-W24 learner context + tag weights; T-W25 sentence bank tags; T-CI*
catalogue register tags.

---

## C8 · Owner question — direct answers

| Question | Answer |
| --- | --- |
| Welche Methoden? | Words (SRS + example sentence), build-a-sentence, free production, reading family, dictation, shadowing/4-3-2, demonstration sentence |
| Mehr Sätze in Methoden? | **Bank** grows per register/topic; each **card/run** still 1–3 sentences UI — **over time** more variety in your tags |
| Tag Business / Garten / Politik? | **Yes** — `register:*` + `topic:*` on profile, Sources, sentence bank |
| Höhere Wahrscheinlichkeit? | **Yes** — multiply weights, never 100 % |
| Alles getagged? | **No** — neutral content stays in pool at weight 1.0 |

---

## Sources

| | Claim | Grade |
| --- | --- | --- |
| ⬤ | Topic chips + Source tags already specified | [A] — study/37, content-traceability |
| ⬤ | Example sentence picker exists (UC-076 draft) | [A] — card-example-sentence |
| ⬤ | Session sampling is weighted, extensible | [A] — session-sampling draft |
| ⬤ | Weighted tag match, not exclusive filter | [D] — owner 2026-08-20 |
