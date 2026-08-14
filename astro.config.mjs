// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { siteConfig } from './src/lib/site-config';
import { assetBudget } from './src/integrations/asset-budget';
import { sitemapAlias } from './src/integrations/sitemap-alias';
import { templateRoutes } from './src/integrations/template-routes';

export default defineConfig({
  site: siteConfig.site.url,
  vite: {
    server: {
      watch: {
        // stress.mjs copies a full dist/ per preset into .stress/. Astro ignores its
        // own outDir but knows nothing about this one, so a stress run flooded the
        // dev server's watcher with one event per built file (~70 per preset).
        ignored: ['**/.stress/**'],
      },
    },
  },
  integrations: [
    // The active template's page routes. src/pages holds only the endpoints that
    // are template-agnostic (robots.txt, llms.txt, favicon.svg).
    templateRoutes(siteConfig.template, { booking: siteConfig.routes.booking }),
    assetBudget(),
    sitemap({
      // A noindexed page in the sitemap is a contradiction Search Console reports.
      filter: (page) => !page.includes('/styleguide'),
    }),
    // After sitemap() — both hook astro:build:done, and the alias copies its output.
    sitemapAlias(),
  ],
});
