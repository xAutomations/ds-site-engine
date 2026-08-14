/**
 * Ordered access to the payload's collections. Nav, footer, grids and sitemap all
 * read through here so ordering is defined once.
 */
import { getCollection, getEntry } from 'astro:content';
import { siteConfig } from './site-config';

/**
 * Pure text helpers live in prose.ts, which imports no payload — that is what lets
 * the unit tests run on a runner with no client/ symlink. Re-exported here because
 * every template already reads them alongside the collection accessors.
 */
export { areaLabel, paragraphs, proseBlocks } from './prose';
export type { ProseBlock, ProsePoint } from './prose';

/**
 * Static routes that must never be shadowed by a payload slug. Both `services` and
 * `areas` render at `/{slug}`, so a collision either steals a page or silently wins
 * over a hand-built route depending on build order.
 */
const RESERVED_SLUGS = new Set([
  'about',
  'faqs',
  'get-quote',
  'quote-received',
  'privacy-policy',
  'tos',
  'styleguide',
  'blog',
  'post',
]);

/**
 * Guards the one invariant the slug format used to imply.
 *
 * Area slugs were previously required to end in `-{st}`, which made a collision with
 * a service slug impossible by construction — and also made non-city service areas
 * impossible. Now that slugs are free-form, the collision has to be checked outright.
 */
export function assertUniqueSlugs(
  services: Array<{ data: { slug: string } }>,
  areas: Array<{ data: { slug: string } }>,
): void {
  const seen = new Map<string, string>();
  const problems: string[] = [];

  for (const [collection, entries] of [
    ['services', services],
    ['areas', areas],
  ] as const) {
    for (const entry of entries) {
      const { slug } = entry.data;

      if (RESERVED_SLUGS.has(slug)) {
        problems.push(`  · "${slug}" (${collection}) collides with the static route /${slug}`);
        continue;
      }

      const owner = seen.get(slug);
      if (owner) {
        problems.push(`  · "${slug}" is used by both ${owner} and ${collection}`);
        continue;
      }

      seen.set(slug, collection);
    }
  }

  if (problems.length) {
    throw new Error(
      `Slug collisions in the payload — every page renders at /{slug}, so these overwrite each other:\n${problems.join('\n')}`,
    );
  }
}

/**
 * The active template's pages, normalised to the fields every template shares.
 *
 * Template-agnostic endpoints (llms.txt, and anything else in src/pages) need to know
 * what exists at /{slug} without caring which contract produced it. Returning a flat
 * shape rather than the entries themselves keeps the two schemas from leaking out as
 * a union that nothing downstream can narrow.
 */
export async function getPageIndex(): Promise<{
  services: Array<{ name: string; slug: string; summary: string }>;
  areas: Array<{ name: string; slug: string; state?: string; summary: string }>;
}> {
  if (siteConfig.template === 'detailers-guild') {
    const [services, areas] = await Promise.all([
      getCollection('guildServices'),
      getCollection('guildAreas'),
    ]);
    assertUniqueSlugs(services, areas);
    return {
      services: services
        .sort((a, b) => a.data.order - b.data.order)
        .map(({ data }) => ({ name: data.name, slug: data.slug, summary: data.metaDescription })),
      areas: areas
        .sort((a, b) => a.data.order - b.data.order)
        .map(({ data }) => ({
          name: data.name,
          slug: data.slug,
          state: data.state,
          summary: data.metaDescription,
        })),
    };
  }

  const [services, areas] = await Promise.all([getServices(), getAreas()]);
  return {
    services: services.map(({ data }) => ({
      name: data.name,
      slug: data.slug,
      summary: data.metaDescription,
    })),
    areas: areas.map(({ data }) => ({
      name: data.name,
      slug: data.slug,
      state: data.state,
      summary: data.metaDescription,
    })),
  };
}

export async function getServices() {
  const [services, areas] = await Promise.all([
    getCollection('services'),
    getCollection('areas'),
  ]);
  assertUniqueSlugs(services, areas);
  return services.sort((a, b) => a.data.order - b.data.order);
}

export async function getAreas() {
  const [services, areas] = await Promise.all([
    getCollection('services'),
    getCollection('areas'),
  ]);
  assertUniqueSlugs(services, areas);
  return areas.sort((a, b) => a.data.order - b.data.order);
}

/** Singleton pages. Throw loudly rather than rendering an empty page. */
async function getSingleton<C extends 'home' | 'about' | 'faqs' | 'getQuote' | 'quoteReceived'>(
  collection: C,
  file: string,
) {
  const entry = await getEntry(collection, file);
  if (!entry) {
    throw new Error(
      `Missing payload file: client/content/${file}.md\n\n` +
        `If that file exists on disk, this is a stale dev server, not a missing file. ` +
        `Its content store was built for a different state of the payload and nothing ` +
        `invalidated it. Two things do that, and neither produces a watcher event:\n` +
        `  · the client link moved (pnpm use <slug>, or a DS_CLIENT=<slug> build or ` +
        `stress run in another terminal — those repoint client/ too). The glob resolves ` +
        `through the symlink to clients/<slug>/, so the watcher never sees the swap.\n` +
        `  · src/content.config.ts changed, which clears the store before it is rebuilt.\n\n` +
        `Either way: astro dev stop, then pnpm dev.`,
    );
  }
  return entry;
}

export const getHome = () => getSingleton('home', 'home');
export const getAbout = () => getSingleton('about', 'about');
export const getFaqs = () => getSingleton('faqs', 'faqs');
export const getGetQuote = () => getSingleton('getQuote', 'get-quote');
export const getQuoteReceived = () => getSingleton('quoteReceived', 'quote-received');

/**
 * Authored legal override. Returns undefined when the payload does not carry one,
 * which is the common case — the caller then falls back to the lib/legal.ts template.
 */
export async function getLegalDoc(id: 'privacy-policy' | 'tos') {
  return await getEntry('legal', id);
}

export async function getBlogPosts() {
  const posts = await getCollection('blog');
  return posts.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
}

export async function getBlogPost(slug: string) {
  const posts = await getCollection('blog');
  return posts.find((p) => p.data.slug === slug);
}

