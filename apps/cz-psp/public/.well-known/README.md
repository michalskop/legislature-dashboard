# /.well-known — ownership map

Files here are served at `snemovna.datatimes.cz/.well-known/` and are
**root-domain discovery files** — they describe the whole site and its
subsystems to AI agents and browsers.

## Ownership

| Path | Owner | Notes |
|------|-------|-------|
| `agent-skills/` | legislature-dashboard | Skills for snemovna.datatimes.cz |
| `mcp/server-card.json` | legislature-dashboard | MCP card (SEP-1649 path). Describes Sněmovna Digest. Do NOT copy to digest project. |
| `api-catalog` | legislature-dashboard | RFC 9727 API catalog. References digest endpoints. Do NOT copy to digest project. |

## Digest project (web/)

The digest (`snemovna.datatimes.cz/digest`) has its own `web/public/.well-known/`
which is served under `/digest/.well-known/` — a different URL namespace.
Those files serve digest-scoped discovery and do not conflict with files here.

The old `mcp-server-card.json` at `/digest/.well-known/mcp-server-card.json` is
kept for backward compatibility but the canonical root-domain path is
`/.well-known/mcp/server-card.json` (this file).
