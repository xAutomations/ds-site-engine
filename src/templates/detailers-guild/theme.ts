/**
 * Accent-contrast resolution for the Detailers Guild template.
 *
 * The template owns its palette (the --dg-* tokens in styles/global.css) and takes
 * exactly one value from the client: theme.accentColor. That single value lands on
 * button fills, the services band, section badges, and link hovers — so whether the
 * site is legible is decided here, by arithmetic, rather than by eye.
 *
 * The maths lives in styles/contrast.ts. Nothing used to call it: both templates
 * read accentColor straight into a CSS variable and hoped. This module is where
 * Guild stops hoping.
 *
 * TWO DERIVED VALUES, ONE ASSERTION
 *   --dg-on-accent    the label colour on an accent fill. Derived, because the part
 *                     that should move is the label, not the client's brand colour
 *                     (see pickOnAccent's own note on this).
 *   --dg-accent-dark  accent used AS text, on paper. Was a fixed 76% black mix,
 *                     which is a guess: for a light accent it stays illegible, and
 *                     for a dark one it is needlessly murky.
 *   The assertion is reserved for what derivation cannot fix — an accent fill that
 *   is invisible against the page it sits on.
 */
import { AA_LARGE, AA_NORMAL, contrastRatio, deriveTextSafe, pickOnAccent } from '../../styles/contrast';

/**
 * Surfaces from styles/global.css, per mode. Duplicated as constants because CSS
 * custom properties do not exist at build time, and the contrast maths has to run
 * then. Keep in step with the tokens — the dark set mirrors the
 * `[data-dg-mode='dark']` block exactly.
 */
export type GuildMode = 'light' | 'dark';

const SURFACES: Record<GuildMode, { bg: string; surface: string; paper: string }> = {
  light: { bg: '#f3f2f2', surface: '#eae9e9', paper: '#f8f4f4' },
  dark: { bg: '#000000', surface: '#16181b', paper: '#101214' },
};

export interface GuildAccentTokens {
  accent: string;
  /** Text on an accent fill — buttons, the services band, section badges. */
  onAccent: string;
  /** Accent as text on the page surfaces — link hovers, emphasis lines. */
  accentDark: string;
  /**
   * Accent as text on a white fill, which stays white in both modes (the inverted
   * button inside the accent-field checklist). accentDark cannot serve here: in
   * dark mode it is derived light for the dark page, and light-on-white fails.
   */
  accentOnLight: string;
}

export function resolveGuildAccent(accent: string, mode: GuildMode = 'light'): GuildAccentTokens {
  const s = SURFACES[mode];
  const pageSurfaces = mode === 'light' ? [s.bg, s.surface, s.paper, '#ffffff'] : [s.bg, s.surface, s.paper];
  return {
    accent,
    onAccent: pickOnAccent(accent, '#ffffff'),
    accentDark: deriveTextSafe(accent, pageSurfaces, AA_NORMAL),
    accentOnLight: deriveTextSafe(accent, ['#ffffff'], AA_NORMAL),
  };
}

/**
 * Fails the build for the one problem no derivation can solve.
 *
 * A label can be flipped to dark; a fill cannot be separated from a background it
 * matches. An accent within 3:1 of the paper makes every button, badge, and band on
 * the site melt into the page, and no choice of label colour changes that.
 */
export function assertGuildAccent(accent: string, mode: GuildMode = 'light'): void {
  const bg = SURFACES[mode].bg;
  const ratio = contrastRatio(accent, bg);
  if (ratio >= AA_LARGE) return;

  throw new Error(
    `theme.accentColor "${accent}" is too close to the Detailers Guild ${mode} page ` +
      `background (${ratio.toFixed(2)}:1 against ${bg}, needs ${AA_LARGE}:1).\n\n` +
      `Buttons, section badges, and the services band are all accent fills on the page — ` +
      `at this contrast they disappear into it. A ${mode === 'dark' ? 'lighter' : 'darker'} ` +
      `or more saturated version of the same brand colour usually clears it.`,
  );
}
