# AI Readability Implementation Guide

Complete guide for implementing AI readability features on any website. This guide is based on the implementation for mahdalova-skop.cz and datajournalism.studio.

**Target Score**: 55-60/100 on [isitagentready.com](https://isitagentready.com) (Level 3: Agent-Friendly)

**Time Estimate**: 4-6 hours for initial implementation

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Feature 1: robots.txt with Content Signals](#feature-1-robotstxt-with-content-signals)
4. [Feature 2: Schema.org JSON-LD](#feature-2-schemaorg-json-ld)
5. [Feature 3: llms.txt Curator File](#feature-3-llmstxt-curator-file)
6. [Feature 4: Sitemap Generation](#feature-4-sitemap-generation)
7. [Feature 5: Agent Skills Discovery](#feature-5-agent-skills-discovery)
8. [Feature 6: HTTP Link Headers](#feature-6-http-link-headers)
9. [Feature 7: Markdown for Agents](#feature-7-markdown-for-agents)
10. [Testing & Validation](#testing--validation)
11. [Maintenance](#maintenance)

---

## Overview

### What Are AI Readability Features?

AI readability features help AI agents (like ChatGPT, Claude, Perplexity) discover, understand, and cite your content more effectively.

### Benefits

- **Better AI citations**: Your content appears more often in AI responses
- **Improved discovery**: AI agents can find your content more easily
- **Structured data**: Better understanding of your content structure
- **Token efficiency**: Markdown format reduces AI processing costs
- **Future-proof**: Standards-based implementation

### Score Breakdown

| Feature | Points | Difficulty | Time |
|---------|--------|------------|------|
| robots.txt with Content Signals | ~10 | Easy | 15 min |
| Schema.org JSON-LD | ~15 | Medium | 1-2 hours |
| llms.txt | ~10 | Medium | 1-2 hours |
| Sitemap | ~5 | Easy | 30 min |
| Agent Skills | ~5 | Medium | 1 hour |
| Link Headers | ~5 | Easy | 15 min |
| Markdown for Agents | ~10 | Medium | 1 hour |
| **Total** | **~60** | | **4-6 hours** |

---

## Prerequisites

### Required
- Static site or server-side rendered site
- Access to public directory
- Ability to modify build scripts
- Cloudflare Pages/Workers (for Markdown for Agents on free plan)

### Recommended
- Next.js, Gatsby, Hugo, or similar static site generator
- Node.js for build scripts
- Git for version control
- Articles/content in structured format (Markdown, MDX, etc.)

---

## Feature 1: robots.txt with Content Signals

**Score Impact**: ~10 points  
**Time**: 15 minutes  
**Difficulty**: Easy

### What It Does

Tells AI bots they're welcome to crawl your site and provides metadata about your content.

### Implementation

Create `public/robots.txt`:

```txt
# General rules for all bots
User-agent: *
Allow: /

# Sitemap location
Sitemap: https://YOUR-DOMAIN.com/sitemap.xml

# AI-specific rules
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

# Content Signals (RFC draft)
# Tells AI agents about your content type and licensing
Content-Signal: ai-crawl=allow
Content-Signal: content-type=journalism
Content-Signal: content-type=analysis
Content-Signal: license=all-rights-reserved
Content-Signal: language=cs
Content-Signal: language=en
```

### Customization

**Content Types**: Choose from:
- `journalism`, `analysis`, `blog`, `documentation`, `research`, `news`, `opinion`

**Languages**: Use ISO 639-1 codes:
- `en` (English), `cs` (Czech), `de` (German), `fr` (French), etc.

**License**: Common values:
- `all-rights-reserved`, `cc-by`, `cc-by-sa`, `cc-by-nc`, `public-domain`

---

## Feature 2: Schema.org JSON-LD

**Score Impact**: ~15 points  
**Time**: 1-2 hours  
**Difficulty**: Medium

### What It Does

Adds structured data to articles so AI agents understand authorship, dates, topics, and relationships.

### Implementation

#### Step 1: Create Schema.org Component

For **Next.js/React** (`components/seo/ArticleJsonLd.tsx`):

```typescript
interface ArticleJsonLdProps {
  title: string;
  description: string;
  author: string;
  publishDate: string;
  modifiedDate?: string;
  url: string;
  imageUrl?: string;
  tags?: string[];
}

export function ArticleJsonLd({
  title,
  description,
  author,
  publishDate,
  modifiedDate,
  url,
  imageUrl,
  tags = [],
}: ArticleJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    author: {
      '@type': 'Person',
      name: author,
    },
    datePublished: publishDate,
    dateModified: modifiedDate || publishDate,
    url: url,
    image: imageUrl,
    keywords: tags.join(', '),
    publisher: {
      '@type': 'Organization',
      name: 'YOUR SITE NAME',
      url: 'https://YOUR-DOMAIN.com',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

For **Static HTML**:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "description": "Article description",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "datePublished": "2026-04-29T12:00:00Z",
  "dateModified": "2026-04-29T12:00:00Z",
  "url": "https://YOUR-DOMAIN.com/article-slug",
  "image": "https://YOUR-DOMAIN.com/image.jpg",
  "keywords": "tag1, tag2, tag3",
  "publisher": {
    "@type": "Organization",
    "name": "Your Site Name",
    "url": "https://YOUR-DOMAIN.com"
  }
}
</script>
```

#### Step 2: Add to Article Pages

**Next.js** (`app/article/[slug]/page.tsx`):

```typescript
import { ArticleJsonLd } from '@/components/seo/ArticleJsonLd';

export default function ArticlePage({ article }) {
  return (
    <>
      <ArticleJsonLd
        title={article.title}
        description={article.excerpt}
        author={article.author}
        publishDate={article.date}
        url={`https://YOUR-DOMAIN.com/article/${article.slug}`}
        imageUrl={article.coverImage}
        tags={article.tags}
      />
      {/* Your article content */}
    </>
  );
}
```

### Validation

Test at: https://validator.schema.org/

---

## Feature 3: llms.txt Curator File

**Score Impact**: ~10 points  
**Time**: 1-2 hours  
**Difficulty**: Medium

### What It Does

Provides a curated, AI-friendly index of your most important content.

### Manual Implementation

Create `public/llms.txt`:

```markdown
# Your Site Name

> Brief description of your site and what you publish

## About

Longer description of your site, mission, and focus areas.

- Web: https://YOUR-DOMAIN.com
- Authors: Author Names
- Focus: Your main topics

## Main Sections

### Section 1
https://YOUR-DOMAIN.com/section1
Description of this section

### Section 2
https://YOUR-DOMAIN.com/section2
Description of this section

## Featured Articles

### Topic Category 1
- https://YOUR-DOMAIN.com/article-1
- https://YOUR-DOMAIN.com/article-2
- https://YOUR-DOMAIN.com/article-3

### Topic Category 2
- https://YOUR-DOMAIN.com/article-4
- https://YOUR-DOMAIN.com/article-5

## Contact

- Email: contact@YOUR-DOMAIN.com
- Twitter: @yourhandle
```

### Automated Generation (Recommended)

Create `scripts/generateLlmsTxt.js`:

```javascript
const fs = require('fs');
const path = require('path');

const baseUrl = 'https://YOUR-DOMAIN.com';
const articlesDir = path.join(__dirname, '../content/articles'); // Adjust path

function getArticleSlugs() {
  const items = fs.readdirSync(articlesDir, { withFileTypes: true });
  return items
    .filter(item => item.isDirectory())
    .map(item => item.name);
}

function getArticleMetadata(slug) {
  const filePath = path.join(articlesDir, slug, 'index.md'); // Adjust
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract frontmatter (adjust regex for your format)
  const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
  const dateMatch = content.match(/date:\s*["']([^"']+)["']/);
  const tagsMatch = content.match(/tags:\s*\[([^\]]+)\]/);
  
  return {
    slug,
    title: titleMatch ? titleMatch[1] : slug,
    date: dateMatch ? new Date(dateMatch[1]) : new Date(),
    tags: tagsMatch ? tagsMatch[1].split(',').map(t => t.trim()) : []
  };
}

function generateLlmsTxt() {
  const slugs = getArticleSlugs();
  const articles = slugs
    .map(getArticleMetadata)
    .sort((a, b) => b.date - a.date);
  
  let content = `# Your Site Name

> Your site description

## About

Your about section

- Web: ${baseUrl}
- Authors: Your authors
- Focus: Your focus areas

## Main Sections

### Section 1
${baseUrl}/section1
Section description

## Featured Articles

`;

  // Group by topic (customize keywords)
  const topics = {
    'Topic 1': ['keyword1', 'keyword2'],
    'Topic 2': ['keyword3', 'keyword4'],
  };

  for (const [topic, keywords] of Object.entries(topics)) {
    const topicArticles = articles.filter(a =>
      keywords.some(kw => 
        a.slug.includes(kw) || 
        a.tags.some(tag => tag.toLowerCase().includes(kw))
      )
    ).slice(0, 3);

    if (topicArticles.length > 0) {
      content += `### ${topic}\n`;
      topicArticles.forEach(a => {
        content += `- ${baseUrl}/article/${a.slug}\n`;
      });
      content += '\n';
    }
  }

  content += `## Contact

- Email: contact@YOUR-DOMAIN.com
`;

  fs.writeFileSync(
    path.join(__dirname, '../public/llms.txt'),
    content,
    'utf8'
  );
  console.log(`llms.txt generated with ${articles.length} articles`);
}

generateLlmsTxt();
```

Add to `package.json`:

```json
{
  "scripts": {
    "prebuild": "node scripts/generateLlmsTxt.js"
  }
}
```

---

## Feature 4: Sitemap Generation

**Score Impact**: ~5 points  
**Time**: 30 minutes  
**Difficulty**: Easy

### Automated Generation

Create `scripts/generateSitemap.js`:

```javascript
const fs = require('fs');
const path = require('path');

const baseUrl = 'https://YOUR-DOMAIN.com';
const articlesDir = path.join(__dirname, '../content/articles');

function getArticleSlugs() {
  const items = fs.readdirSync(articlesDir, { withFileTypes: true });
  return items.filter(item => item.isDirectory()).map(item => item.name);
}

function getArticleDate(slug) {
  const filePath = path.join(articlesDir, slug, 'index.md');
  const content = fs.readFileSync(filePath, 'utf8');
  const dateMatch = content.match(/date:\s*["']([^"']+)["']/);
  return dateMatch ? new Date(dateMatch[1]).toISOString() : new Date().toISOString();
}

function generateSitemap() {
  const slugs = getArticleSlugs();
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Homepage
  xml += '  <url>\n';
  xml += `    <loc>${baseUrl}/</loc>\n`;
  xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
  xml += '    <changefreq>daily</changefreq>\n';
  xml += '    <priority>1.0</priority>\n';
  xml += '  </url>\n';
  
  // Articles
  slugs.forEach(slug => {
    const lastmod = getArticleDate(slug);
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/article/${slug}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.7</priority>\n';
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  
  fs.writeFileSync(
    path.join(__dirname, '../public/sitemap.xml'),
    xml,
    'utf8'
  );
  console.log(`Sitemap generated with ${slugs.length} articles`);
}

generateSitemap();
```

Add to `package.json`:

```json
{
  "scripts": {
    "prebuild": "node scripts/generateSitemap.js && node scripts/generateLlmsTxt.js"
  }
}
```

---

## Feature 5: Agent Skills Discovery

**Score Impact**: ~5 points  
**Time**: 1 hour  
**Difficulty**: Medium

### What It Does

Advertises specific "skills" or capabilities your site offers to AI agents.

### Implementation

#### Step 1: Create Index

Create `public/.well-known/agent-skills/index.json`:

```json
{
  "$schema": "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
  "skills": [
    {
      "name": "skill-name-1",
      "type": "skill-md",
      "description": "Brief description of what this skill provides",
      "url": "/.well-known/agent-skills/skill-name-1/SKILL.md",
      "digest": "sha256:placeholder"
    },
    {
      "name": "skill-name-2",
      "type": "skill-md",
      "description": "Another skill description",
      "url": "/.well-known/agent-skills/skill-name-2/SKILL.md",
      "digest": "sha256:placeholder"
    }
  ]
}
```

#### Step 2: Create Skill Definitions

Create `public/.well-known/agent-skills/skill-name-1/SKILL.md`:

```markdown
---
name: skill-name-1
description: Brief description of this skill
---

# Skill Name

## Overview
Detailed description of what this skill provides.

## Content Categories

### Category 1
Description and relevant URLs
- URL: https://YOUR-DOMAIN.com/category1

### Category 2
Description and relevant URLs
- URL: https://YOUR-DOMAIN.com/category2

## Key Topics
- Topic 1
- Topic 2
- Topic 3

## Discovery
- Full content index: https://YOUR-DOMAIN.com/llms.txt
- Sitemap: https://YOUR-DOMAIN.com/sitemap.xml

## Usage
How agents should use this content.
```

### Skill Ideas by Site Type

**News/Journalism**:
- `article-search` - Search and discover articles
- `fact-checking` - Access fact-checked content
- `breaking-news` - Latest news updates

**Documentation**:
- `api-reference` - API documentation
- `tutorials` - How-to guides
- `troubleshooting` - Problem-solving guides

**E-commerce**:
- `product-catalog` - Product information
- `pricing` - Pricing and availability
- `reviews` - Customer reviews

**Research/Academia**:
- `publications` - Research papers
- `datasets` - Data access
- `citations` - Citation information

---

## Feature 6: HTTP Link Headers

**Score Impact**: ~5 points  
**Time**: 15 minutes  
**Difficulty**: Easy

### For Cloudflare Pages

Create `public/_headers`:

```
/*
  Link: </.well-known/agent-skills/index.json>; rel="index"; type="application/json"; title="Agent Skills"
  Link: </llms.txt>; rel="alternate"; type="text/plain"; title="LLM Context"
  Link: </sitemap.xml>; rel="sitemap"; type="application/xml"
  Link: </robots.txt>; rel="alternate"; type="text/plain"; title="Robots"
```

### For Netlify

Create `public/_headers`:

```
/*
  Link: </.well-known/agent-skills/index.json>; rel="index"; type="application/json"; title="Agent Skills"
  Link: </llms.txt>; rel="alternate"; type="text/plain"; title="LLM Context"
  Link: </sitemap.xml>; rel="sitemap"; type="application/xml"
  Link: </robots.txt>; rel="alternate"; type="text/plain"; title="Robots"
```

### For Vercel

Create `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Link",
          "value": "</.well-known/agent-skills/index.json>; rel=\"index\"; type=\"application/json\"; title=\"Agent Skills\", </llms.txt>; rel=\"alternate\"; type=\"text/plain\"; title=\"LLM Context\", </sitemap.xml>; rel=\"sitemap\"; type=\"application/xml\", </robots.txt>; rel=\"alternate\"; type=\"text/plain\"; title=\"Robots\""
        }
      ]
    }
  ]
}
```

### For Apache (.htaccess)

```apache
<IfModule mod_headers.c>
  Header set Link "</.well-known/agent-skills/index.json>; rel=\"index\"; type=\"application/json\"; title=\"Agent Skills\""
  Header append Link "</llms.txt>; rel=\"alternate\"; type=\"text/plain\"; title=\"LLM Context\""
  Header append Link "</sitemap.xml>; rel=\"sitemap\"; type=\"application/xml\""
  Header append Link "</robots.txt>; rel=\"alternate\"; type=\"text/plain\"; title=\"Robots\""
</IfModule>
```

---

## Feature 7: Markdown for Agents

**Score Impact**: ~10 points  
**Time**: 1 hour  
**Difficulty**: Medium

### What It Does

Returns Markdown instead of HTML when AI agents request it via `Accept: text/markdown` header.

### For Cloudflare Pages (Free Plan)

Create `public/_worker.js`:

```javascript
export default {
  async fetch(request, env) {
    const acceptHeader = request.headers.get('accept') || '';
    const wantsMarkdown = acceptHeader.includes('text/markdown');
    
    const response = await env.ASSETS.fetch(request);
    
    const contentType = response.headers.get('content-type') || '';
    if (!wantsMarkdown || !contentType.includes('text/html')) {
      return response;
    }
    
    const html = await response.text();
    const markdown = htmlToMarkdown(html);
    const tokenCount = Math.ceil(markdown.length / 4);
    
    return new Response(markdown, {
      status: response.status,
      headers: {
        'content-type': 'text/markdown; charset=utf-8',
        'x-markdown-tokens': tokenCount.toString(),
        'cache-control': 'public, max-age=3600',
      },
    });
  },
};

function htmlToMarkdown(html) {
  let text = html;
  
  // Extract main content
  const mainMatch = text.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) text = mainMatch[1];
  else {
    const articleMatch = text.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) text = articleMatch[1];
  }
  
  // Remove scripts and styles
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Convert headings
  text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n');
  text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n');
  text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n');
  text = text.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n');
  text = text.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '\n##### $1\n');
  text = text.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '\n###### $1\n');
  
  // Convert links
  text = text.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  
  // Convert images
  text = text.replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi, '![$2]($1)');
  text = text.replace(/<img[^>]*src=["']([^"']*)["'][^>]*>/gi, '![]($1)');
  
  // Convert bold/italic
  text = text.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  text = text.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  text = text.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  text = text.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  
  // Convert lists
  text = text.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '\n- $1');
  });
  
  // Convert paragraphs
  text = text.replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  
  // Remove remaining tags
  text = text.replace(/<[^>]+>/g, '');
  
  // Decode entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  
  // Clean whitespace
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
}
```

### For Cloudflare Pro/Business/Enterprise

Enable in Cloudflare Dashboard:
1. Go to your zone
2. Navigate to **AI Crawl Control**
3. Enable **"Markdown for Agents"**

---

## Testing & Validation

### Automated Tests

**Schema.org Validation**:
```bash
# Visit with your article URL
https://validator.schema.org/
```

**robots.txt Check**:
```bash
curl https://YOUR-DOMAIN.com/robots.txt
```

**llms.txt Check**:
```bash
curl https://YOUR-DOMAIN.com/llms.txt
```

**Sitemap Check**:
```bash
curl https://YOUR-DOMAIN.com/sitemap.xml
```

**Link Headers Check**:
```bash
curl -I https://YOUR-DOMAIN.com/ | grep -i "link"
```

**Markdown for Agents Check**:
```bash
curl -I https://YOUR-DOMAIN.com/ -H "Accept: text/markdown"
# Should return: Content-Type: text/markdown
```

**Agent Skills Check**:
```bash
curl https://YOUR-DOMAIN.com/.well-known/agent-skills/index.json
```

### Overall Score Test

Visit: `https://isitagentready.com/YOUR-DOMAIN.com`

**Expected Score**: 55-60/100 (Level 3: Agent-Friendly)

---

## Maintenance

### When Adding New Articles

**Automatic** (if using build scripts):
- `llms.txt` - Auto-regenerated on build
- `sitemap.xml` - Auto-regenerated on build
- Schema.org JSON-LD - Auto-generated per article

**Manual**:
- Agent Skills - Only update when adding new major content categories

### Monthly Tasks

1. **Review llms.txt**: Ensure featured articles are still relevant
2. **Check isitagentready.com**: Monitor score changes
3. **Update Agent Skills**: Add new skills if content categories expand

### Quarterly Tasks

1. **Review robots.txt**: Update AI bot list if new bots emerge
2. **Schema.org validation**: Re-validate sample articles
3. **Performance check**: Test Markdown conversion quality

---

## Troubleshooting

### Low Score on isitagentready.com

**Check each feature**:
1. robots.txt exists and has Content Signals
2. Schema.org JSON-LD validates
3. llms.txt is accessible
4. Sitemap is valid XML
5. Link headers are present
6. Markdown for Agents returns text/markdown
7. Agent Skills index is valid JSON

### Markdown Conversion Issues

**Problem**: Returns HTML instead of Markdown

**Solutions**:
1. Verify `_worker.js` is in `public/` directory
2. Check Cloudflare deployment logs
3. Test with: `curl -I URL -H "Accept: text/markdown"`

**Problem**: Poor Markdown quality

**Solutions**:
1. Ensure content is in `<main>` or `<article>` tags
2. Use semantic HTML (proper heading tags)
3. Avoid complex nested structures

### Schema.org Validation Errors

**Common issues**:
1. Missing required fields (headline, datePublished)
2. Invalid date format (use ISO 8601)
3. Missing publisher information

---

## Platform-Specific Notes

### Next.js

- Use `public/` directory for static files
- Add scripts to `prebuild` in package.json
- Exclude `functions/` from tsconfig if using Cloudflare Workers

### Gatsby

- Use `static/` directory for static files
- Add scripts to `onPreBuild` in gatsby-node.js

### Hugo

- Use `static/` directory for static files
- Add scripts to build process

### WordPress

- Use plugins for Schema.org (Yoast SEO, Rank Math)
- Manually create llms.txt and robots.txt
- Use .htaccess for Link headers

---

## Resources

### Standards & Documentation

- [RFC 8288 - Link Headers](https://www.rfc-editor.org/rfc/rfc8288)
- [Schema.org](https://schema.org/)
- [Agent Skills Discovery RFC](https://github.com/cloudflare/agent-skills-discovery-rfc)
- [Cloudflare Markdown for Agents](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/)

### Testing Tools

- [isitagentready.com](https://isitagentready.com) - Overall score
- [validator.schema.org](https://validator.schema.org/) - Schema.org validation
- [xml-sitemaps.com/validate-xml-sitemap](https://www.xml-sitemaps.com/validate-xml-sitemap.html) - Sitemap validation

### Example Implementations

- mahdalova-skop.cz - Czech journalism site
- datajournalism.studio - Election forecasting site

---

## Quick Start Checklist

- [ ] Create `robots.txt` with Content Signals
- [ ] Add Schema.org JSON-LD to articles
- [ ] Create `llms.txt` (manual or automated)
- [ ] Generate `sitemap.xml` (automated recommended)
- [ ] Create Agent Skills index and skill definitions
- [ ] Add HTTP Link headers via `_headers` file
- [ ] Implement Markdown for Agents via `_worker.js`
- [ ] Test at isitagentready.com
- [ ] Add generation scripts to build process
- [ ] Document for team

**Target**: 55-60/100 score (Level 3: Agent-Friendly)

---

## Mandáty.cz Implementation Notes

These notes adapt the generic guide above to the current `apps/cz` project.

### Content Signals

Use the current Cloudflare-style `Content-Signal` vocabulary in `robots.txt`:

```txt
Content-Signal: search=yes, ai-input=yes, ai-train=no
```

Rationale for Mandáty.cz:

- `search=yes` - allow ordinary search indexing, snippets, and links.
- `ai-input=yes` - allow AI systems to use the public dashboard and methodology as grounding/RAG input, preferably with source and reference date.
- `ai-train=no` - reserve rights for model training/fine-tuning unless the project explicitly decides otherwise.

Avoid older/custom-looking signals such as `ai-crawl=allow`, `content-type=analysis`, `license=...`, or `language=...`; `isitagentready.com` currently expects the `search`, `ai-input`, and `ai-train` signal names.

### Web Bot Auth

Do **not** implement Web Bot Auth for Mandáty.cz unless the project starts sending outbound automated bot/agent requests that need to identify themselves to receiving sites.

Web Bot Auth is for a bot operator to publish a JWKS at:

```txt
/.well-known/http-message-signatures-directory
```

and then sign outbound HTTP requests with HTTP Message Signatures. It is useful for a crawler, API agent, monitoring bot, or data-collection bot that wants to be verified by Cloudflare or another receiving site. It is not needed for making Mandáty.cz readable to AI crawlers.

Do not publish a placeholder JWKS only to satisfy a checker. A real implementation requires:

- an Ed25519 signing key,
- a public JWKS directory,
- signed directory responses,
- signed outbound requests,
- key rotation and operational ownership.

### Current `apps/cz` Shape

Mandáty.cz is a Next.js dashboard, not an article-based site. The implementation should therefore focus on:

- generated static files in `apps/cz/public/`,
- `llms.txt` describing the dashboard, methodology, current model date, and key model outputs,
- `sitemap.xml` for the main public routes,
- Markdown alternates for dashboard and informational pages,
- JSON-LD using `Dataset` / `WebSite` / `Organization` rather than only `Article`,
- HTTP `Link` headers in Next middleware,
- automatic regeneration via `prebuild` and the data-update workflow.

### Current Implementation Files

- Generator: `apps/cz/scripts/generate-ai-readability.mjs`
- Generated files:
  - `apps/cz/public/robots.txt`
  - `apps/cz/public/sitemap.xml`
  - `apps/cz/public/llms.txt`
  - `apps/cz/public/index.md`
  - `apps/cz/public/metodika.md`
  - `apps/cz/public/o-projektu.md`
  - `apps/cz/public/archiv.md`
  - `apps/cz/public/.well-known/agent-skills/`
- Build hook: `apps/cz/package.json` → `prebuild`
- Data-update hook: `.github/workflows/fetch-cz-parliament-data.yml`
- Headers and Markdown negotiation: `apps/cz/src/middleware.ts`
- JSON-LD: `apps/cz/src/app/(site)/page.tsx`

---

## License

This guide is based on the implementation for mahdalova-skop.cz and datajournalism.studio.
Feel free to adapt for your own projects.

**Last Updated**: April 29, 2026
