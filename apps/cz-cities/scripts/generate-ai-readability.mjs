import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const publicDir = path.join(appRoot, "public");

// PLACEHOLDER site URL — no real deployment yet (task A4); mesta.datatimes.cz/<city>
// is the eventual shape per plan.md D1.
const baseUrl = "https://mesta.datatimes.cz";

// Real Praha data (task A2) lives under src/fixtures/<citySlug>/... — mirrors
// src/lib/data.ts's fixture layout. Only "praha" is configured for now (see
// src/lib/city.config.ts); this script has no independent city list — it
// derives one from src/fixtures/ so it stays honest if a fixture ever exists
// without an entry in city.config.ts, or vice versa (a warning, not a crash).
const fixturesRoot = path.join(appRoot, "src", "fixtures");
const CITY_SLUGS = ["praha"];

// Languages this script builds sitemap/llms.txt URLs for — mirrors
// src/lib/i18n.ts's LANG_CODES. Duplicated as a plain array here because this
// script runs standalone via Node (not through the Next.js/TS build), so it
// can't import src/lib/i18n.ts directly without a TS loader; keeping it a
// one-line array keeps the duplication obvious and cheap to keep in sync.
const LANG_CODES = ["cs", "en"];
const DEFAULT_LANG = "cs";

function cityBasePath(lang, citySlug) {
  return lang === DEFAULT_LANG ? `/${citySlug}` : `/${lang}/${citySlug}`;
}

const generatedAt = new Date().toISOString().slice(0, 10);

function personSlug(id) {
  return id.split(":").at(-1);
}

function groupSlug(id) {
  return id.split(":").at(-1);
}

async function fetchAnalysisJson(citySlug, pathname) {
  const text = await readFile(path.join(fixturesRoot, citySlug, "analyses", pathname), "utf-8");
  return JSON.parse(text.replace(/:\s*NaN/g, ": null"));
}

// Minimal RFC 4180 CSV parser — deliberately duplicated from src/lib/csv.ts's
// parseCsv() rather than imported, because this script runs as plain Node
// ESM (prebuild hook, see package.json) without a TS loader. Needed for
// correctness, not just style: organization names legally contain commas
// (e.g. "SPD,Trik.,PES a nez. pro Prahu" in src/fixtures/praha/data/
// organizations.csv) — a naive `line.split(",")` misaligns every column
// after the first comma in such a row.
function parseCsv(text) {
  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.length > 1 || row[0] !== "") rows.push(row);
  }

  if (rows.length === 0) return [];
  const header = rows[0];
  return rows.slice(1).map((cols) => Object.fromEntries(header.map((h, i) => [h, cols[i] ?? ""])));
}

async function readCityCsv(citySlug, table) {
  const text = await readFile(path.join(fixturesRoot, citySlug, "data", `${table}.csv`), "utf-8");
  return parseCsv(text);
}

async function getCityDashboardData(citySlug) {
  try {
    const [organizations, memberships, attendance] = await Promise.all([
      readCityCsv(citySlug, "organizations"),
      readCityCsv(citySlug, "memberships"),
      fetchAnalysisJson(citySlug, "attendance/outputs/attendance.json"),
    ]);

    const candidateListIds = new Set(
      organizations.filter((o) => o.classification === "candidate_list").map((o) => o.id),
    );
    const currentGroupIds = new Set(
      memberships
        .filter((m) => !m.end_date && candidateListIds.has(m.organization_id))
        .map((m) => m.organization_id),
    );
    const orgById = new Map(organizations.map((o) => [o.id, o]));
    const groups = Array.from(currentGroupIds).map((id) => ({ id, name: orgById.get(id)?.name ?? id }));

    const members = attendance.map((a) => ({ id: a.person_id, name: a.name }));

    return { members, groups };
  } catch (error) {
    console.warn(`[ai-readability] Could not read fixtures for ${citySlug}: ${error.message}`);
    return { members: [], groups: [] };
  }
}

function absolute(pathname) {
  return `${baseUrl}${pathname}`;
}

