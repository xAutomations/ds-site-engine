import { z } from 'astro/zod';

const prose = z
  .string()
  .min(1)
  .refine((value) => !value.includes('{{'), 'unresolved merge field');

const image = z.object({
  src: z.string().min(1),
  alt: prose,
});

const linkedItem = z.object({
  slug: z.string().min(1),
  summary: prose,
  imageLabel: prose,
});

const mediaSlot = z.object({
  label: prose,
  image: image.optional(),
});

/**
 * Coordinates for the coverage schematic. Optional: a client without them falls back to
 * the photographic media slot, so this cannot break an existing payload.
 */
const coverageChart = z.object({
  points: z
    .array(
      z.object({
        code: prose,
        name: prose,
        lat: z.number().min(-90).max(90),
        lon: z.number().min(-180).max(180),
        place: z.enum(['left', 'right', 'above', 'below']).optional(),
      }),
    )
    .min(2),
  reference: z
    .object({ label: prose, lat: z.number(), lon: z.number() })
    .optional(),
});

const ctaSchema = z.object({
  eyebrow: prose,
  heading: prose,
  body: prose,
  media: mediaSlot,
  availability: prose.optional(),
  secondaryLabel: prose.optional(),
  details: z
    .array(
      z.object({
        label: prose,
        kind: z.enum(['phone', 'email', 'text']),
        value: prose.optional(),
      }),
    )
    .max(3)
    .default([]),
});

export const aviationHomeSchema = z.object({
  metaDescription: prose.max(160),
  chrome: z.object({
    stationLabel: prose,
    emergencyLabel: prose,
    mobileCallLabel: prose,
  }),
  hero: z.object({
    eyebrow: prose,
    headline: prose,
    subheading: prose,
    body: prose,
    mediaCaption: prose,
    mediaStatus: prose,
  }),
  credentials: z
    .array(
      z.object({
        label: prose,
        summary: prose,
      }),
    )
    .min(3)
    .max(5),
  introduction: z.object({
    eyebrow: prose,
    metadata: z.array(prose).min(1),
    heading: prose,
    body: z.array(prose).min(1).max(3),
    stats: z.array(z.object({ value: prose, label: prose })).min(2).max(4),
    primaryMedia: mediaSlot,
    detailMedia: z.array(mediaSlot).max(2).default([]),
  }),
  mediaBand: z.array(mediaSlot).min(2).max(3),
  services: z.object({
    eyebrow: prose,
    heading: prose,
    featured: linkedItem.extend({
      label: prose,
      status: prose,
      specs: z.array(z.object({ label: prose, value: prose })).min(2).max(5),
    }),
    standardLabel: prose,
    standardMeta: prose,
    standard: z.array(linkedItem).min(1),
    classLabel: prose,
    classMeta: prose,
    aircraftClasses: z
      .array(
        linkedItem.extend({
          category: prose,
          scope: prose,
        }),
      )
      .min(1),
    emergency: linkedItem.extend({
      status: prose,
    }),
  }),
  differentiation: z.object({
    eyebrow: prose,
    heading: prose,
    intro: prose,
    media: mediaSlot,
    issuedLabel: prose,
    issuedItems: z.array(prose).min(1),
    items: z
      .array(
        z.object({
          label: prose,
          title: prose,
          body: prose,
        }),
      )
      .min(3),
  }),
  process: z.object({
    eyebrow: prose,
    heading: prose,
    intro: prose,
    steps: z
      .array(
        z.object({
          title: prose,
          body: prose,
          facts: z.array(z.object({ label: prose, value: prose })).min(1).max(3),
        }),
      )
      .min(3)
      .max(6),
  }),
  coverage: z.object({
    eyebrow: prose,
    heading: prose,
    intro: prose,
    map: mediaSlot,
    chart: coverageChart.optional(),
    airports: z
      .array(
        z.object({
          slug: z.string().min(1),
          description: prose,
          serviceMode: prose,
          serviceNote: prose,
          status: z.enum(['badged', 'escorted']),
        }),
      )
      .min(1),
    note: prose,
  }),
  proof: z.object({
    gallery: z.array(mediaSlot).min(1).max(5),
    quote: prose,
    attribution: prose,
    audiences: z.array(z.object({ label: prose, code: prose })).min(1),
  }),
  cta: ctaSchema,
});

