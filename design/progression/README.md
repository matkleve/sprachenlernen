# Progression reference board (normative)

**Wood synthesis findings (2026-08-22):** [`WOOD-SYNTHESIS-FINDINGS.md`](WOOD-SYNTHESIS-FINDINGS.md) —
what worked, what failed, artifact paths, and app vs lab boundaries.

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
