/**
 * Derives everything a Guild page needs but must not author: site facts, nav,
 * canonical URL, OG image, and structured data.
 *
 * WHY THIS IS NOT A COMPONENT
 * Guild components are props-pure so template-preview can render them with no client
 * payload (see routes.ts). This module is the opposite — it reaches for siteConfig,
 * the content collections, and astro:assets, and therefore only ever runs inside a
 * real build, called from the route files. The preview never imports it; it passes
 * fixture values into the same props instead.
 *
 * It is also the answer to why the Guild layout has no SEO logic of its own: every
 * derived value is computed once here and handed to SiteLayout as data.
 */
import { getCollection } from 'astro:content';
import { areaLabel, assertUniqueSlugs } from '../../lib/content';
import { siteConfig } from '../../lib/site-config';
import { imageUrl, ogImageUrl } from '../../lib/assets';
import {
  areaBreadcrumbJsonLd,
  blogPostingJsonLd,
  buildHomeTitle,
  buildTitle,
  canonical,
  faqPageJsonLd,
  localBusinessJsonLd,
  serviceBreadcrumbJsonLd,
  serviceJsonLd,
  webPageJsonLd,
  webSiteJsonLd,
} from '../../lib/seo';
import { assertGuildAccent, resolveGuildAccent } from './theme';
import type { GuildNavItem, GuildServiceCard, GuildShellData, GuildSiteData } from './types';

/**
 * Checked once at module load rather than per page: the accent is one config value,
 * and a failure should stop the build immediately rather than on whichever page
 * happens to render first.
 */
assertGuildAccent(siteConfig.theme.accentColor, siteConfig.theme.mode);

/**
 * The Guild collections, ordered the way the nav and grids render them.
 *
 * These are this template's own collections (content.config.ts keeps one schema per
 * collection so both templates keep exact types), so no casting is needed anywhere.
 */
async function guildCollections() {
  const [services, areas] = await Promise.all([
    getCollection('guildServices'),
    getCollection('guildAreas'),
  ]);
  /**
   * Services and areas both render at /{slug}, so a shared slug means one silently
   * overwrites the other. Checked on every read, exactly as the aviation accessors
   * do it — an earlier version of these helpers skipped the guard, which would have
   * shipped a missing page as a passing build.
   */
  assertUniqueSlugs(services, areas);
  return { services, areas };
}

export async function guildServiceEntries() {
  const { services } = await guildCollections();
  return services.sort((a, b) => a.data.order - b.data.order);
}

/** Posts, newest first. Guild's own collection, so its own contract. */
export async function guildBlogEntries() {
  const posts = await getCollection('guildBlog');
  return posts.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
}

export async function guildAreaEntries() {
  const { areas } = await guildCollections();
  return areas.sort((a, b) => a.data.order - b.data.order);
}

/**
 * Config → the template's site contract.
 *
 * The mapping is deliberate rather than a spread: the Guild footer wants one address
 * string where config stores structured parts, and an ordered social list where
 * config stores an object. Doing it here means no component ever formats a NAP.
 */
export function guildSite(): GuildSiteData {
  const { brand, contact, serviceArea, hours, socials, theme } = siteConfig;
  const { street, city, state, zip } = contact.address;

  /**
   * Ordered, not Object.entries: the object's key order is whatever the payload
   * happened to type, and the footer's icon row should not reshuffle between
   * clients. YouTube has no GuildIcon glyph, so it renders as a text label.
   */
  const socialLinks: GuildSiteData['socials'] = [
    ['Facebook', socials.facebook],
    ['Instagram', socials.instagram],
    ['TikTok', socials.tiktok],
    ['YouTube', socials.youtube],
  ].flatMap(([label, href]) => (href ? [{ label: label as string, href }] : []));

  const accent = resolveGuildAccent(theme.accentColor, theme.mode);

  return {
    accentColor: accent.accent,
    onAccent: accent.onAccent,
    accentDark: accent.accentDark,
    accentOnLight: accent.accentOnLight,
    mode: theme.mode,
    brand: { name: brand.name, blurb: brand.blurb },
    contact: {
      phone: contact.phone,
      phoneDisplay: contact.phoneDisplay,
      email: contact.email,
      address: `${street}, ${city}, ${state} ${zip}`,
    },
    serviceAreaLabel: serviceArea.label,
    /**
     * The footer's "Our Location" paragraph. brand.footerNote is the same slot under
     * a different name — the closing sentence of the footer contact column — so it
     * is reused rather than adding a second field that says the same thing.
     */
    locationBlurb: brand.footerNote,
    hours,
    socials: socialLinks,
    favicon: brand.faviconPath,
  };
}

/** Services and areas as nav items. Both grids and both dropdowns read these. */
export async function guildNav(): Promise<{ services: GuildNavItem[]; areas: GuildNavItem[] }> {
  const [services, areas] = await Promise.all([guildServiceEntries(), guildAreaEntries()]);

  return {
    services: services.map((entry) => ({
      label: entry.data.name,
      href: `/${entry.data.slug}`,
      summary: entry.data.shortDescription,
    })),
    areas: areas.map((entry) => ({
      label: areaLabel(entry.data),
      href: `/${entry.data.slug}`,
    })),
  };
}

