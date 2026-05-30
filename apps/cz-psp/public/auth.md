# Authentication — Sněmovna.DataTimes.cz

## No authentication required

All data on this site and the Sněmovna Digest is **publicly accessible**.  
No API key, registration, token, or credentials are needed.

## Publicly available endpoints

| Endpoint | Description |
|----------|-------------|
| `https://snemovna.datatimes.cz/digest/events` | Browsable event list |
| `https://snemovna.datatimes.cz/digest/events/{id}` | Full event summary page |
| `https://snemovna.datatimes.cz/digest/api/events.json` | Machine-readable event index (JSON) |
| `https://snemovna.datatimes.cz/digest/summary.schema.json` | JSON schema for event summaries |
| `https://snemovna.datatimes.cz/digest/llms.txt` | LLM-readable site description |
| `https://snemovna.datatimes.cz/digest/SKILL.md` | Agent skill reference |
| `https://snemovna.datatimes.cz/.well-known/mcp/server-card.json` | MCP server card |
| `https://snemovna.datatimes.cz/.well-known/api-catalog` | RFC 9727 API catalog |

## Agent access

AI agents may freely crawl, index, and query all content.  
See `/digest/llms.txt` for a structured site description, and `/digest/SKILL.md` for data format details.

No rate limiting is currently applied. Please be reasonable with request frequency.

## Contact

Questions or issues: datatimes@kohovolit.eu  
Publisher: DataTimes / Mahdalová & Škop, Prague, Czech Republic
