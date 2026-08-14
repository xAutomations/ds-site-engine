/**
 * Prototype content contract for the Detailers Guild template.
 *
 * These interfaces deliberately live beside the template rather than in
 * content.config.ts. They describe what the finished compositions need; the next
 * phase can translate the proven contract into Zod collections without forcing the
 * design to conform to the aviation template's content model.
 */
export interface GuildImage {
  src: string;
  alt: string;
}

export interface GuildLink {
  label: string;
  href: string;
}

export interface GuildNavItem extends GuildLink {
  summary?: string;
  image?: GuildImage;
}

export interface GuildSiteData {
  accentColor: string;
  /**
   * Label colour on an accent fill, and accent-as-text on paper. Both derived from
   * accentColor for WCAG AA (see theme.ts) rather than assumed to be white and a
   * fixed dark mix. Optional so template-preview can supply an accent alone.
   */
  onAccent?: string;
  accentDark?: string;
  brand: {
    name: string;
    blurb: string;
  };
  contact: {
    phone: string;
    phoneDisplay: string;
    email: string;
    address: string;
  };
  serviceAreaLabel: string;
  /** Short "Our Location" paragraph in the footer. */
  locationBlurb?: string;
  hours?: Array<{ days: string; hours: string }>;
  socials: GuildLink[];
  favicon?: string;
}

export interface GuildShellData {
  site: GuildSiteData;
  title: string;
  description: string;
  path: string;
  /**
   * Self-referencing canonical, already absolute and trailing-slashed. Derived by
   * the route (lib/seo canonical()), never authored — and passed in rather than
   * computed here so template-preview can render without a client payload.
   */
  canonical?: string;
  /** Absolute, built URL for OG/Twitter cards. */
  ogImage?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogType?: 'website' | 'article';
  noindex?: boolean;
  jsonLd?: Array<Record<string, unknown>>;
  services: GuildNavItem[];
  areas: GuildNavItem[];
}

export interface GuildHeroData {
  eyebrow: string;
  heading: string;
  primaryAction?: GuildLink;
  secondaryAction?: GuildLink;
  image?: GuildImage;
  /** Background video (muted loop, grayscale); `image` doubles as its poster. */
  video?: { src: string };
  ticker?: string[];
  compact?: boolean;
}

export interface GuildSocialData {
  heading: string;
  body?: string;
  links: GuildLink[];
  image?: GuildImage;
}

export interface GuildAreaSectionData {
  heading?: string;
  intro?: string;
  map?: GuildImage;
}

export interface GuildContentSection {
  eyebrow?: string;
  heading?: string;
  /** Renders the heading a step larger (between dg-heading and dg-display). */
  large?: boolean;
  /** Renders the heading a step smaller than the default dg-heading. */
  small?: boolean;
  body: string[];
  /** Paragraphs rendered as trusted HTML (inline links, bold, etc). Appended after `body`. */
  bodyHtml?: string[];
  /** Renders body copy larger than default prose. */
  lead?: boolean;
  image?: GuildImage;
  action?: GuildLink;
  secondaryAction?: GuildLink;
  reversed?: boolean;
  /** Drops the section's bottom rule so it flows into the next section. */
  seamless?: boolean;
  stats?: Array<{ value: string; label: string }>;
}

export interface GuildProcessStep {
  title: string;
  body: string;
}

export interface GuildProcessData {
  heading: string;
  steps: GuildProcessStep[];
  image?: GuildImage;
}

export interface GuildFaqItem {
  question: string;
  answer: string;
}

export interface GuildFaqGroup {
  heading: string;
  items: GuildFaqItem[];
}

export interface GuildIncludedPanel {
  eyebrow?: string;
  heading: string;
  image?: GuildImage;
  items: string[];
  action?: GuildLink;
}

export interface GuildIncludedData {
  heading: string;
  panels: GuildIncludedPanel[];
}

export interface GuildServiceCard extends GuildNavItem {
  image: GuildImage;
}

/**
 * A vehicle type on the booking page. Same card as a service, but `href` points at
 * the client's external GHL scheduler rather than a page on this site — one calendar
 * per vehicle type, because a boat and a golf cart are not the same appointment.
 */
export type GuildVehicleCard = GuildServiceCard;

/**
 * Closing CTA built around a portrait rather than a full-bleed background.
 *
 * Distinct from GuildCtaData: ConversionBanner treats its image as scenery behind
 * the copy, which crops a person badly and loses the face at small sizes. Here the
 * image IS the content, so it sits beside the copy at a portrait ratio and is
 * required rather than optional.
 */
export interface GuildOwnerCtaData {
  eyebrow?: string;
  heading: string;
  body?: string;
  emphasis?: string;
  image: GuildImage;
  action: GuildLink;
  secondaryAction?: GuildLink;
  /** Caption under the portrait, e.g. "Sanjar — owner". */
  caption?: string;
}

/**
 * Google reviews pulled from the client's Business Profile.
 *
 * The embed is a third-party iframe we cannot style, so it is boxed and given a
 * reserved height to keep it from shifting layout as it loads. Absent `src`, a
 * placeholder marks the slot the way the quote form does.
 */
export interface GuildReviewsData {
  heading: string;
  intro?: string;
  src?: string;
  /** Reserved height for the embed. */
  height?: string;
}

/** Mirrors the `blog` content-collection entry data produced by the blog-writer skill. */
export interface GuildBlogPost {
  title: string;
  slug: string;
  date: string;
  author: string;
  authorBio?: string;
  authorImage?: GuildImage;
  category: string;
  tags?: string[];
  metaTitle: string;
  metaDescription: string;
  heroImage: GuildImage;
  ctaImage?: GuildImage;
  ctaEyebrow?: string;
  ctaHeadline?: string;
  ctaBody?: string;
  body: string[];
  faq: Array<{ q: string; a: string }>;
  images: Array<{
    id: number;
    type: 'hero' | 'inline';
    section: string;
    idea: string;
    alt: string;
    prompt: string;
    src?: string;
    afterHeading?: string;
  }>;
}

export interface GuildQuoteData {
  eyebrow?: string;
  heading: string;
  /** Hours shown on the quote page (may differ from the footer's). */
  hours?: Array<{ days: string; hours: string }>;
  /** Short tagline under the contact details, e.g. "Based in Alexandria, VA — we come to you". */
  note?: string;
  /** Image shown below the note in the details column. */
  image?: GuildImage;
  /** Form embed URL; when absent a placeholder box marks the iframe slot. */
  formSrc?: string;
  /** Minimum height reserved for the embedded form. */
  formHeight?: string;
}

/**
 * A resolved legal document, ready to render.
 *
 * The route decides where the text came from — the payload's own
 * content/legal/*.md, or the shared boilerplate generated from config by
 * lib/legal.ts — so the component never has to know or care.
 */
export interface GuildLegalDoc {
  title: string;
  intro: string[];
  /** Accent line closing the intro, e.g. "By booking, you agree to these terms." */
  emphasis?: string;
  sections: Array<{
    heading: string;
    body?: string[];
    bullets?: Array<{ term?: string; text: string }>;
    /** Pulled out of the body into a tinted callout — fees, limits, deadlines. */
    note?: string;
  }>;
  contact: { heading: string; intro: string };
}

export interface GuildCtaData {
  eyebrow?: string;
  heading: string;
  small?: boolean;
  body?: string;
  emphasis?: string;
  action: GuildLink;
  image?: GuildImage;
}
