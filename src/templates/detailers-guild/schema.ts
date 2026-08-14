/**
 * The Detailers Guild content contract.
 *
 * A template is a content contract, not a skin. This file is the narrow, bounded
 * shape every Guild payload must satisfy — it exists so the content-writing skills
 * have one target to hit instead of inventing a structure per client. It is
 * deliberately specific to this template and shares nothing with
 * aviation-editorial/schema.ts; a second template gets its own contract rather than
 * a compromise between the two.
 *
 * TWO LAYERS, ON PURPOSE
 * `types.ts` is the *render* contract — what the components take as props.
 * This file is the *authored* contract — what an agent writes into
 * client/content/*.md. They are not the same set, and collapsing them is what
 * couples content to a single composition:
 *
 *   - Composition flags (`reversed`, `seamless`, `large`, `small`, `lead`,
 *     `compact`) are absent here. Where a section sits and how big its heading
 *     runs is the template's decision, and asking a writer to make it produces
 *     arbitrary answers. The route supplies them as constants.
 *   - Repeated actions are absent here. Every page of the proven payload carried
 *     the identical "Get a quote" / phone-number pair; that is site config
 *     rendered seven times, not seven authored facts. routes.ts derives them by
 *     slot: hero primary asks for a quote (/get-quote), hero secondary calls, and
 *     the closing band books (/booking, or /get-quote where the client publishes
 *     no booking page — siteConfig.routes.booking).
 *   - Nav (`services`, `areas`) and the whole `site` block are absent here. They
 *     come from site.config.ts and the services/areas collections, so a phone
 *     number can never disagree with itself across pages.
 *
 * What is left is the words and the pictures — which is all a writer should be
 * deciding.
 */
import { z } from 'astro/zod';

/**
 * Every authored string passes through here. The refinement catches GHL merge
 * fields that survived import, for the same reason as content.config.ts: a stray
 * `{{custom_values.business_phone}}` renders literally on a live page, and failing
 * the build is the only place that reliably catches it.
 */
const prose = z
  .string()
  .min(1)
  .refine(
    (v) => !v.includes('{{'),
    'unresolved merge field — every {{custom_values.*}} token must be resolved at import time',
  );

/** Hand-tuned per page; the ≤160 cap is enforced, not trusted. */
const metaDescription = prose.max(160, 'metaDescription must be 160 characters or fewer');

const image = z.object({
  src: z.string().min(1),
  /** Pattern: "{subject} — {Brand} in {City}, {ST}" where sensible. */
  alt: prose,
});

/** URL safety only — this says nothing about what the page *is*. */
const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slug must be lowercase, hyphen-separated');

/**
 * The workhorse block, rendered by MediaSection.
 *
 * `body` is capped at 4 paragraphs because the design pairs copy with a single
 * image slot; a fifth paragraph runs past the image and the section falls apart.
 * The proven payload never exceeded 3.
 */
const section = z.object({
  eyebrow: prose.optional(),
  heading: prose,
  body: z.array(prose).min(1).max(4),
  /**
   * Paragraphs rendered as trusted HTML, for inline links only (`<a>`, `<strong>`,
   * `<em>`). Appended after `body`. Use sparingly — it is the one place authored
   * text bypasses escaping.
   */
  bodyHtml: z.array(prose).max(2).optional(),
  image: image.optional(),
  /** The three-up figure row. All-or-nothing: two reads thin, five wraps badly. */
  stats: z.array(z.object({ value: prose, label: prose })).min(2).max(4).optional(),
});

/**
 * A section whose heading is optional — used where the page's H1 already says it
 * and a second heading would be redundant (service and area intros).
 */
const leadSection = section.extend({ heading: prose.optional() });

/**
 * Page hero. `heading` becomes the H1; `eyebrow` is the category line above it.
 *
 * Video is the standard for the home hero and `image` doubles as its poster —
 * both optional here so an area or service page can run the compact hero with no
 * media at all.
 */
const hero = z.object({
  eyebrow: prose,
  heading: prose,
  /** Scrolling proof strip. Home page only in practice; 3–8 keeps it reading as a list. */
  ticker: z.array(prose).min(3).max(8).optional(),
  image: image.optional(),
  video: z.object({ src: z.string().min(1) }).optional(),
});

/**
 * Closing conversion band. The action is NOT authored — this slot is always the
 * booking action (routes.ts), and letting a writer retype it is how a site ends up
 * with four different labels for the same button.
 */
const cta = z.object({
  eyebrow: prose.optional(),
  heading: prose,
  body: prose.optional(),
  /** Single emphasised line under the body, e.g. "If your vehicle needs attention, do not wait!" */
  emphasis: prose.optional(),
  image: image.optional(),
});

/** Follow-us band. The links themselves come from config's socials. */
const social = z
  .object({
    heading: prose,
    body: prose.optional(),
    image: image.optional(),
  })
  .optional();

const faqItems = z.array(z.object({ question: prose, answer: prose }));

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