export type AviationHome = z.infer<typeof aviationHomeSchema>;

export const aviationAboutSchema = z.object({
  metaDescription: prose.max(160),
  masthead: z.object({
    eyebrow: prose,
    headline: prose,
    lead: prose,
    body: prose,
    stats: z.array(z.object({ label: prose, value: prose })).min(3).max(6),
    media: mediaSlot,
  }),
  story: z.object({
    eyebrow: prose,
    metadata: z.array(prose).min(1),
    heading: prose,
    body: z.array(prose).min(1).max(3),
    services: z.array(z.object({ label: prose, value: prose })).min(1),
    media: z.array(mediaSlot).min(1).max(3),
  }),
  coverage: z.object({
    eyebrow: prose,
    heading: prose,
    intro: prose,
    emergencyLabel: prose,
    emergencyBody: prose,
    airports: z
      .array(
        z.object({
          slug: z.string().min(1),
          description: prose,
          status: z.enum(['badged', 'escorted']),
        }),
      )
      .min(1),
    map: mediaSlot,
    chart: coverageChart.optional(),
  }),
  liability: z.object({
    eyebrow: prose,
    heading: prose,
    lead: prose,
    body: z.array(prose).min(1).max(3),
    principles: z.array(z.object({ label: prose, body: prose })).min(1),
    stats: z.array(z.object({ value: prose, label: prose })).min(2).max(4),
  }),
  founder: z.object({
    eyebrow: prose,
    heading: prose,
    body: z.array(prose).min(1).max(3),
    media: mediaSlot,
    stats: z.array(z.object({ value: prose, label: prose })).min(2).max(4),
  }),
  expectations: z.object({
    eyebrow: prose,
    heading: prose,
    items: z
      .array(z.object({ label: prose, title: prose, body: prose }))
      .min(2)
      .max(5),
    quote: prose,
    links: z.array(z.object({ label: prose, href: z.string().min(1) })).min(1).max(5),
  }),
  cta: ctaSchema,
});

export type AviationAbout = z.infer<typeof aviationAboutSchema>;

export const aviationFaqSchema = z.object({
  metaDescription: prose.max(160),
  masthead: z.object({
    eyebrow: prose,
    headline: prose,
    lead: prose,
    body: prose,
    fastAnswers: z.array(z.object({ label: prose, value: prose })).min(2).max(6),
  }),
  groups: z
    .array(
      z.object({
        id: z.string().min(1),
        heading: prose,
        shortHeading: prose.optional(),
        status: prose.optional(),
        faqs: z
          .array(
            z.object({
              q: prose,
              a: prose,
              layout: z.enum(['cards', 'rows']).optional(),
              items: z.array(z.object({ label: prose, value: prose })).min(1).optional(),
              metrics: z.array(z.object({ value: prose, label: prose })).min(1).max(3).optional(),
              link: z.object({ label: prose, href: z.string().min(1) }).optional(),
            }),
          )
          .min(1),
      }),
    )
    .min(1),
  cadence: z.object({
    eyebrow: prose,
    note: prose,
    rows: z
      .array(
        z.object({
          aircraftClass: prose,
          fullDetail: prose,
          betweenServices: prose,
        }),
      )
      .min(1),
  }),
  cta: ctaSchema,
});

export type AviationFaq = z.infer<typeof aviationFaqSchema>;

/**
 * /quote-received — the post-submit confirmation page. Contact details, phone
 * numbers, and social URLs all come from site config at render time; the payload
 * authors only the prose, so nothing here can drift from the config record.
 */
