/**
 * Mr. Brown's Mobile Detailing — Independence, VA.
 *
 * Written from source/intake.json (the drift check compares them). Two values are
 * stand-ins, both tracked as intake blockers:
 *   · tracking.gtmId is a placeholder — the layouts skip GTM while it contains
 *     "PLACEHOLDER", so nothing fires until the real container exists.
 *   · every ./assets/ file is a generated placeholder until the image pipeline runs.
 * ghl.quoteUrl is omitted (no funnel yet); /get-quote renders the contact panel.
 */
export const siteConfig = {
  template: 'detailers-guild' as const,

  site: {
    // Correct spelling — the onboarding form's "mrbowns…" is a typo; see intake notes.
    url: 'https://mrbrownsmobiledetailing.com',
  },

  brand: {
    name: "Mr. Brown's Mobile Detailing",
    tagline: 'Mobile detailing that comes to your driveway.',
    blurb:
      "Mr. Brown's Mobile Detailing is an owner-operated mobile detailing service based in Independence, VA. Derrick Brown brings full detailing to your home or work across the Twin Counties, from cars and trucks to RVs and boats.",
    logoPath: './assets/logo.jpg',
    footerNote: 'Owner-operated and fully mobile. Derrick brings everything to your driveway.',
  },

  contact: {
    phone: '+12766203494',
    phoneDisplay: '(276) 620-3494',
    email: 'brownfitzgerald21@gmail.com',
    address: {
      street: '490 Pine Mountain Road',
      city: 'Independence',
      state: 'VA',
      zip: '24348',
    },
  },

  serviceArea: {
    baseCity: 'Independence',
    baseState: 'VA',
    radiusMiles: 45,
    label: 'the Twin Counties of Southwest Virginia and Mt. Airy, NC',
  },

  hours: [{ days: 'Monday to Sunday', hours: '9am to 6pm' }],

  socials: {
    // DUMMY for layout preview only — the real page is pending; replace before
    // launch, and mirror it into source/intake.json when it lands.
    facebook: 'https://facebook.com/mrbrownsmobiledetailing',
  },

  ghl: {
    embed: false,
  },

  routes: {
    booking: false,
  },

  tracking: {
    gtmId: 'GTM-PLACEHOLDER',
  },

  theme: {
    /**
     * A dark-mode-safe rendering of the brand navy (#154481), which is itself
     * 2.18:1 against this palette's black page — below the 3:1 the template asserts,
     * so its fills sank into the background. This clears at 4.05:1.
     */
    accentColor: '#2f6fb4',
    // "Blue & Silver with dark theme background" — the dark surface palette honors it.
    mode: 'dark' as const,
  },

  seo: {
    category: 'Mobile Auto Detailing',
    region: 'Southwest Virginia',
    priceRange: '$$',
  },

  legal: {
    effectiveDate: 'August 2026',
    source: 'template' as const,
  },

  defaults: {
    ctaHeadline: 'Ready to Get Your Vehicle Detailed?',
    socialImage: {
      src: './assets/social.jpg',
      alt: "Mr. Brown's Mobile Detailing, mobile auto detailing in Independence, VA",
    },
    heroProof: [
      { label: '100% Mobile', detail: 'We come to your home or work' },
      { label: 'Owner-Operated', detail: 'Derrick details every vehicle himself' },
      { label: '45-Mile Radius', detail: 'Based in Independence, VA' },
    ],
    heroVideo: {
      src: './assets/hero.webm',
      fallbackSrc: './assets/hero.mp4',
      loop: true,
      poster: {
        src: './assets/hero-poster.jpg',
        alt: "A freshly detailed vehicle in a driveway, by Mr. Brown's Mobile Detailing in Independence, VA",
      },
    },
  },
};
