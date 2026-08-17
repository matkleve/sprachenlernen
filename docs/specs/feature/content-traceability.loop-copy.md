# Content traceability — loop copy

Split child of [`content-traceability.md`](content-traceability.md). One
forward-pointing line per surface. Keys in `messages/en.json` and
`messages/de.json` under `contentTrace.*` (German mirrors the same paths).

| Surface | EN key | EN template (representative) |
| --- | --- | --- |
| Word trace block | `contentTrace.word.next` | "Appears in {count, plural, one {# source} other {# sources}} — see what it unlocks" |
| Source detail (comfortable) | `contentTrace.source.comfortable` | "At {pct} % — comfortable to read. Words you learn next show up here." |
| Source detail (demanding) | `contentTrace.source.demanding` | "{gapCount} words stand between you and comfortable — learn them as a set?" |
| Source detail (history) | `contentTrace.source.unlocked` | "Was {before} % on {date}; now {after} %" |
| Session complete | `contentTrace.session.next` | "{heldCount} words became stable — see what moved on your map" |
| Sources home (K2 rollup) | `contentTrace.library.month` | "This month {count} items moved to comfortable" |