export const aviationQuoteReceivedSchema = z.object({
  metaDescription: prose.max(160),
  title: prose,
  masthead: z.object({
    eyebrow: prose,
    headline: prose,
    body: prose,
    status: z.object({
      label: prose,
      headline: prose,
      rows: z.array(z.object({ label: prose, value: prose })).min(1).max(4),
    }),
  }),
  sequence: z.object({
    eyebrow: prose,
    heading: prose,
    note: prose,
    steps: z
      .array(z.object({ timing: prose, title: prose, body: prose }))
      .min(2)
      .max(4),
    footnote: z.object({ left: prose, right: prose }).optional(),
  }),
  ready: z.object({
    eyebrow: prose,
    heading: prose,
    intro: prose,
    items: z.array(z.object({ title: prose, body: prose })).min(1).max(5),
  }),
  aog: z.object({
    statusLabel: prose,
    heading: prose,
    /** Supports an [inline link](/aog-emergency-cleaning) to the service page. */
    body: prose,
    callLabel: prose,
    note: prose,
  }),
  whileYouWait: z.object({
    heading: prose,
    note: prose,
    links: z
      .array(z.object({ kind: prose, title: prose, description: prose, href: z.string().min(1) }))
      .min(1)
      .max(4),
  }),
  /** Rendered only when the config actually carries social URLs. */
  connect: z.object({ heading: prose, note: prose }),
  cta: z.object({
    eyebrow: prose,
    heading: prose,
    body: prose,
    media: mediaSlot,
    alsoUsefulLabel: prose,
    alsoUseful: z.array(z.object({ label: prose, href: z.string().min(1) })).min(1).max(4),
  }),
});

export type AviationQuoteReceived = z.infer<typeof aviationQuoteReceivedSchema>;

export const aviationAirportSchema = z.object({
  officialName: prose,
  locationLabel: prose,
  iata: prose,
  access: z.enum(['badged', 'escorted']),
  heroSummary: prose,
  facts: z.array(z.object({ label: prose, value: prose })).min(3).max(4),
  bandNote: prose,
  conditions: z
    .array(
      z.object({
        label: prose,
        title: prose,
        body: prose,
        /** The tile beside the condition copy. Optional — falls back to a placeholder. */
        image: image.optional(),
      }),
    )
    .min(3)
    .max(5),
  referenceImpacts: z.array(prose).min(3).max(5),
  /**
   * Field coordinates, emitted as GeoCoordinates in the Airport JSON-LD node. This
   * describes where the airport is — a checkable public fact — not where any photograph
   * was taken. Optional: a payload without it simply omits `geo` from the graph.
   */
  geo: z.object({ lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180) }).optional(),
  /** Full-bleed image beside the closing CTA. Optional, like every other media slot. */
  conversionImage: image.optional(),
  teaser: prose,
});

export type AviationAirport = z.infer<typeof aviationAirportSchema>;

/*
 * ————————————————————————————————————————————————————————————————————————————
 * Collection schemas: services, areas, get-quote, blog.
 *
 * These lived inline in content.config.ts before detailers-guild existed and
 * moved here when that file became a pure template→schema map. The primitives
 * below are theirs alone — the pageBlock/beforeAfter shapes are this template's
 * vocabulary, not an engine contract.
 */

/** Hand-tuned per page; the ≤160 cap is enforced, not trusted. */
const metaDescription = prose.max(
  160,
  'metaDescription must be 160 characters or fewer (SEO formula, spec §10)',
);

/** A reusable authored heading and body pair. */
const proseBlock = z.object({
  heading: prose,
  body: prose,
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
 * content facts; the template decides how to compose them.
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

export const aviationServiceSchema = z.object({
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

export type AviationService = z.infer<typeof aviationServiceSchema>;

export const aviationAreaSchema = z.object({
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

export type AviationArea = z.infer<typeof aviationAreaSchema>;

/** /get-quote copy. The template owns the form integration and composition. */
export const aviationGetQuoteSchema = z.object({
  metaDescription,
  title: prose,
  heroHeadline: prose,
  heroIntro: prose,
  /** Heading above the service link list. */
  servicesHeading: prose,
  /** Heading on the contact/hours sidebar panel. */
  panelHeading: prose,
  ctaHeadline: prose,
});

export type AviationGetQuote = z.infer<typeof aviationGetQuoteSchema>;

export const aviationBlogPostSchema = z.object({
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
});

export type AviationBlogPost = z.infer<typeof aviationBlogPostSchema>;
