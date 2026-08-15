/**
 * Resolves payload assets to built URLs.
 *
 * In-page images go through Img.astro / astro:assets. This module handles the two
 * cases that cannot: the hero video, and og:image (a meta tag needs an absolute URL,
 * not an <img>).
 */
import { getImage } from 'astro:assets';
const videos = import.meta.glob('../../client/assets/**/*.{webm,mp4}', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const images = import.meta.glob<{ default: ImageMetadata }>(
  '../../client/assets/**/*.{jpeg,jpg,png,webp,avif}',
  { eager: true },
);

/**
 * Source-format preference, best first.
 *
 * A payload names an asset once (`./assets/logo.png`) but the file it gets handed
 * may arrive in any of these formats, and which one a client sends is not a fact
 * worth editing config over. So the extension in a payload path is treated as a
 * hint, not an address: the resolver takes the basename and picks the best format
 * actually on disk. WebP first because it is the smallest at equal quality; JPEG
 * next; PNG last, since a photograph saved as PNG is several times the size of
 * either. `jpeg` sits beside `jpg` as the same format under a longer name.
 */
const FORMAT_PRIORITY = ['webp', 'jpg', 'jpeg', 'png'] as const;

/**
 * Finds the glob key for a payload-relative `src`, preferring the best available
 * source format over the one the payload happened to name.
 *
 * Falls back to an exact match so formats outside the priority list (svg, avif)
 * still resolve by their literal path. Takes the glob record as an argument
 * because Vite requires every `import.meta.glob` pattern to be a static literal in
 * the file that calls it — the records cannot be shared, but this logic can.
 */
export function resolveAssetKey(
  src: string,
  assets: Record<string, unknown>,
): string | undefined {
  const path = src.replace(/^\.\//, '');
  const base = path.replace(/\.[^./]+$/, '');

  for (const ext of FORMAT_PRIORITY) {
    const key = `../../client/${base}.${ext}`;
    if (assets[key]) return key;
  }

  const exact = `../../client/${path}`;
  return assets[exact] ? exact : undefined;
}

/**
 * Absolute, built URL for an og:image.
 *
 * Naively turning "./assets/hero.jpg" into "{site}/assets/hero.jpg" produces a 404 —
 * Astro emits hashed files under /_astro. Every og:image on the site pointed at a
 * non-existent path until this was added, and nothing caught it: Lighthouse does not
 * fetch og:image, and a link checker only inspects href/src, not meta content.
 *
 * JPEG rather than WebP: several social scrapers still do not render WebP previews.
 */
export async function ogImageUrl(
  src: string,
  siteUrl: string,
): Promise<{ url: string; width: number; height: number }> {
  const key = resolveAssetKey(src, images);
  const entry = key ? images[key] : undefined;
  if (!entry) {
    const available = Object.keys(images).map((k) => k.replace('../../client/', './'));
    throw new Error(
      `Missing og:image asset "${src}".\n` +
        `Expected the file at client/${src.replace(/^\.\//, '')} ` +
        `(any of ${FORMAT_PRIORITY.join(', ')}).\n` +
        `Available:\n${available.map((a) => `  · ${a}`).join('\n')}`,
    );
  }

  const built = await getImage({ src: entry.default, width: 1200, format: 'jpeg' });
  return {
    url: new URL(built.src, siteUrl).href,
    width: built.attributes.width ?? 1200,
    height: built.attributes.height ?? 630,
  };
}

/** Built URL for places that need an image URL rather than an `<Image>` element. */
export async function imageUrl(
  src: string,
  width = 1600,
  format: 'webp' | 'png' | 'jpeg' = 'webp',
): Promise<string> {
  const key = resolveAssetKey(src, images);
  const entry = key ? images[key] : undefined;
  if (!entry) {
    throw new Error(
      `Missing payload image "${src}" (looked for any of ${FORMAT_PRIORITY.join(', ')}).`,
    );
  }

  return (await getImage({ src: entry.default, width, format })).src;
}

/**
 * Like imageUrl, but returns undefined instead of throwing when the file is absent.
 *
 * For assets a payload may or may not ship, where the caller has a fallback and the
 * absence is not an error — the footer logo being the case this exists for. Anything
 * a page genuinely requires should use imageUrl, so a missing file still fails the
 * build rather than rendering a hole.
 */
export async function optionalImageUrl(
  src: string,
  width = 1600,
  format: 'webp' | 'png' | 'jpeg' = 'webp',
): Promise<string | undefined> {
  const key = resolveAssetKey(src, images);
  if (!key) return undefined;
  return (await getImage({ src: images[key].default, width, format })).src;
}

export function videoUrl(src: string): string {
  const key = `../../client/${src.replace(/^\.\//, '')}`;
  const url = videos[key];
  if (!url) {
    const available = Object.keys(videos).map((k) => k.replace('../../client/', './'));
    throw new Error(
      `Missing payload video "${src}".\n` +
        `Expected the file at client/${src.replace(/^\.\//, '')}.\n` +
        (available.length
          ? `Available videos:\n${available.map((a) => `  · ${a}`).join('\n')}`
          : 'No video files found in client/assets/.'),
    );
  }
  return url;
}
