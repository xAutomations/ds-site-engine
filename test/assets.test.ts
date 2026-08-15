import { describe, expect, it } from 'vitest';
import { resolveAssetKey } from '../src/lib/assets';

/**
 * A payload names each asset once, but clients hand over whatever format they have.
 * These lock the rule that the extension in a payload path is a hint rather than an
 * address: the best format actually on disk wins, so a client swapping logo.png for
 * logo.webp needs no config edit.
 */
const assets = (...paths: string[]) =>
  Object.fromEntries(paths.map((p) => [`../../client/${p}`, {}]));

describe('resolveAssetKey', () => {
  it('prefers webp over jpg and png', () => {
    const files = assets('assets/logo.png', 'assets/logo.jpg', 'assets/logo.webp');
    expect(resolveAssetKey('./assets/logo.png', files)).toBe('../../client/assets/logo.webp');
  });

  it('prefers jpg over png when there is no webp', () => {
    const files = assets('assets/logo.png', 'assets/logo.jpg');
    expect(resolveAssetKey('./assets/logo.webp', files)).toBe('../../client/assets/logo.jpg');
  });

  it('falls back to png as the last of the three', () => {
    const files = assets('assets/logo.png');
    expect(resolveAssetKey('./assets/logo.webp', files)).toBe('../../client/assets/logo.png');
  });

  it('treats jpeg as jpg under a longer name', () => {
    const files = assets('assets/logo.jpeg', 'assets/logo.png');
    expect(resolveAssetKey('./assets/logo.png', files)).toBe('../../client/assets/logo.jpeg');
  });

  it('resolves with or without the leading "./"', () => {
    const files = assets('assets/logo.webp');
    expect(resolveAssetKey('assets/logo.png', files)).toBe('../../client/assets/logo.webp');
  });

  it('resolves formats outside the priority list by exact path', () => {
    const files = assets('assets/mark.svg');
    expect(resolveAssetKey('./assets/mark.svg', files)).toBe('../../client/assets/mark.svg');
  });

  it('keeps nested paths intact', () => {
    const files = assets('assets/blog/post-hero.webp');
    expect(resolveAssetKey('./assets/blog/post-hero.jpg', files)).toBe(
      '../../client/assets/blog/post-hero.webp',
    );
  });

  it('returns undefined when nothing matches, so the caller can fail the build', () => {
    expect(resolveAssetKey('./assets/missing.jpg', assets('assets/logo.webp'))).toBeUndefined();
  });
});
