/**
 * Authored content → render props.
 *
 * schema.ts deliberately authors words and pictures only. Everything this module
 * adds is a template decision a writer should not be making:
 *
 *   - Composition flags. `reversed` alternates the image side down a page, so it is
 *     meaningful only relative to the section above it; `seamless` says "these two
 *     blocks are one thought"; `large`/`small`/`lead` are heading and copy rhythm.
 *     Section-by-section authoring cannot see any of that, so it is positional here.
 *   - Actions. Derived from routes.ts, so every button on the site agrees with every
 *     other one and none of them can point at a page the client never published.
 *   - Social links. The URLs live in site config, so the authored copy is a heading
 *     and a line of body, never a list of hrefs.
 *
 * Route-side module: it reads siteConfig, so template-preview never imports it.
 */
import { siteConfig } from '../../lib/site-config';
import type {
  GuildContentSection,
  GuildCtaData,
  GuildHeroData,
  GuildIncludedData,
  GuildOwnerCtaData,
  GuildSocialData,
} from './types';
import { bookingAction, callAction, quoteAction } from './routes';

const routeOptions = { booking: siteConfig.routes.booking };

/** Authored hero fields, as they appear in every page schema. */
interface AuthoredHero {
  eyebrow: string;
  heading: string;
  ticker?: string[];
  image?: { src: string; alt: string };
  video?: { src: string };
}

/**
 * The hero's actions are the same pair everywhere: ask for a price, or call. Only
 * home runs full height — `compact` is the default because every other page has
 * content directly beneath it that should be visible on load.
 */
export function heroFrom(hero: AuthoredHero, options: { compact?: boolean } = {}): GuildHeroData {
  return {
    ...hero,
    primaryAction: quoteAction(),
    secondaryAction: callAction(siteConfig.contact),
    compact: options.compact ?? true,
  };
}

/** Layout flags a section can be given by its position on the page. */
export interface SectionFlags {
  reversed?: boolean;
  seamless?: boolean;
  large?: boolean;
  small?: boolean;
  lead?: boolean;
  /**
   * Renders the quote/call button pair under the copy. A slot decision like the
   * rest: the stakes sections ("Why X Matters", "Why Mobile Detailing in {Area}")
   * end on a conversion beat, and the actions are derived here so a writer can
   * never author a button (the same rule as heroes and closing bands).
   */
  actions?: boolean;
}

type AuthoredSection = Omit<GuildContentSection, keyof SectionFlags | 'action' | 'secondaryAction'>;

export function sectionFrom(section: AuthoredSection, flags: SectionFlags = {}): GuildContentSection {
  const { actions, ...layout } = flags;
  return {
    ...section,
    ...layout,
    ...(actions ? { action: quoteAction(), secondaryAction: callAction(siteConfig.contact) } : {}),
  };
}

/** Authored checklist panels, before the template adds their action. */
interface AuthoredIncluded {
  heading: string;
  panels: Array<Omit<GuildIncludedData['panels'][number], 'action'>>;
}

/**
 * The what's-included checklist. Every panel closes on the booking action — the
 * checklist is the page's "this is what you get" moment, so the button under it
 * books (or falls back to the quote page via routes.booking, like every booking
 * button on the site). Derived here, never authored, same rule as everywhere else.
 */
export function includedFrom(included: AuthoredIncluded): GuildIncludedData {
  return {
    ...included,
    panels: included.panels.map((panel) => ({ ...panel, action: bookingAction(routeOptions) })),
  };
}

/**
 * Alternates the image side down a run of sections, starting image-right.
 *
 * This is why `reversed` is not authored: the value is only correct relative to the
 * sections around it, and a writer filling in one block at a time has no way to know
 * what came before.
 */
export function alternate(
  sections: AuthoredSection[],
  flags: (index: number) => SectionFlags = () => ({}),
): GuildContentSection[] {
  return sections.map((section, i) => sectionFrom(section, { reversed: i % 2 === 1, ...flags(i) }));
}

/** Closing band. Always the booking action — see routes.ts for the fallback rule. */
export function ctaFrom(
  cta: Omit<GuildCtaData, 'action' | 'small'>,
  options: { small?: boolean } = {},
): GuildCtaData {
  return { ...cta, action: bookingAction(routeOptions), small: options.small };
}

/**
 * The booking page's portrait CTA. Its job is "talk to a human before you pick",
 * so the primary action is the phone and the quote form is secondary — the one
 * place on the site where calling outranks booking.
 */
export function ownerCtaFrom(
  cta: Omit<GuildOwnerCtaData, 'action' | 'secondaryAction'>,
): GuildOwnerCtaData {
  return {
    ...cta,
    action: callAction(siteConfig.contact),
    secondaryAction: quoteAction(),
  };
}

/**
 * Follow-us band. Rendered only where the client actually has socials — a heading
 * over an empty row is worse than no section, so this returns undefined instead.
 */
export function socialFrom(
  social: { heading: string; body?: string; image?: { src: string; alt: string } } | undefined,
  links: GuildSocialData['links'],
): GuildSocialData | undefined {
  if (!social || !links.length) return undefined;
  return { ...social, links };
}
