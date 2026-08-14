/**
 * Layer 2 of the data model (spec §09) — the payload's content collections.
 *
 * All prose lives in frontmatter rather than the markdown body so that every
 * word an agent writes passes through zod. An empty body is expected.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { existsSync } from 'node:fs';
// Astro 7 deprecates the `z` re-export from `astro:content`; `astro/zod` is the
// supported path and keeps the engine on a single zod instance (see config-schema.ts).
import { z } from 'astro/zod';
import {
  aviationAboutSchema,
  aviationAreaSchema,
  aviationBlogPostSchema,
  aviationFaqSchema,
  aviationGetQuoteSchema,
  aviationHomeSchema,
  aviationQuoteReceivedSchema,
  aviationServiceSchema,
} from './templates/aviation-editorial/schema';
import {
  guildAboutSchema,
  guildAreaSchema,
  guildBlogIndexSchema,
  guildBlogPostSchema,
  guildBookingSchema,
  guildFaqsSchema,
  guildHomeSchema,
  guildQuoteSchema,
  guildServiceSchema,
} from './templates/detailers-guild/schema';
import { siteConfig } from './lib/site-config';

/**
 * Each template owns its content shape (see each template's schema.ts). A collection's
 * schema is therefore chosen by the active template rather than being a union that
 * every template has to satisfy — a payload is only ever validated against the one
 * contract it was written for.
 *
 * This is the single file where both templates are named together, and deliberately
 * so: it is a map from template to schema set, not logic.
 */
const isGuild = siteConfig.template === 'detailers-guild';

/**
 * Collections come in per-template pairs, and the inactive template's loader is
 * pointed at a pattern that matches nothing.
 *
 * The obvious alternative — one collection whose `schema` is chosen by a ternary —
 * was tried and reverted: a runtime-selected schema makes `entry.data` a union of
 * both templates' shapes, and nothing can narrow it, because the discriminant is a
 * config value rather than anything in the data. That cost every page in both
 * templates its field-level type checking (131 errors under `astro check`).
 *
 * Keeping the collections separate means each one has exactly one schema, so both
 * templates keep exact types, and only the active template's files are ever
 * validated — a Guild payload is never checked against the aviation contract.
 */
/**
 * An inactive collection loads nothing at all, rather than globbing a pattern that
 * matches nothing: the glob loader warns once per empty pattern, and warnings that
 * mean "working as intended" teach everyone to ignore warnings.
 */
const empty = async () => [];
const aviationLoader = (base: string, pattern: string) =>
  isGuild ? empty : glob({ base, pattern });
const guildLoader = (base: string, pattern: string) =>
  isGuild ? glob({ base, pattern }) : empty;

const BASE = './client/content';

/**
 * Every authored string passes through here.
 *
 * The refinement catches GHL merge fields that survived import. Client copy arrives
 * with `{{custom_values.business_phone}}` tokens throughout; scripts/import-notion.mjs
 * resolves them, but a token it does not know about would otherwise render literally
 * on a live page. Failing the build is the only place that gets caught reliably —
 * nothing downstream inspects prose for braces.
 */
const prose = z
  .string()
  .min(1)
  .refine(
    (v) => !v.includes('{{'),
    'unresolved merge field — every {{custom_values.*}} token must be resolved at import time',
  );

/** Meta description is hand-tuned per page; the ≤160 cap is enforced, not trusted. */
const metaDescription = prose.max(
  160,
  'metaDescription must be 160 characters or fewer (SEO formula, spec §10)',
);

const services = defineCollection({
  loader: aviationLoader(`${BASE}/services`, '**/*.md'),
  schema: aviationServiceSchema,
});

const guildServices = defineCollection({
  loader: guildLoader(`${BASE}/services`, '**/*.md'),
  schema: guildServiceSchema,
});

const areas = defineCollection({
  loader: aviationLoader(`${BASE}/areas`, '**/*.md'),
  schema: aviationAreaSchema,
});

const guildAreas = defineCollection({
  loader: guildLoader(`${BASE}/areas`, '**/*.md'),
  schema: guildAreaSchema,
});

const home = defineCollection({
  loader: aviationLoader(BASE, 'home.md'),
  schema: aviationHomeSchema,
});

const guildHome = defineCollection({
  loader: guildLoader(BASE, 'home.md'),
  schema: guildHomeSchema,
});

