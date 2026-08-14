/**
 * Registers the active template's routes.
 *
 * A template owns its pages the way it owns its schema and its components: one
 * template, one contract, no shared union. `src/pages/` holds only the endpoints
 * that are genuinely template-agnostic (robots.txt, llms.txt, favicon.svg) — every
 * page route lives beside the template that renders it and is injected here.
 *
 * WHY NOT src/pages DISPATCH
 * Every route used to open with `if (siteConfig.template !== 'aviation-editorial')
 * throw`. With a single template in the enum those guards were unreachable by
 * construction, and with two they would become a branch in ten files that has to be
 * updated for every template added. Injecting per template means an inactive
 * template's routes simply do not exist — nothing to guard.
 *
 * The route files themselves are ordinary .astro pages. They may import
 * lib/site-config and lib/seo freely: unlike template *components*, which must stay
 * props-pure so template-preview can render them without a client payload, routes
 * only ever run in a real build.
 */
import type { AstroIntegration } from 'astro';
import type { Template } from '../config-schema';

/** A route file, relative to the template's own directory. */
interface TemplateRoute {
  /** URL pattern, e.g. "/" or "/[service]". */
  pattern: string;
  /** File within `src/templates/<template>/routes/`. */
  entrypoint: string;
  /**
   * Config gate. A route named here is published only where the client opted in —
   * `booking` reads siteConfig.routes.booking. Ungated routes always publish.
   */
  requires?: 'booking';
}

/**
 * Per-template route tables.
 *
 * Order does not matter — Astro resolves static segments ahead of dynamic ones
 * regardless of injection order — but keeping them in navigation order makes a
 * missing page obvious at a glance.
 */
const ROUTES: Record<Template, TemplateRoute[]> = {
  'aviation-editorial': [
    { pattern: '/', entrypoint: 'index.astro' },
    { pattern: '/about', entrypoint: 'about.astro' },
    { pattern: '/faqs', entrypoint: 'faqs.astro' },
    { pattern: '/get-quote', entrypoint: 'get-quote.astro' },
    { pattern: '/quote-received', entrypoint: 'quote-received.astro' },
    { pattern: '/privacy-policy', entrypoint: 'privacy-policy.astro' },
    { pattern: '/tos', entrypoint: 'tos.astro' },
    { pattern: '/404', entrypoint: '404.astro' },
    { pattern: '/blog', entrypoint: 'blog/index.astro' },
    { pattern: '/post/[slug]', entrypoint: 'post/[slug].astro' },
    { pattern: '/[service]', entrypoint: '[service].astro' },
    { pattern: '/[area]', entrypoint: '[area].astro' },
  ],
  'detailers-guild': [
    { pattern: '/', entrypoint: 'index.astro' },
    { pattern: '/about', entrypoint: 'about.astro' },
    { pattern: '/faqs', entrypoint: 'faqs.astro' },
    { pattern: '/get-quote', entrypoint: 'get-quote.astro' },
    { pattern: '/privacy-policy', entrypoint: 'privacy-policy.astro' },
    { pattern: '/tos', entrypoint: 'tos.astro' },
    { pattern: '/404', entrypoint: '404.astro' },
    { pattern: '/booking', entrypoint: 'booking.astro', requires: 'booking' },
    { pattern: '/blog', entrypoint: 'blog/index.astro' },
    { pattern: '/post/[slug]', entrypoint: 'post/[slug].astro' },
    { pattern: '/[service]', entrypoint: '[service].astro' },
    { pattern: '/[area]', entrypoint: '[area].astro' },
  ],
};

/**
 * @param template The active client's template (siteConfig.template).
 * @param options  Config gates — which optional routes this client publishes.
 */
export function templateRoutes(
  template: Template,
  options: { booking: boolean } = { booking: true },
): AstroIntegration {
  return {
    name: 'ds:template-routes',
    hooks: {
      'astro:config:setup': ({ injectRoute, logger }) => {
        const all = ROUTES[template] ?? [];
        const routes = all.filter((route) => !route.requires || options[route.requires]);
        const skipped = all.length - routes.length;

        if (skipped) {
          logger.info(`${skipped} optional route(s) not published for this client.`);
        }

        if (!routes.length) {
          // Not fatal: a template under construction has no routes yet, and failing
          // the build here would block the very work that adds them.
          logger.warn(`No routes registered for template "${template}".`);
          return;
        }

        for (const { pattern, entrypoint } of routes) {
          injectRoute({
            pattern,
            entrypoint: `./src/templates/${template}/routes/${entrypoint}`,
          });
        }

        logger.info(`${routes.length} route(s) registered for "${template}".`);
      },
    },
  };
}
