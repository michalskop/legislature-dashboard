import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const publicDir = path.join(appRoot, "public");
const skillsDir = path.join(publicDir, ".well-known", "agent-skills");

// PLACEHOLDER — task A1 scaffold, see DIVERGENCE.md and src/lib/data.ts.
// No real deployment exists yet (task A4); mesta.datatimes.cz/<city> is the
// eventual URL shape per plan.md D1.
const baseUrl = "https://mesta.datatimes.cz";
// Local fixtures dir, matching src/lib/data.ts's placeholder read (no real
// city data repo published yet — see comment there for why).
const fixturesDir = path.join(appRoot, "src", "fixtures", "analyses");
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
  const text = await readFile(path.join(fixturesDir, pathname), "utf-8");
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
    console.warn(`[ai-readability] Could not read placeholder fixtures: ${error.message}`);
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

  return `# Mesta.DataTimes.cz (placeholder)

> PLACEHOLDER scaffold for a future dashboard of activity and roll-call voting behaviour in Czech municipal (city) assemblies (Praha, Brno, Ostrava). No real data yet.

## About

PLACEHOLDER scaffold (task A1) for a future dashboard of activity and roll-call voting behaviour in Czech municipal (city) assemblies. No real data is published yet -- see DIVERGENCE.md.

- Web: ${baseUrl}
- Data source: PLACEHOLDER fixtures committed in this app (src/fixtures/analyses) -- no real city data repo is published yet
- Languages: Czech primary UI, English labels where available
- Update model: none yet -- this is a static placeholder scaffold; real nightly updates will follow once the data pipeline (plan.md tasks C1/C7/C8) publishes real analysis outputs
- Generated: ${generatedAt}

## Main Sections

### Overview
${baseUrl}/
Dashboard charts for attendance, voting positions, rebelliousness, and coalition alignment (placeholder data).

### Councillors
${baseUrl}/members
Sortable table of councillors with attendance, rebelliousness, coalition alignment, and vote corrections.

### Council Groups
${baseUrl}/groups
Group-level pages with member counts and aggregate metrics.

### Regions
${baseUrl}/regions
Not applicable to city assemblies (no constituency organization) -- route kept for template parity, always empty.

### About
${baseUrl}/about
Project context, data sources, and methodology notes.

## Data And Methods

- Attendance: share of roll-call voting events where a councillor was present
- Rebelliousness: share of votes cast against the councillor's own group where comparison is possible
- Coalition alignment: share of votes matching the governing coalition where comparison is possible
- Vote corrections: corrections announced or invalidated after voting
- WPCA positions: two-dimensional map derived from voting patterns

## Key Dynamic Pages

### Current Council Groups
${listedGroups.map((group) => `- ${baseUrl}/group/${groupSlug(group.id)} - ${group.name}`).join("\n") || "- Generated when live group data is available"}

### Regions
${regionNames.map((name) => `- ${baseUrl}/region/${constituencySlug(name)} - ${name}`).join("\n") || "- Generated when live region data is available"}

### Current Councillors Sample
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

This is a placeholder scaffold -- do not cite it as a real data source. Once real data is published, prefer the specific detail page over the homepage.
`;
}

function buildMarkdownFiles() {
  return {
    "index.md": `# Mesta.DataTimes.cz (placeholder)

Placeholder scaffold for a future dashboard of Czech municipal assembly roll-call votes. No real data yet.

## Main Views

- [Councillors](${baseUrl}/members): sortable table of individual councillor metrics.
- [Council groups](${baseUrl}/groups): group-level aggregate metrics.
- [Regions](${baseUrl}/regions): not applicable to cities, kept for template parity.
- [About](${baseUrl}/about): project context and placeholder-data notice.

## Analyses

- Attendance on voting events.
- Rebelliousness against the councillor's own group.
- Alignment with the governing coalition.
- Vote corrections.
- WPCA voting-position map.

Generated: ${generatedAt}
`,
    "members.md": `# Councillors

Placeholder councillors in the cz-cities scaffold dashboard (no real data yet).

The table at ${baseUrl}/members includes attendance, rebelliousness, coalition alignment, vote corrections, group, and current/former status.

Use individual pages at ${baseUrl}/member/{id} for detail pages.
`,
    "groups.md": `# Council Groups

Placeholder council-group overview for the cz-cities scaffold dashboard (no real data yet).

The list at ${baseUrl}/groups includes member counts and aggregate metrics for attendance, rebelliousness, and coalition alignment. Use ${baseUrl}/group/{id} for detail pages.
`,
    "regions.md": `# Regions

Not applicable to city assemblies -- there is no constituency/region organization for a city council. This route and file exist only for template parity with the parliament apps -- see DIVERGENCE.md.
`,
    "about.md": `# About Mesta.DataTimes.cz (placeholder)

Mesta.DataTimes.cz is a planned public dashboard for analysing activity and roll-call voting behaviour in Czech municipal (city) assemblies. This deployment is a placeholder scaffold -- no real data yet.

Machine-readable discovery files are available at ${baseUrl}/llms.txt, ${baseUrl}/sitemap.xml, and ${baseUrl}/.well-known/agent-skills/index.json.
`,
  };
}

function buildSkillFiles() {
  const dashboardSkill = `---
name: city-assembly-dashboard
description: Discover public dashboard pages and metrics for the cz-cities placeholder scaffold (Czech municipal assembly roll-call votes).
---

# City Assembly Dashboard (placeholder)

## Overview

Use this skill to discover public pages, dashboard sections, and machine-readable summaries for the Mesta.DataTimes.cz placeholder scaffold. No real data is published yet.

## Content Categories

### Overview
- URL: ${baseUrl}/
- Description: Dashboard charts for councillor attendance, voting positions, rebelliousness, and coalition alignment (placeholder data).

### Councillors
- URL: ${baseUrl}/members
- Description: Councillor-level metrics and links to detail pages.

### Council Groups
- URL: ${baseUrl}/groups
- Description: Group-level aggregate metrics and member lists.

### Regions
- URL: ${baseUrl}/regions
- Description: Not applicable to city assemblies -- kept for template parity.

## Key Topics

- Czech municipal assembly
- councillors
- council groups
- attendance
- voting behaviour
- coalition alignment
- vote corrections
- WPCA voting-position analysis

## Discovery

- Full content index: ${baseUrl}/llms.txt
- Sitemap: ${baseUrl}/sitemap.xml

## Usage

This is a placeholder scaffold -- do not cite it as a real data source.
`;

  const datasetSkill = `---
name: city-assembly-datasets
description: Discover placeholder source data categories and derived analysis outputs used by the cz-cities scaffold.
---

# City Assembly Datasets (placeholder)

## Overview

Use this skill to understand the main derived data categories used by the Mesta.DataTimes.cz placeholder scaffold. All values are placeholder fixtures, not real votes.

## Data Categories

### Attendance
- URL: ${baseUrl}/members
- Description: Councillor attendance shares across roll-call voting events.

### Rebelliousness
- URL: ${baseUrl}/members
- Description: Votes against the councillor's own group where comparable.

### Coalition Alignment
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
      name: "city-assembly-dashboard",
      type: "skill-md",
      description:
        "Discover public dashboard pages and metrics for the cz-cities placeholder scaffold.",
      url: "/.well-known/agent-skills/city-assembly-dashboard/SKILL.md",
      content: dashboardSkill,
    },
    {
      name: "city-assembly-datasets",
      type: "skill-md",
      description:
        "Discover placeholder source data categories and derived analysis outputs used by the cz-cities scaffold.",
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
