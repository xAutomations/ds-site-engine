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
  index?: string;
  eyebrow?: string;
  heading?: string;
  /** Renders the heading a step larger (between dg-heading and dg-display). */
  large?: boolean;
  /** Renders the heading a step smaller than the default dg-heading. */
  small?: boolean;
  body: string[];
  image?: GuildImage;
  action?: GuildLink;
  secondaryAction?: GuildLink;
  reversed?: boolean;
  patterned?: boolean;
  stats?: Array<{ value: string; label: string }>;
}

export interface GuildServiceCard extends GuildNavItem {
  image: GuildImage;
}

export interface GuildCtaData {
  eyebrow?: string;
  heading: string;
  body?: string;
  emphasis?: string;
  action: GuildLink;
  image?: GuildImage;
}
