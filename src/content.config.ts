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
  aviationAirportSchema,
  aviationFaqSchema,
  aviationHomeSchema,
  aviationQuoteReceivedSchema,
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

/** A reusable authored heading and body pair. */
const proseBlock = z.object({
  heading: prose,
  body: prose,
});

/** Meta description is hand-tuned per page; the ≤160 cap is enforced, not trusted. */
const metaDescription = prose.max(
  160,
  'metaDescription must be 160 characters or fewer (SEO formula, spec §10)',
);

const image = z.object({
  src: z.string().min(1),
  /** Pattern: "{subject} — {Brand} in {City}, {ST}" where sensible. */
  alt: prose,
});

/**
 * URL safety only. This deliberately does NOT encode what a page *is* — an earlier
 * version required area slugs to end in `-{st}`, which quietly assumed every service
 * area is a US city and rejected clients whose areas are airports, ports, or regions.
 * Cross-collection collisions are caught by assertUniqueSlugs() in lib/content.ts.
 */
const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slug must be lowercase, hyphen-separated');

/**
 * Optional authored overrides for the two strings normally produced by the SEO
 * formulas in lib/seo.ts. Clients whose page generator already emits a tuned H1 and
 * title supply them here; everyone else gets the formula.
 */
const headingOverrides = {
  title: prose.optional(),
  h1: prose.optional(),
};

/**
 * A page block extends authored prose with optional media and an action. These remain
 * content facts; each template decides how to compose them.
 */
const pageBlock = proseBlock.extend({
  image: image.optional(),
  cta: z
    .object({
      label: prose,
      href: z.string().min(1),
    })
    .optional(),
});

/** Before/after pair. Two images per instance — mind the asset budget. */
const beforeAfter = z
  .object({
    before: image,
    after: image,
    beforeLabel: prose.default('Before'),
    afterLabel: prose.default('After'),
    caption: prose.optional(),
  })
  .optional();

const aviationServiceSchema = z.object({
    name: prose,
    /** Must match the filename and the live URL: /{slug} */
    slug,
    order: z.number().int().nonnegative(),
    /** One-liner reused by service directories and related-service links. */
    shortDescription: prose,
    metaDescription,
    ...headingOverrides,

    heroImage: image,
    /** Hero body copy. The H1 comes from `h1` when set, else formula (spec §10). */
    heroIntro: prose,

    /** Optional before/after proof, rendered between the process steps and add-ons. */
    beforeAfter,

    intro: proseBlock,
    /** Optional "What Is {Service}" educational block. */
    explainer: proseBlock.optional(),

    /**
     * Product tiers, where the client sells them. Optional: plenty of businesses
     * quote per job and publish no tiers at all, and inventing package cards to
     * satisfy a schema would be inventing a product structure.
     */
    packages: z
      .array(
        z.object({
          name: prose,
          /**
           * The second-line subtitle above package body copy
           * (e.g. "Clean From Every Angle"). Schema extension — see PHASE-0-NOTES.md.
           */
          tagline: prose,
          /** e.g. "2–3 years" — only where the client actually states a duration. */
          durationBadge: prose.optional(),
          image: image.optional(),
          body: prose,
        }),
      )
      .min(1)
      .optional(),

    processHeading: prose,
    processSteps: z
      .array(
        z.object({
          /** Optional when a process step is a single sentence with no lead-in. */
          title: prose.optional(),
          body: prose,
          image: image.optional(),
        }),
      )
      .min(1),
    /** Trailing requirement note under the steps (water/power access, etc.). */
    processNote: prose.optional(),

    /** Optional for the same reason as `packages`. */
    addons: z
      .array(
        z.object({
          name: prose,
          image: image.optional(),
          body: prose,
        }),
      )
      .min(1)
      .optional(),

    /**
     * Internal-linking block ("We Detail Every Vehicle Type"). Schema extension —
     * Some payloads use this slot instead of `whyItMatters`.
     */
    crossSell: proseBlock,
    /** Optional "Why {Service} Matters" local-conditions block. */
    whyItMatters: proseBlock.optional(),

    faqs: z.array(z.object({ q: prose, a: prose })).min(1),

    /** Service-specific closing call-to-action headline. */
    ctaHeadline: prose,
});

const services = defineCollection({
  loader: aviationLoader(`${BASE}/services`, '**/*.md'),
  schema: aviationServiceSchema,
});

const guildServices = defineCollection({
  loader: guildLoader(`${BASE}/services`, '**/*.md'),
  schema: guildServiceSchema,
});

const aviationAreaSchema = z.object({
    /** Display name. A city ("Ashburn"), but equally an airport or a region. */
    name: prose,
    slug,
    /**
     * Optional. Set for US-city areas, where every label reads "{name}, {ST}" and the
     * LocalBusiness areaServed entry is a City. Omit for areas that are not cities —
     * an airport is a Place, and "Teterboro Airport (KTEB), NJ" is not how anyone
     * writes it. Read through areaLabel() in lib/content.ts, never inline.
     */
    state: z
      .string()
      .length(2)
      .regex(/^[A-Z]{2}$/)
      .optional(),
    /** Compact label for nav and tiles where the full name is too long ("KTEB"). */
    shortName: prose.optional(),
    order: z.number().int().nonnegative(),
    /** Marks the home base; rendered as "HQ" in nav. */
    isHeadquarters: z.boolean().default(false),
    metaDescription,
    ...headingOverrides,

    /**
      * Optional area-card image. Most clients have no
     * per-city photography, so this falls back to the hero poster when unset —
     * but the variant only earns its place when the images actually differ.
     */
    image: image.optional(),

    heroIntro: prose,
    /** Intro above the service directory on this page. Authored — the engine has no
     *  business asserting that services "come to you". */
    servicesIntro: prose,

    /** "Why {Area} Residents Choose Mobile Detailing" — the hyper-local block. */
    localCopy: pageBlock,
    /**
     * Second local block, for clients whose area pages carry genuinely page-specific
     * detail (an airport's FBOs, weather, and scheduling constraints) beyond the
     * "why here" pitch. Rendered after localCopy.
     */
    localDetail: pageBlock.optional(),
    /** "Why {Brand} for {Area}" trust block. */
    whyUs: pageBlock,

    beforeAfter,

    ctaHeadline: prose,
    /** Structured operational data for aviation-editorial airport pages. */
    airport: aviationAirportSchema.optional(),
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
  schema: z.object({
    metaDescription,
    title: prose,
    heroHeadline: prose,
    heroIntro: prose,
    /** Heading above the service link list. */
    servicesHeading: prose,
    /** Heading on the contact/hours sidebar panel. */
    panelHeading: prose,
    ctaHeadline: prose,
  }),
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
  schema: z.object({
    title: prose,
    slug,
    date: z.coerce.string(),
    author: prose,
    authorBio: prose.optional(),
    authorImage: image.optional(),
    category: prose,
    tags: z.array(prose).optional(),
    metaTitle: prose,
    metaDescription,
    heroImage: image,
    ctaImage: image.optional(),
    ctaEyebrow: prose.optional(),
    ctaHeadline: prose.optional(),
    ctaBody: prose.optional(),
    body: z.array(z.string()).min(1),
    faq: z.array(z.object({ q: prose, a: prose })).min(1),
    images: z.array(z.object({
      id: z.number(),
      type: z.enum(['hero', 'inline']),
      section: prose,
      idea: prose,
      alt: prose,
      prompt: prose,
      src: z.string().min(1).optional(),
      afterHeading: prose.optional(),
    })).min(1),
  }),
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
  blog,
};