/**
 * Service cards for every grid on the site.
 *
 * The card image comes from each service's own `cardImage`, so adding a service page
 * adds its card everywhere automatically — home, about, and the area pages all read
 * this one list rather than authoring their own copies of it.
 */
export async function guildServiceCards(): Promise<GuildServiceCard[]> {
  const services = await guildServiceEntries();
  return services.map(({ data }) => ({
    label: data.name,
    href: `/${data.slug}`,
    summary: data.shortDescription,
    image: data.cardImage,
  }));
}

export interface GuildShellOptions {
  title: string;
  description: string;
  path: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
  /**
   * Payload-relative image for the share card, e.g. the page's hero. Falls back to
   * the hero video poster, so every page has a working preview rather than none.
   */
  ogImage?: string;
  /** Page-specific graph nodes, appended after the site-level ones. */
  jsonLd?: Array<Record<string, unknown>>;
  /** Authored FAQs on this page; emitted as an FAQPage node when present. */
  faqs?: Array<{ q: string; a: string }>;
}

/**
 * Builds the shell for one page.
 *
 * Every page gets WebSite + LocalBusiness + WebPage nodes in a single @graph, so the
 * business record is consistent site-wide and page nodes can reference it by @id.
 */
export async function guildShell(options: GuildShellOptions): Promise<GuildShellData> {
  const { title, description, path, ogType = 'website', noindex = false, faqs } = options;
  const { services, areas } = await guildNav();
  const areaFacts = (await guildAreaEntries()).map(({ data }) => ({
    name: data.name,
    state: data.state,
  }));
  /** The business node's makesOffer — every service, with its page URL. */
  const serviceFacts = (await guildServiceEntries()).map(({ data }) => ({
    name: data.name,
    slug: data.slug,
    description: data.shortDescription,
  }));

  const og = await ogImageUrl(
    options.ogImage ?? siteConfig.defaults.heroVideo.poster.src,
    siteConfig.site.url,
  );
  // PNG rather than WebP: the logo carries transparency, and this URL is consumed
  // by crawlers rather than browsers — the same reasoning as the aviation layout.
  const logoUrl = new URL(
    await imageUrl(siteConfig.brand.logoPath, 512, 'png'),
    siteConfig.site.url,
  ).href;

  const jsonLd = [
    webSiteJsonLd(siteConfig),
    localBusinessJsonLd(siteConfig, areaFacts, logoUrl, serviceFacts),
    webPageJsonLd(siteConfig, { title, description, path }),
    ...(faqs?.length ? [faqPageJsonLd(faqs)] : []),
    ...(options.jsonLd ?? []),
  ];

  return {
    site: guildSite(),
    title,
    description,
    path,
    canonical: canonical(siteConfig, path),
    ogImage: og.url,
    ogImageWidth: og.width,
    ogImageHeight: og.height,
    ogType,
    noindex,
    jsonLd,
    services,
    areas,
  };
}

/** Home's title targets the region rather than the base city (see lib/seo.ts). */
export function guildHomeTitle(): string {
  return buildHomeTitle(siteConfig);
}

/** `{Subject} | {Brand}` — for pages with no place to target (about, faqs, booking). */
export function guildPageTitle(subject: string): string {
  return `${subject} | ${siteConfig.brand.name}`;
}

/** `{Service|Category} in {Place}[, {ST}] | {Brand}` — service and area pages. */
export function guildLocalTitle(subject: string, place: string, state?: string): string {
  return buildTitle(siteConfig, subject, place, state);
}

/** The brand name, so routes can build a default title without importing config. */
export const brandName = siteConfig.brand.name;

/** Base city and state, for service-page titles that need a place. */
export const basePlace = {
  city: siteConfig.serviceArea.baseCity,
  state: siteConfig.serviceArea.baseState,
};

/**
 * Service-page graph nodes: what the business offers, where, plus the breadcrumb.
 * Kept here so a route file stays a wiring file.
 */
export async function guildServiceJsonLd(service: {
  name: string;
  description: string;
  slug: string;
}): Promise<Array<Record<string, unknown>>> {
  const areaFacts = (await guildAreaEntries()).map(({ data }) => ({
    name: data.name,
    state: data.state,
  }));

  return [
    serviceJsonLd(siteConfig, service, areaFacts),
    serviceBreadcrumbJsonLd(siteConfig, service),
  ];
}

/** Area-page breadcrumb — the service pages' sibling, same Home-anchored shape. */
export function guildAreaJsonLd(area: { name: string; slug: string }): Array<Record<string, unknown>> {
  return [areaBreadcrumbJsonLd(siteConfig, area)];
}

/**
 * Blog-post graph nodes: the BlogPosting entity the page's og:type=article implies.
 * The hero image resolves through the same built-URL path as og:image — the raw
 * `./assets/…` path would 404 (see lib/assets.ts).
 */
export async function guildBlogPostJsonLd(post: {
  title: string;
  slug: string;
  metaDescription: string;
  date: string;
  author: string;
  heroImage: { src: string };
}): Promise<Array<Record<string, unknown>>> {
  const hero = await ogImageUrl(post.heroImage.src, siteConfig.site.url);
  return [
    blogPostingJsonLd(
      siteConfig,
      {
        title: post.title,
        slug: post.slug,
        description: post.metaDescription,
        date: post.date,
        author: post.author,
      },
      hero.url,
    ),
  ];
}