function xmlEscape(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function sha256(content) {
  return `sha256:${createHash("sha256").update(content).digest("hex")}`;
}

function buildRobotsTxt() {
  return `# General rules for all bots
User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml

# AI-specific crawlers are welcome to use public pages as grounding input.
User-agent: GPTBot
User-agent: ChatGPT-User
User-agent: CCBot
User-agent: anthropic-ai
User-agent: Claude-Web
User-agent: ClaudeBot
User-agent: Google-Extended
User-agent: PerplexityBot
User-agent: Applebot-Extended
Allow: /

# Content Signals
Content-Signal: search=yes, ai-input=yes, ai-train=no
`;
}

function buildSitemap(perCity) {
  const routes = [];

  for (const lang of LANG_CODES) {
    routes.push({ path: lang === DEFAULT_LANG ? "/" : `/${lang}`, priority: "1.0", changefreq: "daily" });
    routes.push({ path: `${lang === DEFAULT_LANG ? "" : `/${lang}`}/about`, priority: "0.5", changefreq: "monthly" });

    for (const [citySlug, data] of Object.entries(perCity)) {
      const base = cityBasePath(lang, citySlug);
      routes.push({ path: base, priority: "1.0", changefreq: "hourly" });
      routes.push({ path: `${base}/members`, priority: "0.9", changefreq: "hourly" });
      routes.push({ path: `${base}/groups`, priority: "0.8", changefreq: "hourly" });
      for (const member of data.members) {
        routes.push({ path: `${base}/member/${personSlug(member.id)}`, priority: "0.7", changefreq: "hourly" });
      }
      for (const group of data.groups) {
        routes.push({ path: `${base}/group/${groupSlug(group.id)}`, priority: "0.7", changefreq: "hourly" });
      }
    }
  }

  const urls = routes
    .map(
      (route) => `  <url>
    <loc>${xmlEscape(absolute(route.path))}</loc>
    <lastmod>${generatedAt}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function buildLlmsTxt(perCity) {
  const cityLines = Object.entries(perCity)
    .map(([citySlug, data]) => {
      const base = cityBasePath(DEFAULT_LANG, citySlug);
      const listedMembers = data.members.slice(0, 20);
      const listedGroups = data.groups.slice(0, 10);
      return `### ${citySlug}
${baseUrl}${base}
${data.members.length} assembly members, ${data.groups.length} groups (2022-2026 term).

Groups: ${listedGroups.map((g) => g.name).join(", ") || "none yet"}
Sample assembly members: ${listedMembers.map((m) => m.name).join(", ") || "none yet"}`;
    })
    .join("\n\n");

  return `# Města.DataTimes.cz

> Open dashboard of roll-call voting behaviour in Czech municipal (city) assemblies.

## About

Města.DataTimes.cz analyses attendance, rebelliousness, coalition alignment, and voting positions
(WPCA) in Czech municipal assemblies, derived from each city's own roll-call vote data. Currently
covers: ${Object.keys(perCity).join(", ") || "none yet"}. More cities are added over time — see
DIVERGENCE.md in the app repository for the current rollout status.

- Web: ${baseUrl}
- Languages: Czech (unprefixed URLs) and English (/en/... URLs), more may be added
- Update model: nightly data pipeline (scrape -> standardize -> validate -> analyse -> publish),
  dashboard revalidates on a schedule
- Generated: ${generatedAt}

## Cities

${cityLines || "No city is published yet."}

## Data And Methods

- Attendance: share of roll-call voting events where an assembly member was present
- Rebelliousness: share of votes cast against the assembly member's own group where comparison is possible
- Coalition alignment: share of votes matching the governing coalition where comparison is possible
- WPCA positions: two-dimensional map derived from voting patterns

## Machine-Readable Discovery

- Sitemap: ${baseUrl}/sitemap.xml
- Robots and content signals: ${baseUrl}/robots.txt
- Agent skills: ${baseUrl}/.well-known/agent-skills/index.json
- Markdown overview: ${baseUrl}/index.md
- Markdown about page: ${baseUrl}/about.md

## Citation Guidance

Prefer the specific city/member/group detail page over the homepage when citing a fact.
`;
}

function buildMarkdownFiles(perCity) {
  const cityList = Object.keys(perCity)
    .map((citySlug) => `- [${citySlug}](${baseUrl}${cityBasePath(DEFAULT_LANG, citySlug)})`)
    .join("\n") || "- No city is published yet.";

  return {
    "index.md": `# Města.DataTimes.cz

Open dashboard of Czech municipal assembly roll-call votes.

## Cities

${cityList}

## Analyses

- Attendance on voting events.
- Rebelliousness against the assembly member's own group.
- Alignment with the governing coalition.
- WPCA voting-position map.

Generated: ${generatedAt}
`,
    "about.md": `# About Města.DataTimes.cz

Města.DataTimes.cz is an open dashboard for analysing activity and roll-call voting behaviour in
Czech municipal (city) assemblies.

Machine-readable discovery files are available at ${baseUrl}/llms.txt, ${baseUrl}/sitemap.xml, and
${baseUrl}/.well-known/agent-skills/index.json.
`,
  };
}

function buildSkillFiles(perCity) {
  const cities = Object.keys(perCity).join(", ") || "none yet";

  const dashboardSkill = `---
name: city-assembly-dashboard
description: Discover public dashboard pages and metrics for Czech municipal assembly roll-call votes on Města.DataTimes.cz.
---

# City Assembly Dashboard

## Overview

Use this skill to discover public pages, dashboard sections, and machine-readable summaries for
Města.DataTimes.cz. Currently covers: ${cities}.

## Content Categories

### Overview
- URL: ${baseUrl}/
- Description: List of covered cities, each linking to its own dashboard.

### Assembly members (per city)
- URL pattern: ${baseUrl}/<city>/members
- Description: Assembly member-level metrics and links to detail pages.

### Council Groups (per city)
- URL pattern: ${baseUrl}/<city>/groups
- Description: Group-level aggregate metrics and member lists.

## Key Topics

- Czech municipal assembly
- assembly members
- council groups
- attendance
- voting behaviour
- coalition alignment
- WPCA voting-position analysis

## Discovery

- Full content index: ${baseUrl}/llms.txt
- Sitemap: ${baseUrl}/sitemap.xml
`;

  const datasetSkill = `---
name: city-assembly-datasets
description: Discover source data categories and derived analysis outputs used by Města.DataTimes.cz.
---

# City Assembly Datasets

## Overview

Use this skill to understand the main derived data categories used by Města.DataTimes.cz. Each
city's dashboard is derived from that city's own published roll-call vote data (see each city's
"About" section for its specific data source).

## Data Categories

### Attendance
- Description: Assembly member attendance shares across roll-call voting events.

### Rebelliousness
- Description: Votes against the assembly member's own group where comparable.

### Coalition Alignment
- Description: Agreement with the governing coalition.

### Voting Positions (WPCA)
- Description: Two-dimensional voting-position map derived from roll-call votes.

## Discovery

- Full content index: ${baseUrl}/llms.txt
- Sitemap: ${baseUrl}/sitemap.xml
`;

  const skills = [
    {
      name: "city-assembly-dashboard",
      type: "skill-md",
      description: "Discover public dashboard pages and metrics for Města.DataTimes.cz.",
      url: "/.well-known/agent-skills/city-assembly-dashboard/SKILL.md",
      content: dashboardSkill,
    },
    {
      name: "city-assembly-datasets",
      type: "skill-md",
      description: "Discover source data categories and derived analysis outputs used by Města.DataTimes.cz.",
      url: "/.well-known/agent-skills/city-assembly-datasets/SKILL.md",
      content: datasetSkill,
    },
  ];

  const index = {
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills: skills.map(({ name, type, description, url, content }) => ({
      name,
      type,
      description,
      url,
      digest: sha256(content),
    })),
  };

  return { skills, index };
}

async function writeGeneratedFile(relativePath, content) {
  const fullPath = path.join(publicDir, relativePath);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, content, "utf8");
}

async function main() {
  const perCity = {};
  for (const citySlug of CITY_SLUGS) {
    perCity[citySlug] = await getCityDashboardData(citySlug);
  }

  const markdownFiles = buildMarkdownFiles(perCity);
  const { skills, index } = buildSkillFiles(perCity);

  await mkdir(publicDir, { recursive: true });

  await Promise.all([
    writeGeneratedFile("robots.txt", buildRobotsTxt()),
    writeGeneratedFile("sitemap.xml", buildSitemap(perCity)),
    writeGeneratedFile("llms.txt", buildLlmsTxt(perCity)),
    ...Object.entries(markdownFiles).map(([filename, content]) =>
      writeGeneratedFile(filename, content),
    ),
    writeGeneratedFile(".well-known/agent-skills/index.json", `${JSON.stringify(index, null, 2)}\n`),
    ...skills.map((skill) =>
      writeGeneratedFile(`.well-known/agent-skills/${skill.name}/SKILL.md`, skill.content),
    ),
  ]);

  const totalMembers = Object.values(perCity).reduce((n, d) => n + d.members.length, 0);
  const totalGroups = Object.values(perCity).reduce((n, d) => n + d.groups.length, 0);
  console.log(
    `[ai-readability] Generated files for ${Object.keys(perCity).length} cities (${totalMembers} members, ${totalGroups} groups) in ${path.relative(process.cwd(), publicDir)}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
