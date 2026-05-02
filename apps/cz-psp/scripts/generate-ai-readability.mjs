import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const publicDir = path.join(appRoot, "public");
const skillsDir = path.join(publicDir, ".well-known", "agent-skills");

const baseUrl = "https://snemovna.datatimes.cz";
const dataBase =
  "https://raw.githubusercontent.com/michalskop/cz-psp-data-2025-202x/main/analyses";
const generatedAt = new Date().toISOString().slice(0, 10);

const staticRoutes = [
  { path: "/", priority: "1.0", changefreq: "hourly" },
  { path: "/members", priority: "0.9", changefreq: "hourly" },
  { path: "/groups", priority: "0.8", changefreq: "hourly" },
  { path: "/regions", priority: "0.8", changefreq: "hourly" },
  { path: "/about", priority: "0.6", changefreq: "monthly" },
];

function personSlug(id) {
  return id.split(":").at(-1);
}

function groupSlug(id) {
  return id.split(":").at(-1);
}

function constituencySlug(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function fetchJson(pathname) {
  const res = await fetch(`${dataBase}/${pathname}`);
  if (!res.ok) throw new Error(`Failed to fetch ${pathname}: ${res.status}`);
  const text = await res.text();
  return JSON.parse(text.replace(/:\s*NaN/g, ": null"));
}

async function getDashboardData() {
  try {
    const [members, groups] = await Promise.all([
      fetchJson("current-members/outputs/current_members.json"),
      fetchJson("current-groups/outputs/current_groups.json"),
    ]);

    const regionNames = Array.from(
      new Set(
        members
          .map((member) => member.memberships?.constituency?.[0]?.name)
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b, "cs"));

    return { members, groups, regionNames };
  } catch (error) {
    console.warn(`[ai-readability] Could not fetch live data: ${error.message}`);
    return { members: [], groups: [], regionNames: [] };
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

function buildSitemap({ members, groups, regionNames }) {
  const routes = [
    ...staticRoutes,
    ...members.map((member) => ({
      path: `/member/${personSlug(member.id)}`,
      priority: "0.7",
      changefreq: "hourly",
    })),
    ...groups.map((group) => ({
      path: `/group/${groupSlug(group.id)}`,
      priority: "0.7",
      changefreq: "hourly",
    })),
    ...regionNames.map((name) => ({
      path: `/region/${constituencySlug(name)}`,
      priority: "0.6",
      changefreq: "hourly",
    })),
  ];

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

function buildLlmsTxt({ members, groups, regionNames }) {
  const listedMembers = members.slice(0, 30);
  const listedGroups = groups.slice(0, 20);

  return `# Sněmovna.DataTimes.cz

> Public dashboard for activity, voting behaviour, attendance, party alignment, and parliamentary groups in the Czech Chamber of Deputies for the 2025-2029 term.

## About

Sněmovna.DataTimes.cz publishes structured, regularly updated analysis of the Czech Chamber of Deputies. The dashboard is designed for source-grounded references to MPs, parliamentary groups, regions, attendance, rebellious votes, government alignment, vote corrections, and voting-position analysis.

- Web: ${baseUrl}
- Data source: Chamber of Deputies of the Parliament of the Czech Republic and derived analyses from the cz-psp-data-2025-202x repository
- Languages: Czech primary UI, English labels where available
- Update model: source data is fetched by the Next.js app with hourly revalidation; this AI index is regenerated during build/data-update workflows
- Generated: ${generatedAt}

## Main Sections

### Overview
${baseUrl}/
Dashboard charts for attendance, voting positions, rebelliousness, and government alignment.

### MPs
${baseUrl}/members
Sortable table of MPs with attendance, rebelliousness, government alignment, and vote corrections.

### Parliamentary Groups
${baseUrl}/groups
Group-level pages with member counts and aggregate metrics.

### Regions
${baseUrl}/regions
Regional MP listings and aggregate metrics.

### About
${baseUrl}/about
Project context, data sources, and methodology notes.

## Data And Methods

- Attendance: share of roll-call voting events where an MP was present
- Rebelliousness: share of votes cast against the MP's own club where comparison is possible
- Government alignment: share of votes matching the governing coalition where comparison is possible
- Vote corrections: corrections announced or invalidated after voting
- WPCA positions: two-dimensional map derived from voting patterns

## Key Dynamic Pages

### Current Parliamentary Groups
${listedGroups.map((group) => `- ${baseUrl}/group/${groupSlug(group.id)} - ${group.name}`).join("\n") || "- Generated when live group data is available"}

### Regions
${regionNames.map((name) => `- ${baseUrl}/region/${constituencySlug(name)} - ${name}`).join("\n") || "- Generated when live region data is available"}

### Current MPs Sample
${listedMembers.map((member) => `- ${baseUrl}/member/${personSlug(member.id)} - ${member.name}`).join("\n") || "- Generated when live MP data is available"}

## Machine-Readable Discovery

- Sitemap: ${baseUrl}/sitemap.xml
- Robots and content signals: ${baseUrl}/robots.txt
- Agent skills: ${baseUrl}/.well-known/agent-skills/index.json
- Markdown overview: ${baseUrl}/index.md
- Markdown members guide: ${baseUrl}/members.md
- Markdown groups guide: ${baseUrl}/groups.md
- Markdown regions guide: ${baseUrl}/regions.md
- Markdown about page: ${baseUrl}/about.md

## Citation Guidance

When citing this dashboard, include the page URL and the date of access. For MP, group, and region metrics, prefer the specific detail page over the homepage.
`;
}

function buildMarkdownFiles() {
  return {
    "index.md": `# Sněmovna.DataTimes.cz

Dashboard for the Czech Chamber of Deputies 2025-2029 term.

## Main Views

- [MPs](${baseUrl}/members): sortable table of individual MP metrics.
- [Parliamentary groups](${baseUrl}/groups): party and club-level aggregate metrics.
- [Regions](${baseUrl}/regions): regional representation and aggregate metrics.
- [About](${baseUrl}/about): project context and data source notes.

## Analyses

- Attendance on voting events.
- Rebelliousness against the MP's own parliamentary group.
- Alignment with the governing coalition.
- Vote corrections.
- WPCA voting-position map.

Generated: ${generatedAt}
`,
    "members.md": `# MPs

Current and former MPs in the Czech Chamber of Deputies 2025-2029 dashboard.

The table at ${baseUrl}/members includes attendance, rebelliousness, government alignment, vote corrections, party/group, and current/former status.

Use individual pages at ${baseUrl}/member/{id} for source-specific references to one MP.
`,
    "groups.md": `# Parliamentary Groups

Parliamentary group overview for the Czech Chamber of Deputies 2025-2029 dashboard.

The list at ${baseUrl}/groups includes member counts and aggregate metrics for attendance, rebelliousness, and government alignment. Use ${baseUrl}/group/{id} for detail pages.
`,
    "regions.md": `# Regions

Regional MP overview for the Czech Chamber of Deputies 2025-2029 dashboard.

The list at ${baseUrl}/regions groups current MPs by constituency region and provides aggregate metrics where available. Use ${baseUrl}/region/{id} for region detail pages.
`,
    "about.md": `# About Sněmovna.DataTimes.cz

Sněmovna.DataTimes.cz is a public dashboard for analysing activity and voting behaviour in the Czech Chamber of Deputies.

The site uses public parliamentary data and derived analyses for attendance, rebelliousness, government alignment, vote corrections, and voting-position visualisation.

Machine-readable discovery files are available at ${baseUrl}/llms.txt, ${baseUrl}/sitemap.xml, and ${baseUrl}/.well-known/agent-skills/index.json.
`,
  };
}

function buildSkillFiles() {
  const dashboardSkill = `---
name: czech-chamber-dashboard
description: Discover public dashboard pages and metrics for the Czech Chamber of Deputies 2025-2029 term.
---

# Czech Chamber Dashboard

## Overview

Use this skill to discover public pages, dashboard sections, and machine-readable summaries for Sněmovna.DataTimes.cz.

## Content Categories

### Overview
- URL: ${baseUrl}/
- Description: Dashboard charts for MP attendance, voting positions, rebelliousness, and government alignment.

### MPs
- URL: ${baseUrl}/members
- Description: MP-level metrics and links to detail pages.

### Parliamentary Groups
- URL: ${baseUrl}/groups
- Description: Group-level aggregate metrics and member lists.

### Regions
- URL: ${baseUrl}/regions
- Description: Regional groupings of MPs.

## Key Topics

- Czech Chamber of Deputies
- MPs
- parliamentary groups
- attendance
- voting behaviour
- government alignment
- vote corrections
- WPCA voting-position analysis

## Discovery

- Full content index: ${baseUrl}/llms.txt
- Sitemap: ${baseUrl}/sitemap.xml

## Usage

Prefer specific MP, group, or region pages when citing a metric. Include the access date because the data updates over time.
`;

  const datasetSkill = `---
name: czech-chamber-datasets
description: Discover source data categories and derived analysis outputs used by Sněmovna.DataTimes.cz.
---

# Czech Chamber Datasets

## Overview

Use this skill to understand the main derived data categories used by the Sněmovna.DataTimes.cz dashboard.

## Data Categories

### Attendance
- URL: ${baseUrl}/members
- Description: MP attendance shares across roll-call voting events.

### Rebelliousness
- URL: ${baseUrl}/members
- Description: Votes against the MP's own parliamentary group where comparable.

### Government Alignment
- URL: ${baseUrl}/groups
- Description: Agreement with the governing coalition.

### Vote Corrections
- URL: ${baseUrl}/members
- Description: Announced and invalidated vote corrections.

### Voting Positions
- URL: ${baseUrl}/
- Description: WPCA voting-position analysis.

## Discovery

- Full content index: ${baseUrl}/llms.txt
- Sitemap: ${baseUrl}/sitemap.xml
`;

  const skills = [
    {
      name: "czech-chamber-dashboard",
      type: "skill-md",
      description:
        "Discover public dashboard pages and metrics for the Czech Chamber of Deputies 2025-2029 term.",
      url: "/.well-known/agent-skills/czech-chamber-dashboard/SKILL.md",
      content: dashboardSkill,
    },
    {
      name: "czech-chamber-datasets",
      type: "skill-md",
      description:
        "Discover source data categories and derived analysis outputs used by Sněmovna.DataTimes.cz.",
      url: "/.well-known/agent-skills/czech-chamber-datasets/SKILL.md",
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
  const data = await getDashboardData();
  const markdownFiles = buildMarkdownFiles();
  const { skills, index } = buildSkillFiles();

  await mkdir(publicDir, { recursive: true });

  await Promise.all([
    writeGeneratedFile("robots.txt", buildRobotsTxt()),
    writeGeneratedFile("sitemap.xml", buildSitemap(data)),
    writeGeneratedFile("llms.txt", buildLlmsTxt(data)),
    ...Object.entries(markdownFiles).map(([filename, content]) =>
      writeGeneratedFile(filename, content),
    ),
    writeGeneratedFile(".well-known/agent-skills/index.json", `${JSON.stringify(index, null, 2)}\n`),
    ...skills.map((skill) =>
      writeGeneratedFile(`.well-known/agent-skills/${skill.name}/SKILL.md`, skill.content),
    ),
  ]);

  console.log(
    `[ai-readability] Generated files for ${data.members.length} MPs, ${data.groups.length} groups, ${data.regionNames.length} regions in ${path.relative(process.cwd(), publicDir)}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