/**
 * /  — home.md
 *
 * The service grid is not authored here: it is built from the services
 * collection, so adding a service page adds the card automatically.
 */
export const guildHomeSchema = z.object({
  metaDescription,
  /** Overrides the SEO formula's <title>. Optional — the formula is usually right. */
  title: prose.optional(),
  hero,
  /** "No Shop. No Drop-Off. No Waiting." — the problem the business solves. */
  introduction: section,
  /** The differentiator block ("Honest Pricing: No Hidden Fees"). Carries the stats row. */
  promise: section,
  /** Heading above the service grid. Authored so it can name the trade. */
  servicesHeading: prose,
  /** "Every Vehicle. Any Size. One Standard of Care." — the who-we-are block. */
  about: section,
  social,
  /** Copy above the coverage grid; the area tiles come from the areas collection. */
  areaSection: z.object({
    heading: prose.optional(),
    intro: prose,
    map: image.optional(),
  }),
  cta,
});

export type GuildHome = z.infer<typeof guildHomeSchema>;

/**
 * /{service} — content/services/*.md
 *
 * `included`, `process`, and `addOns` are optional because not every service has
 * them. A maintenance wash has no five-step process worth publishing, and
 * inventing one to satisfy a schema is inventing a product.
 */
export const guildServiceSchema = z.object({
  /** Display name, used in nav and on the service card. */
  name: prose,
  /** Must match the filename and the live URL: /{slug} */
  slug,
  order: z.number().int().nonnegative(),
  /** One-liner reused by the service grid and related-service links. */
  shortDescription: prose,
  metaDescription,
  title: prose.optional(),

  /** The image on this service's card in every service grid across the site. */
  cardImage: image,

  hero,
  /** Opening copy. Heading optional — the hero H1 usually carries it. */
  intro: leadSection,
  /** "What Is Full Auto Detailing?" — the educational block. */
  overview: section,

  /** The two-panel checklist ("Exterior Wash & Detail" / "Interior Detail & Clean"). */
  included: z
    .object({
      heading: prose,
      panels: z
        .array(
          z.object({
            eyebrow: prose.optional(),
            heading: prose,
            image: image.optional(),
            /** 4–10 lines: fewer looks thin beside the image, more overruns the panel. */
            items: z.array(prose).min(4).max(10),
          }),
        )
        .min(1)
        .max(3),
    })
    .optional(),

  /** Numbered process steps. 3–6 — below three it is not a process, above six nobody reads it. */
  process: z
    .object({
      heading: prose,
      image: image.optional(),
      steps: z.array(z.object({ title: prose, body: prose })).min(3).max(6),
    })
    .optional(),

  addOnsHeading: prose.optional(),
  addOns: z.array(section).max(4).default([]),

  /** "Why Auto Detailing Matters" — the stakes block, and where internal links belong. */
  why: section,
  social,
  /** Service-specific questions. The site-wide ones live on /faqs. */
  faqs: faqItems.min(3).max(8),
  cta,
});

export type GuildService = z.infer<typeof guildServiceSchema>;

/**
 * /{area} — content/areas/*.md
 *
 * `state` is optional for the same reason as the engine's areas collection: not
 * every service area is a US city, and "Teterboro Airport (KTEB), NJ" is not how
 * anyone writes it.
 */
export const guildAreaSchema = z.object({
  name: prose,
  slug,
  state: z
    .string()
    .length(2)
    .regex(/^[A-Z]{2}$/)
    .optional(),
  order: z.number().int().nonnegative(),
  /** Marks the home base. Exactly one area should set it. */
  isHeadquarters: z.boolean().default(false),
  metaDescription,
  title: prose.optional(),

  hero,
  /** One-paragraph "we come to you here" opener above the fold. */
  intro: leadSection,
  /** "Why Mobile Detailing in Alexandria?" — the local-conditions argument. */
  why: section,
  /** The neighbourhood list. Genuinely local proof, so it is required, not optional. */
  neighborhoods: section,
  social,
  /** "The San Mob Detailing Guarantee" — the closing trust block. */
  guarantee: section,
  cta,
});

export type GuildArea = z.infer<typeof guildAreaSchema>;

/** /about — about.md */
export const guildAboutSchema = z.object({
  metaDescription,
  title: prose.optional(),
  hero,
  /** Founding story. */
  story: section,
  /** "How {Brand} Works" — the operating standard. */
  process: section,
  /** Optional copy above the service grid. */
  servicesIntro: z.array(prose).max(2).optional(),
  cta,
});

export type GuildAbout = z.infer<typeof guildAboutSchema>;

/**
 * /faqs — faqs.md
 *
 * Grouped rather than flat: the proven payload ran 16 questions, which is
 * unreadable as one list. Groups are capped at 6 so the page keeps a shape.
 */
