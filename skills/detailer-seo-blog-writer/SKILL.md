---
name: detailer-seo-blog-writer
description: Use when creating SEO blog topic matrices, blog posts, or ongoing editorial plans for car, aircraft, marine, RV, or other detailing clients in this site engine.
compatibility: Claude Code, OpenCode, and Agent Skills-compatible agents
metadata:
  canonical: "true"
---

# Detailer SEO Blog Writer

Create and maintain a client-specific SEO topic roadmap, select the strongest
available topic, and publish a complete post in the site engine's content
format. The matrix is durable client data. It is not a preamble to paste into a
published article.

## Repository Contract

For client `<slug>`, use these locations:

```text
clients/<slug>/editorial/blog-topic-matrix.md
clients/<slug>/content/blog/<post-slug>.md
clients/<slug>/assets/blog/<image>.webp
clients/<slug>/image-prompts.json
```

Never store the matrix under `content/blog`. Astro treats every Markdown file
there as a blog collection entry.

Before writing, read:

1. `clients/<slug>/editorial/blog-topic-matrix.md`, when present.
2. Every existing file in `clients/<slug>/content/blog/`.
3. The client's service, area, home, about, FAQ, and site configuration data.
4. The blog schema in `src/content.config.ts`.

Ask for the client slug only when it cannot be determined from context. Do not
ask the user to approve a topic when the request is to generate the next post.

## Workflow

### 1. Inventory the Client

Build an inventory from repository content first. Fetch the live sitemap and
homepage when a URL is supplied or when repository data is incomplete.

Identify:

- Service pages
- Location or service-area pages
- Existing blog posts
- Existing blog categories
- Conversion pages
- Business name and owner, when approved for site-wide use
- Phone number and contact route
- Service area and headquarters
- Verified differentiators, certifications, equipment, and process details

Do not invent local facts, prices, warranties, certifications, response times,
or business history.

### 2. Create or Read the Topic Matrix

If no matrix exists, create
`clients/<slug>/editorial/blog-topic-matrix.md`. Organize topics into four
tiers:

1. Service-focused topics: one strong local topic per service.
2. Location-focused topics: one authority topic per location.
3. Service plus location topics: natural, high-value combinations.
4. General authority topics: broader questions with a regional signal.

Every title must include a city, county, airport, state, or region. Prefer
decision-stage and informational searches with strong internal-link potential.

The matrix must track:

- Stable numeric ID
- Topic title
- Status
- Published URL, when applicable

Allowed statuses:

- `available`
- `selected`
- `drafting`
- `published`
- `already-covered`
- `retired`

If a matrix already exists, preserve its IDs and titles. Reconcile statuses
against published post files. Do not regenerate the matrix unless explicitly
asked to refresh it.

### 3. Select the Next Topic

Only select from `available` topics. Rank candidates by:

1. No overlap with published content
2. Maximum relevant internal-link potential
3. High informational or decision-stage intent
4. Service coverage gaps
5. Location coverage gaps

Change the selected row to `drafting` while creating the post. After the post
is complete, change it to `published` and record its route.

### 4. Write the Article

Article requirements:

- 1,200 to 2,500 words
- Primary keyword in the first 100 words
- Clear H1 title with a location signal
- Searchable H2 section headings
- Four to six FAQs
- A final CTA with phone and conversion link
- Simple language and short sentences
- Verified client-specific details
- Natural local context for every relevant service area
- No more than five service or location links, plus conversion links
- No internal links inside headings
- No overlap with an existing post

Use internal Markdown links in prose:

```md
[aircraft ceramic coating](/aircraft-ceramic-coating)
```

Use site-relative routes, not hard-coded production domains. The blog renderer
supports constrained site-relative Markdown links in body and FAQ prose.

### 5. Prepare Images

Follow the supplied brief when one exists. Otherwise plan:

- One hero image
- Two or three inline images
- One existing client setup, team, or operational image for the CTA

Each generated image needs a unique ID, output filename, alt text, usage path,
and prompt in `clients/<slug>/image-prompts.json`.

Store blog-specific generated files under `clients/<slug>/assets/blog/`. Size
published blog images to 600 pixels wide unless the template has a documented
different requirement. Preserve natural aspect ratio unless the brief calls
for a crop.

### 6. Publish in the Engine Format

Write the post to `clients/<slug>/content/blog/<post-slug>.md` using the current
blog schema. At the time of this skill definition, the expected shape is:

```yaml
---
title: Article title
slug: article-slug
date: YYYY-MM-DD
author: Business or approved author
authorBio: Optional author description
authorImage:
  src: "./assets/favicon.png"
  alt: Author image description
category: Category
tags:
  - keyword
metaTitle: "SEO title | Brand"
metaDescription: Description under 160 characters
heroImage:
  src: "./assets/blog/hero.webp"
  alt: Descriptive alt text
ctaImage:
  src: "./assets/team.webp"
  alt: Descriptive alt text
ctaEyebrow: Short CTA context
ctaHeadline: Topic-specific CTA heading
ctaBody: Topic-specific CTA copy
body:
  - Opening paragraph
  - "## Searchable section heading"
  - Section paragraph with [internal link](/service-route)
faq:
  - q: Question
    a: Concise answer
images:
  - id: 1
    type: hero
    section: Top of article
    idea: Image concept
    alt: Descriptive alt text
    prompt: Generation prompt
  - id: 2
    type: inline
    section: Relevant section
    src: "./assets/blog/inline.webp"
    afterHeading: Exact H2 text
    idea: Image concept
    alt: Descriptive alt text
    prompt: Generation prompt
---
```

Re-read `src/content.config.ts` before publishing because the schema is the
source of truth and may evolve.

### 7. SEO and Structured Data

Supply:

- Meta title under 60 characters where practical
- Meta description under 160 characters
- Eight to ten relevant tags
- Descriptive hero alt text
- FAQ content that matches the visible FAQ block

The engine supplies canonical URLs, Open Graph metadata, and FAQ JSON-LD. Do
not add duplicate canonical tags or standalone JSON-LD scripts to post content.

### 8. Update the Matrix

After adding the post:

1. Mark its row `published`.
2. Add `/post/<post-slug>` as the published URL.
3. Update the matrix `updatedAt` date.
4. Mark genuinely overlapping ideas `already-covered` only when their search
   intent is substantially duplicated.

Do not remove published rows. The matrix is the editorial audit trail.

## Quality Checklist

Before finishing, verify:

- The matrix was read before topic selection
- Existing posts were checked for overlap
- The selected matrix row is now published
- The post follows the current content schema
- Internal links resolve to real client routes
- All referenced images exist
- Inline image placements match exact H2 text
- FAQ visible content and schema content agree
- CTA uses the correct phone and conversion route
- No unverified business or local claims were introduced
- The topic matrix is outside `content/blog`

Run repository checks only when the user has not prohibited them. Never start,
stop, or restart a development server without permission when the user has
asked agents not to do so.
