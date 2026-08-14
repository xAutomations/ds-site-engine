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
 * Surfaces from styles/global.css. Duplicated as constants because CSS custom
 * properties do not exist at build time, and the contrast maths has to run then.
 * Keep in step with the tokens — they are the same three colours the design uses.
 */
const PAPER = '#f3f2f2';
const SURFACE = '#eae9e9';

export interface GuildAccentTokens {
  accent: string;
  /** Text on an accent fill — buttons, the services band, section badges. */
  onAccent: string;
  /** Accent as text on paper — link hovers, emphasis lines. */
  accentDark: string;
}

export function resolveGuildAccent(accent: string): GuildAccentTokens {
  return {
    accent,
    onAccent: pickOnAccent(accent, '#ffffff'),
    accentDark: deriveTextSafe(accent, [PAPER, SURFACE, '#ffffff'], AA_NORMAL),
  };
}

/**
 * Fails the build for the one problem no derivation can solve.
 *
 * A label can be flipped to dark; a fill cannot be separated from a background it
 * matches. An accent within 3:1 of the paper makes every button, badge, and band on
 * the site melt into the page, and no choice of label colour changes that.
 */
export function assertGuildAccent(accent: string): void {
  const ratio = contrastRatio(accent, PAPER);
  if (ratio >= AA_LARGE) return;

  throw new Error(
    `theme.accentColor "${accent}" is too close to the Detailers Guild page ` +
      `background (${ratio.toFixed(2)}:1 against ${PAPER}, needs ${AA_LARGE}:1).\n\n` +
      `Buttons, section badges, and the services band are all accent fills on paper — ` +
      `at this contrast they disappear into the page. A darker or more saturated ` +
      `version of the same brand colour usually clears it.`,
  );
}
