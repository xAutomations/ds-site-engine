import { describe, expect, it } from 'vitest';
import {
  buildTitle,
  buildHomeTitle,
  buildH1,
  canonical,
  webSiteJsonLd,
  webPageJsonLd,
  serviceJsonLd,
  serviceBreadcrumbJsonLd,
  areaBreadcrumbJsonLd,
  blogPostingJsonLd,
  localBusinessJsonLd,
  faqPageJsonLd,
} from '../src/lib/seo';
import type { SiteConfig } from '../src/config-schema';
import { testConfig } from './fixtures/site-config';

describe('title and H1 formulas', () => {
  it('builds {Subject} in {City}, {ST} | {Brand}', () => {
    expect(buildTitle(testConfig, 'Ceramic Coating', 'Sterling', 'VA')).toBe(
      'Ceramic Coating in Sterling, VA | Acme Detailing',
    );
  });

  it('drops the state segment when absent — no dangling comma', () => {
    expect(buildH1('Aircraft Detailing', 'Teterboro Airport (KTEB)')).toBe(
      'Aircraft Detailing in Teterboro Airport (KTEB)',
    );
  });

  it('targets the region on home, not the base city', () => {
    expect(buildHomeTitle(testConfig)).toBe(
      'Mobile Auto Detailing in Northern Virginia | Acme Detailing',
    );
  });
});

describe('canonical', () => {
  it('emits the trailing-slash form the sitemap uses', () => {
    expect(canonical(testConfig, '/about')).toBe('https://acme.example/about/');
    expect(canonical(testConfig, '/about/')).toBe('https://acme.example/about/');
  });

  it('handles the root', () => {
    expect(canonical(testConfig, '/')).toBe('https://acme.example/');
  });

  it('preserves nested paths', () => {
    expect(canonical(testConfig, '/blog/wax-vs-ceramic')).toBe(
      'https://acme.example/blog/wax-vs-ceramic/',
    );
  });
});

describe('JSON-LD graph nodes', () => {
  it('cross-references by @id: WebPage → WebSite and LocalBusiness', () => {
    const page = webPageJsonLd(testConfig, {
      title: 'T',
      description: 'D',
      path: '/about',
    });
    expect(page.isPartOf).toEqual({ '@id': webSiteJsonLd(testConfig)['@id'] });
    expect(page.about).toEqual({ '@id': 'https://acme.example/#business' });
  });

  it('Service → provider points at the LocalBusiness node', () => {
    const areas = [{ name: 'Ashburn', state: 'VA' }, { name: 'Dulles Airport' }];
    const service = serviceJsonLd(
      testConfig,
      { name: 'Auto Detailing', description: 'D', slug: 'auto-detailing' },
      areas,
    );
    const business = localBusinessJsonLd(testConfig, areas);
    expect(service.provider).toEqual({ '@id': business['@id'] });
  });

  it('types areaServed as City only when a state is present', () => {
    const business = localBusinessJsonLd(testConfig, [
      { name: 'Ashburn', state: 'VA' },
      { name: 'Dulles Airport' },
    ]);
    expect(business.areaServed).toEqual([
      { '@type': 'City', name: 'Ashburn, VA' },
      { '@type': 'Place', name: 'Dulles Airport' },
    ]);
  });

  it('service breadcrumb points its middle crumb at home (no /services index)', () => {
    const node = serviceBreadcrumbJsonLd(testConfig, { name: 'S', slug: 's' });
    const crumbs = node.itemListElement as Array<Record<string, unknown>>;
    expect(crumbs[1].item).toBe('https://acme.example/');
  });

  it('emits priceRange only when config supplies one', () => {
    expect(localBusinessJsonLd(testConfig, [])).not.toHaveProperty('priceRange');

    const priced = {
      ...testConfig,
      seo: { ...testConfig.seo, priceRange: '$$' },
    } as SiteConfig;
    expect(localBusinessJsonLd(priced, []).priceRange).toBe('$$');
  });

  it('makesOffer names every service with its canonical page URL', () => {
    const business = localBusinessJsonLd(testConfig, [], undefined, [
      { name: 'Ceramic Coating', slug: 'ceramic-coating', description: 'Long-term protection.' },
      { name: 'Interior Detail', slug: 'interior-detail' },
    ]);
    expect(business.makesOffer).toEqual([
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Ceramic Coating',
          url: 'https://acme.example/ceramic-coating/',
          description: 'Long-term protection.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Interior Detail',
          url: 'https://acme.example/interior-detail/',
        },
      },
    ]);
    // No services given → no empty makesOffer array.
    expect(localBusinessJsonLd(testConfig, [])).not.toHaveProperty('makesOffer');
  });

  it('area breadcrumb mirrors the service one: home-anchored, last crumb without item', () => {
    const node = areaBreadcrumbJsonLd(testConfig, { name: 'Ashburn', slug: 'ashburn-va' });
    const crumbs = node.itemListElement as Array<Record<string, unknown>>;
    expect(crumbs).toHaveLength(3);
    expect(crumbs[1]).toMatchObject({ name: 'Service Areas', item: 'https://acme.example/' });
    expect(crumbs[2]).toEqual({ '@type': 'ListItem', position: 3, name: 'Ashburn' });
  });

  it('BlogPosting ties into the graph: webpage by @id, publisher at the business node', () => {
    const node = blogPostingJsonLd(
      testConfig,
      { title: 'Wax vs Ceramic', slug: 'wax-vs-ceramic', description: 'D', date: '2026-08-01', author: 'Jo Doe' },
      'https://acme.example/_astro/hero.abc123.jpeg',
    );
    expect(node.url).toBe('https://acme.example/post/wax-vs-ceramic/');
    expect(node.mainEntityOfPage).toEqual({ '@id': 'https://acme.example/post/wax-vs-ceramic/#webpage' });
    expect(node.publisher).toEqual({ '@id': 'https://acme.example/#business' });
    expect(node.author).toEqual({ '@type': 'Person', name: 'Jo Doe' });
    expect(node.image).toBe('https://acme.example/_astro/hero.abc123.jpeg');
    // Image is optional — a post whose hero cannot resolve still gets its Article node.
    expect(
      blogPostingJsonLd(testConfig, {
        title: 'T', slug: 's', description: 'D', date: '2026-08-01', author: 'A',
      }),
    ).not.toHaveProperty('image');
  });

  it('FAQPage maps every pair', () => {
    const node = faqPageJsonLd([{ q: 'Q1', a: 'A1' }]);
    expect(node.mainEntity).toEqual([
      { '@type': 'Question', name: 'Q1', acceptedAnswer: { '@type': 'Answer', text: 'A1' } },
    ]);
  });
});
