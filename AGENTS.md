# Agent Instructions

## Detailer SEO Blog Workflow

Use `skills/detailer-seo-blog-writer/SKILL.md` whenever a user asks for a blog
topic matrix, SEO blog post, blog article, or ongoing blog planning for a
detailing client.

The skill is the canonical workflow. Agent-specific skill directories are
adapters only and must not contain independent copies.

For every client:

- Keep the editorial roadmap at
  `clients/<slug>/editorial/blog-topic-matrix.md`.
- Keep published posts at `clients/<slug>/content/blog/<post-slug>.md`.
- Never put the topic matrix in `content/blog`; Astro loads every Markdown file
  there as a publishable post.
- Read the existing matrix and published posts before selecting a topic.
- Update topic status and the published URL after adding a post.
- Do not regenerate or replace an existing matrix unless the user explicitly
  requests a matrix refresh.
- Follow the current blog collection schema in `src/content.config.ts` rather
  than inventing a parallel post format.

If an agent cannot auto-discover project skills, it should read the canonical
skill directly before doing blog work.
