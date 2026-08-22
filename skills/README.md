# Agent skills

Tool-specific skill files for coding agents. **`AGENTS.md` at the repo root is
the contract for every tool** — these skills are optional SOPs for deeper tasks.

| Location | Tools | Contents |
| --- | --- | --- |
| [`.claude/skills/`](../.claude/skills/) | Claude Code | `implement`, `ship`, `specify` workflows |
| [`.agents/skills/`](../.agents/skills/) | Cursor / multi-agent | Supabase and Postgres best practices |
| [`.cursor/mcp.json`](../.cursor/mcp.json) | Cursor | Supabase MCP server config |

When a skill and `AGENTS.md` disagree, **`AGENTS.md` wins**.

Quick start for agents: [`docs/AGENT-START.md`](../docs/AGENT-START.md).
