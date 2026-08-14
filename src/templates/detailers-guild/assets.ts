/**
 * Asset URLs for the places a component needs a string rather than an element —
 * a <video src>, a poster attribute.
 *
 * Same rule as GuildImg.astro: a payload-relative path is resolved (and fails the
 * build when the file is missing), anything already addressable is returned as-is so
 * template-preview's public/ files keep working with no payload present.
 */
import { imageUrl, videoUrl } from '../../lib/assets';

/** Anything a browser can already fetch: absolute path, protocol, or data URI. */
function isUrl(src: string): boolean {
  return /^(https?:)?\/\//.test(src) || src.startsWith('/') || src.startsWith('data:');
}

export function guildVideoUrl(src: string): string {
  return isUrl(src) ? src : videoUrl(src);
}

/**
 * Poster frames are jpeg rather than webp: a poster is the LCP element on a hero,
 * and it is decoded before the video has buffered, so the widest possible decoder
 * support beats a few kilobytes.
 */
export async function guildPosterUrl(src: string): Promise<string> {
  return isUrl(src) ? src : await imageUrl(src, 1600, 'jpeg');
}