const about = defineCollection({
  loader: aviationLoader(BASE, 'about.md'),
  schema: aviationAboutSchema,
});

const guildAbout = defineCollection({
  loader: guildLoader(BASE, 'about.md'),
  schema: guildAboutSchema,
});

const faqs = defineCollection({
  loader: aviationLoader(BASE, 'faqs.md'),
  schema: aviationFaqSchema,
});

const guildFaqs = defineCollection({
  loader: guildLoader(BASE, 'faqs.md'),
  schema: guildFaqsSchema,
});

/**
 * /booking — detailers-guild only, and only when the client publishes one
 * (siteConfig.routes.booking). Aviation payloads carry no booking.md, so the
 * collection is simply empty there.
 */
const guildBooking = defineCollection({
  loader: guildLoader(BASE, 'booking.md'),
  schema: guildBookingSchema,
});

/**
 * /blog index copy — detailers-guild only, and optional: without blog.md the route
 * falls back to a plain masthead rather than failing, since the post list is what
 * the page is for.
 */
const guildBlogIndex = defineCollection({
  loader: guildLoader(BASE, 'blog.md'),
  schema: guildBlogIndexSchema,
});

/** /get-quote copy. The active template owns the form integration and composition. */
const getQuote = defineCollection({
  loader: aviationLoader(BASE, 'get-quote.md'),
  schema: aviationGetQuoteSchema,
});

const guildGetQuote = defineCollection({
  loader: guildLoader(BASE, 'get-quote.md'),
  schema: guildQuoteSchema,
});

/** /quote-received copy — the form's post-submit confirmation page. */
const quoteReceived = defineCollection({
  loader: aviationLoader(BASE, 'quote-received.md'),
  schema: aviationQuoteReceivedSchema,
});

/**
 * Recipe E — authored legal override.
 *
 * Optional by design. Absent, /privacy-policy and /tos render the shared Detailer
 * Systems template from lib/legal.ts, which is the point of the template: reviewed
 * once, reused unchanged. Present, the payload wins — some clients carry
 * industry-specific liability, warranty, or insurance clauses the template cannot
 * express. Mirrors the LegalDocument interface in lib/legal.ts.
 *
 * Set legal.source: 'client' in site.config.ts when using these, so it stays visible
 * that the text has not been through Detailer Systems' legal review.
 */
const legal = defineCollection({
  /*
   * Optional for both templates, so the directory is usually absent — and the glob
   * loader warns once per build about a base directory that does not exist. That is
   * a warning for the normal case, which is how builds end up with noise nobody
   * reads, so an absent directory simply loads nothing.
   */
  loader: existsSync(`${BASE}/legal`) ? glob({ base: `${BASE}/legal`, pattern: '**/*.md' }) : empty,
  schema: z.object({
    title: prose,
    metaDescription,
    intro: z.array(prose).min(1),
    /** Accent line closing the intro, e.g. "By booking, you agree to these terms." */
    emphasis: prose.optional(),
    sections: z
      .array(
        z.object({
          heading: prose,
          body: z.array(prose).optional(),
          bullets: z.array(z.object({ term: prose.optional(), text: prose })).optional(),
          /**
           * Pulled out of the body into a tinted callout — fees, limits, deadlines.
           * The detailers-guild legal page renders these; a template that does not
           * simply ignores the field.
           */
          note: prose.optional(),
        }),
      )
      .min(1),
    /** Closing contact block. Falls back to a config-derived one when omitted. */
    contact: z.object({ heading: prose, intro: prose }).optional(),
    ctaHeadline: prose.optional(),
  }),
});

const blog = defineCollection({
  loader: aviationLoader(`${BASE}/blog`, '**/*.md'),
  schema: aviationBlogPostSchema,
});

/** Posts for detailers-guild, validated against that template's own contract. */
const guildBlog = defineCollection({
  loader: guildLoader(`${BASE}/blog`, '**/*.md'),
  schema: guildBlogPostSchema,
});

export const collections = {
  // aviation-editorial
  services,
  areas,
  home,
  about,
  faqs,
  getQuote,
  quoteReceived,
  blog,
  // detailers-guild
  guildServices,
  guildAreas,
  guildHome,
  guildAbout,
  guildFaqs,
  guildGetQuote,
  guildBooking,
  guildBlogIndex,
  guildBlog,
  // shared — same shape for both templates
  legal,
};
