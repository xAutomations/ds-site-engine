/**
 * PAYLOAD — JetSpa (aircraft detailing, KTEB / KMMU / KABE / KHPN).
 *
 * No placeholders remain: the last one (tracking.gtmId) was supplied 2026-08-20 and
 * this payload builds under DS_STRICT=1, which is what the release pipeline uses.
 *
 * The convention, should a future fact go missing again: fill it with a value
 * containing the string "PLACEHOLDER" rather than something plausible — a made-up
 * street address survives review and reaches production, "PLACEHOLDER" in the footer
 * cannot. src/lib/site-config.ts lists them on every build and DS_STRICT=1 turns that
 * into a build failure. clients/jetspa/source/intake.json stays the honest record of
 * what was actually supplied; fill intake first, then mirror the value here.
 *
 * Payloads import nothing; validation happens at the engine boundary in
 * src/lib/site-config.ts.
 */
export const siteConfig = {
  template: 'aviation-editorial' as const,

  site: {
    // Stated as http:// in the client's own Privacy Policy; https assumed. Confirm.
    url: 'https://jetspa.co',
  },

  brand: {
    name: 'JetSpa',
    legalName: 'JetSpa LLC',
    tagline: 'Certified aircraft detailing for private aviation.',
    blurb:
      'JetSpa is a New Jersey based aircraft detailing company serving four of the busiest general aviation airports in the Northeast. Certified private aircraft appearance care with OEM-approved chemistry and coordinated airport access.',
    footerNote: 'Every jet deserves a spa day.',
    logoPath: './assets/logo.png',
    faviconPath: './assets/favicon.png',
  },

  contact: {
    phone: '+18665159066',
    phoneDisplay: '(866) 515-9066',
    email: 'booking@jetspa.co',
    address: {
      street: '2 Industrial Drive',
      city: 'Alpha',
      state: 'NJ',
      zip: '08865',
    },
  },

  serviceArea: {
    baseCity: 'Alpha',
    baseState: 'NJ',
    // TODO(fact-needed): radius not supplied; 100 is a placeholder, not a claim.
    radiusMiles: 100,
    label: 'the Northeast — NY, NJ, PA, CT, MD, DE, and VA',
  },

  // No published hours, by decision: AOG dispatch is 24/7 and everything else is
  // quote-first, so a Mon–Fri line would be an invented fact. Omitted, the
  // LocalBusiness JSON-LD carries no openingHoursSpecification.

  socials: {
    // Instagram is the only account; the rest are skipped by decision.
    instagram: 'https://www.instagram.com/jet_spa',
  },

  ghl: {
    // No external quote page, by decision: the GHL form is embedded on /get-quote.
    embed: true,
  },

  tracking: {
    // Supplied by the client 2026-08-20. Search Console is verified by DNS TXT in
    // Cloudflare, not through this container: GSC reads Google's own index rather
    // than a tag, and DNS verification covers every subdomain and survives a
    // container swap.
    gtmId: 'GTM-NLQ3BKZ4',
  },

  theme: {
    accentColor: '#b4915c',
  },

  seo: {
    category: 'Aircraft Detailing',
    region: 'the Northeast',
  },

  legal: {
    effectiveDate: 'August 13, 2026',
    // JetSpa supplied its own Privacy Policy and Terms of Service, with aviation
    // liability and warranty clauses the shared template cannot express. That text
    // has NOT been through Detailer Systems' legal review.
    source: 'client' as const,
  },

  defaults: {
    ctaHeadline: "Book Your Aircraft's Next Detail",
    socialImage: {
      src: './assets/social-band.webp',
      alt: 'A polished business jet on the ramp at sunset with a second aircraft beyond',
    },
    heroVideo: {
      src: './assets/hero.webm',
      fallbackSrc: './assets/hero.mp4',
      // A 7-second one-shot reveal: the jet's outline draws itself out of black and the
      // aircraft resolves. Looping would snap it back to an empty frame every 7s.
      loop: false,
      poster: {
        src: './assets/hero-poster.jpg',
        alt: 'A business jet emerging from darkness, its outline picked out in light',
      },
    },
  },
};

export default siteConfig;
