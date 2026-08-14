/**
 * Conversion destinations for the Detailers Guild template.
 *
 * Every quote and booking button on the site resolves through here, so a label or
 * a path exists in exactly one place. Nothing in schema.ts authors an action: the
 * proven payload carried the identical "Get a quote" / phone-number pair on all
 * seven pages, which is site config rendered seven times rather than seven facts a
 * writer decided.
 *
 * NO ENGINE IMPORTS. This deliberately takes the booking flag as an argument
 * instead of importing siteConfig: template-preview renders these components with
 * no client symlink present, so a template file that reaches for the active
 * payload cannot be previewed. The route files pass the flag in.
 */
import type { GuildLink } from './types';

/** The quote form. Always published — it is the fallback for everything else. */
export const QUOTE_PATH = '/get-quote';

/** The booking page, where the client publishes one. */
export const BOOKING_PATH = '/booking';

export interface GuildRouteOptions {
  /** siteConfig.routes.booking — false collapses booking onto the quote form. */
  booking: boolean;
}

/**
 * Booking destination, falling back to the quote form for clients with no /booking
 * page. The label stays "Book today" either way: the customer's intent is the same,
 * and the fallback is an implementation detail they should never read about.
 */
export function bookingHref({ booking }: GuildRouteOptions): string {
  return booking ? BOOKING_PATH : QUOTE_PATH;
}

/** The primary hero action — asking for a price, not committing to a slot. */
export function quoteAction(): GuildLink {
  return { label: 'Get a quote', href: QUOTE_PATH };
}

/** The closing CTA action, and the header's primary button. */
export function bookingAction(options: GuildRouteOptions): GuildLink {
  return { label: 'Book today', href: bookingHref(options) };
}

/**
 * The hero's secondary action. A phone number is its own call to action for a
 * mobile trade — a customer standing next to the vehicle wants to talk, not type.
 */
export function callAction(contact: { phone: string; phoneDisplay: string }): GuildLink {
  return { label: `Call ${contact.phoneDisplay}`, href: `tel:${contact.phone}` };
}
