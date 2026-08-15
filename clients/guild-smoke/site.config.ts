/**
 * THROWAWAY SMOKE PAYLOAD — not a client.
 *
 * Exists to execute the detailers-guild routes end to end: schema → collection →
 * route → component. Every fact in it is invented and every asset is a generated
 * PLACEHOLDER slab. Nothing here should ever be deployed, and it is not a starting
 * point for a real client.
 */
export const siteConfig = {
  template: 'detailers-guild' as const,

  site: {
    url: 'https://guild-smoke.invalid',
  },

  brand: {
    name: 'Smoke Detailing',
    legalName: 'Smoke Detailing LLC',
    tagline: 'Mobile detailing that comes to you.',
    blurb:
      'Smoke Detailing is a fully mobile detailing operation built to exercise the Detailers Guild template. Every word of this payload is invented test copy.',
    footerNote:
      'Serving the test region with pride, our mobile team comes to you for convenience and quality.',
    logoPath: './assets/logo.png',
    footerLogoPath: './assets/logo-footer.png',
  },

  contact: {
    phone: '+15550001111',
    phoneDisplay: '(555) 000-1111',
    email: 'hello@guild-smoke.invalid',
    address: {
      street: '1 Test Street',
      city: 'Alexandria',
      state: 'VA',
      zip: '22301',
    },
  },

  serviceArea: {
    baseCity: 'Alexandria',
    baseState: 'VA',
    radiusMiles: 40,
    label: 'the entire DMV',
  },

  hours: [{ days: 'Monday – Sunday', hours: '10:00 AM – 10:00 PM' }],

  socials: {
    facebook: 'https://facebook.com/example',
    instagram: 'https://instagram.com/example',
  },

  ghl: {
    quoteUrl: 'https://links.example.com/widget/form/test',
    embed: true,
  },

  routes: {
    booking: true,
  },

  tracking: {
    gtmId: 'GTM-TEST123',
  },

  theme: {
    accentColor: '#0f766e',
  },

  seo: {
    category: 'Mobile Auto Detailing',
    region: 'Northern Virginia',
  },

  legal: {
    effectiveDate: 'August 2026',
    source: 'template' as const,
  },

  defaults: {
    ctaHeadline: 'Ready to Get Your Vehicle Detailed?',
    socialImage: { src: './assets/social.jpg', alt: 'Smoke Detailing' },
    heroVideo: {
      src: './assets/hero.webm',
      fallbackSrc: './assets/hero.mp4',
      poster: { src: './assets/hero-poster.jpg', alt: 'Smoke Detailing mobile unit' },
    },
  },
};
