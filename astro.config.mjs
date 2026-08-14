// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { siteConfig } from './src/lib/site-config';
import { assetBudget } from './src/integrations/asset-budget';
import { sitemapAlias } from './src/integrations/sitemap-alias';
import { templateRoutes } from './src/integrations/template-routes';

export default defineConfig({
  site: siteConfig.site.url,
  integrations: [
    // The active template's page routes. src/pages holds only the endpoints that
    // are template-agnostic (robots.txt, llms.txt, favicon.svg).
    templateRoutes(siteConfig.template, { booking: siteConfig.routes.booking }),
    assetBudget(),
    sitemap(),
    // After sitemap() — both hook astro:build:done, and the alias copies its output.
    sitemapAlias(),
  ],
});
