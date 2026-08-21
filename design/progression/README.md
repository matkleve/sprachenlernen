# Progression reference board (normative)

**Contract:** [`docs/specs/feature/progression-reference-board.md`](../docs/specs/feature/progression-reference-board.md)

Place the owner-supplied nine-column board here:

```
design/progression/reference-board.png   ← full board (required)
design/progression/stage-01.png … stage-09.png   ← optional crops
```

After commit, sync crops used at runtime to `public/design/progression/` if the
dev pages display them beside `/dev/progression`.

Agents must not invent materials when this file is missing — emit
`⚠ SPEC GAP: commit design/progression/reference-board.png` and stop.
