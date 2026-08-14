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
  ogImage?: string;
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

export interface GuildCtaData {
  eyebrow?: string;
  heading: string;
  small?: boolean;
  body?: string;
  emphasis?: string;
  action: GuildLink;
  image?: GuildImage;
}