export const guildFaqsSchema = z.object({
  metaDescription,
  title: prose.optional(),
  hero,
  /** Short lead-in. `bodyHtml` earns its place here — this is where the phone link goes. */
  intro: leadSection.optional(),
  groups: z
    .array(
      z.object({
        heading: prose,
        items: faqItems.min(2).max(8),
      }),
    )
    .min(1)
    .max(6),
  /** "Still Have Questions?" sign-off. */
  outro: section.optional(),
  cta,
});

export type GuildFaqs = z.infer<typeof guildFaqsSchema>;

/**
 * /get-quote — get-quote.md
 *
 * Contact details, hours, and the form URL come from site config; this authors
 * only the prose around them, so nothing here can drift from the config record.
 * `hours` is the one exception — a client whose booking hours differ from the
 * footer's opening hours overrides them here.
 */
export const guildQuoteSchema = z.object({
  metaDescription,
  title: prose.optional(),
  hero,
  quote: z.object({
    eyebrow: prose.optional(),
    heading: prose,
    hours: z.array(z.object({ days: prose, hours: prose })).min(1).max(7).optional(),
    /** Short tagline under the contact details, e.g. "Based in Alexandria, VA — we come to you". */
    note: prose.optional(),
    image: image.optional(),
  }),
  cta: cta.optional(),
});

export type GuildQuote = z.infer<typeof guildQuoteSchema>;

/**
 * /booking — booking.md
 *
 * A router, not a form: each vehicle type hands off to its own external scheduler,
 * because a boat and a golf cart are not the same appointment. Published only when
 * siteConfig.routes.booking is true; a client without it sends every booking button
 * to /get-quote instead (routes.ts).
 */
export const guildBookingSchema = z.object({
  metaDescription,
  title: prose.optional(),
  hero,
  vehiclesHeading: prose,
  /** Lead-in under the grid heading. One paragraph — it sits above the cards. */
  vehiclesIntro: z.array(prose).max(2).optional(),
  /**
   * One card per bookable vehicle type. `href` is absolute and off-site by design —
   * it is the client's GHL scheduler for that type, so z.url() rather than a path.
   *
   * Uncapped: how many vehicle types a client books is a fact about their business,
   * not a design constraint. The grid reflows three-up at any count.
   */
  vehicles: z
    .array(
      z.object({
        label: prose,
        href: z.url(),
        image,
      }),
    )
    .min(1),
  /**
   * The "Need Help Choosing a Service?" band. `image` is required and is a portrait
   * of the owner — this section exists to put a face next to the phone number, so a
   * payload without one should fail rather than render an empty frame.
   */
  cta: z.object({
    eyebrow: prose.optional(),
    heading: prose,
    body: prose.optional(),
    emphasis: prose.optional(),
    image,
    /** Optional label under the portrait, e.g. "Sanjar — owner". */
    caption: prose.optional(),
  }),
  /**
   * Google reviews embed. Optional as a section, but `src` is required once the
   * section is present: a heading over a placeholder box is worse than no section.
   */
  reviews: z
    .object({
      heading: prose,
      intro: prose.optional(),
      /** Business Profile embed URL. */
      src: z.url(),
      /** Reserved height, e.g. "32rem". Defaults in the component. */
      height: z.string().min(1).optional(),
    })
    .optional(),
});

export type GuildBooking = z.infer<typeof guildBookingSchema>;

/**
 * /blog + /post/{slug} — content/blog/*.md
 *
 * Mirrors what the blog-writer skill already emits, so posts written for the
 * engine's existing blog collection load unchanged. `body` holds markdown-ish
 * paragraphs, including `## ` headings.
 */
export const guildBlogPostSchema = z.object({
  title: prose,
  slug,
  date: z.coerce.string(),
  author: prose,
  authorBio: prose.optional(),
  authorImage: image.optional(),
  category: prose,
  tags: z.array(prose).max(6).optional(),
  metaTitle: prose,
  metaDescription,
  heroImage: image,
  /** Per-post override for the closing CTA; falls back to site defaults. */
  ctaImage: image.optional(),
  ctaEyebrow: prose.optional(),
  ctaHeadline: prose.optional(),
  ctaBody: prose.optional(),
  body: z.array(prose).min(1),
  faq: z.array(z.object({ q: prose, a: prose })).min(1).max(8),
  images: z
    .array(
      z.object({
        id: z.number().int().positive(),
        type: z.enum(['hero', 'inline']),
        section: prose,
        /** Generation brief for scripts/generate-images.mjs. */
        idea: z.string(),
        alt: z.string(),
        prompt: z.string(),
        src: z.string().min(1).optional(),
        /** Places an inline image directly after this `## ` heading in `body`. */
        afterHeading: prose.optional(),
      }),
    )
    .min(1),
});

export type GuildBlogPostEntry = z.infer<typeof guildBlogPostSchema>;

/** /blog index copy. The post list comes from the collection. */
export const guildBlogIndexSchema = z.object({
  metaDescription,
  title: prose.optional(),
  hero,
});

export type GuildBlogIndex = z.infer<typeof guildBlogIndexSchema>;
