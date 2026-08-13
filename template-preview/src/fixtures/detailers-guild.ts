import type {
  GuildAreaSectionData,
  GuildContentSection,
  GuildCtaData,
  GuildHeroData,
  GuildServiceCard,
  GuildShellData,
  GuildSocialData,
} from '../../../src/templates/detailers-guild/types';

const services: GuildServiceCard[] = [
  'Full Auto Detailing', 'Interior Detailing', 'Ceramic Coating', 'Paint Correction',
  'RV Detailing', 'Boat Detailing', 'Motorcycle Detailing', 'Aircraft Detailing',
  'Commercial Fleet Detailing', 'ATV Detailing', 'Golf Cart Detailing', 'Maintenance Wash',
].map((label, index) => ({
  label,
  href: '#services',
  image: {
    src: `/assets/${['funky-lines.png', 'ripples.png', 'terrazzo-accent.png', 'waves-accent.png'][index % 4]}`,
    alt: `${label} preview image placeholder`,
  },
}));

const areas = [
  'Alexandria, VA', 'Great Falls, VA', 'McLean, VA', 'Vienna, VA', 'Arlington, VA',
  'Fort Hunt, VA', 'Clifton, VA', 'Washington, DC', 'Bethesda, MD',
].map((label) => ({ label, href: '#areas' }));

const site = {
  accentColor: '#ec3013',
  brand: {
    name: 'Detailer Guild',
    blurb: 'San Mob Detailing is a 100% mobile auto detailing service based in Alexandria, VA, serving the entire DMV region. From daily drivers to RVs, boats, and aircraft, we bring professional detailing directly to your door.',
  },
  contact: {
    phone: '+18889005941',
    phoneDisplay: '(888) 900-5941',
    email: 'info@sanmobdetailing.com',
    address: '450 Swann Ave, Alexandria, Virginia 22301',
  },
  serviceAreaLabel: 'the entire DMV',
  locationBlurb: 'Serving the Alexandria, VA community with pride, our mobile detailing team comes to you for ultimate convenience and quality.',
  hours: [{ days: 'Monday – Sunday', hours: '10:00 AM – 10:00 PM' }],
  socials: [
    { label: 'Facebook', href: '#' },
    { label: 'Instagram', href: '#' },
  ],
};

export const homeShell: GuildShellData = {
  site,
  title: 'Mobile Auto Detailing in Alexandria, VA and the DMV | Detailer Guild',
  description: 'Mobile detailing for cars, trucks, RVs, boats, motorcycles, and aircraft throughout Alexandria and the DMV.',
  path: '/',
  noindex: true,
  services,
  areas,
};

export const aboutShell: GuildShellData = {
  ...homeShell,
  title: 'About San Mob Detailing | Detailer Guild',
  description: 'Meet the mobile detailing team serving Alexandria, Northern Virginia, Washington DC, and Maryland.',
  path: '/about',
};

export const homeHero: GuildHeroData = {
  eyebrow: 'San Mob Detailing',
  heading: 'Mobile Auto Detailing in Alexandria, VA and the DMV',
  primaryAction: { label: 'Get a quote', href: '#book' },
  secondaryAction: { label: '(888) 900-5941', href: 'tel:+18889005941' },
  ticker: ['100% Mobile Service', 'We Come To You', 'Pet Hair Removal Included', 'No Hidden Fees', 'Serving the DMV', 'Every Vehicle Type'],
};

export const homeIntroduction: GuildContentSection = {
  index: '01',
  heading: 'No Shop. No Drop-Off. No Waiting.',
  body: [
    'Your car sits in the sun all day, collects road grime on your commute through the Beltway, and picks up dust from every parking lot in Northern Virginia. By the time you notice, the paint is fading, the interior smells, and the seats are stained. You do not have time to drop it off at a shop and wait. San Mob Detailing brings the detail to your driveway, your office parking lot, or wherever your vehicle sits.',
    'We are a 100% mobile detailing service based in Alexandria, VA, serving the entire DMV region. From sedans and SUVs to RVs, boats, motorcycles, and aircraft — we handle every vehicle type with the same level of care. No shortcuts, no rushing, no excuses.',
  ],
  image: { src: '/assets/funky-lines.png', alt: 'Preview placeholder for a detailer working in a driveway' },
  action: { label: 'Book today', href: '#book' },
};

export const homePromise: GuildContentSection = {
  index: '02',
  heading: 'Honest Pricing: No Hidden Fees.',
  body: [
    'Most local detailers quote a low starting price to get you on the hook, then upcharge the moment they see a stain on the seat or pet hair on the carpet. We refuse to operate that way.',
    'When you book with San Mob Detailing, pet hair removal is included in every service at no extra charge. The price we quote is the price you pay. No surprises, no upsells at the door, no excuses.',
  ],
  image: { src: '/assets/ripples.png', alt: 'Preview placeholder for an interior detail close-up' },
  reversed: true,
  patterned: true,
  stats: [
    { value: '$0', label: 'Hidden fees' },
    { value: 'Included', label: 'Pet hair removal' },
    { value: 'Fixed', label: 'Quote = price' },
  ],
};

export const homeAbout: GuildContentSection = {
  index: '04',
  heading: 'Every Vehicle. Any Size. One Standard of Care.',
  body: [
    'San Mob Detailing was founded with one goal: to bring professional detailing directly to you — no facility required. Based in Alexandria, VA, we service the entire DMV region with a fully self-contained mobile unit that carries everything needed for every job.',
    'Cars, trucks, SUVs, minivans, RVs, boats, motorcycles, ATVs, golf carts, commercial trucks, and aircraft. If it has a surface, we detail it. Every vehicle gets individual attention. We do not rush through vehicles to hit a quota. Your car gets the time it needs, every single time.',
  ],
  image: { src: '/assets/terrazzo-accent.png', alt: 'Preview placeholder for the mobile detailing unit' },
  action: { label: 'Get a quote', href: '#book' },
};

export const homeSocial: GuildSocialData = {
  heading: 'Follow Us On Social Media',
  body: 'Before-and-afters, transformations, and booking updates.',
  links: [
    { label: 'Facebook', href: '#' },
    { label: 'Instagram', href: '#' },
  ],
  image: { src: '/assets/ripples.png', alt: 'Preview placeholder for the owner with the mobile detailing unit' },
};

export const homeAreaSection: GuildAreaSectionData = {
  intro: 'Based in Alexandria, VA. Fully mobile and traveling up to 40 miles across DC, Virginia, and Maryland. Extended service available beyond 40 miles.',
  map: { src: '/assets/funky-lines.png', alt: 'Preview placeholder for the 40-mile service radius map' },
};

export const homeCta: GuildCtaData = {
  heading: 'Ready to Get Your Vehicle Detailed?',
  action: { label: 'Book today', href: '#' },
};

export const aboutHero: GuildHeroData = {
  eyebrow: 'Who We Are',
  heading: 'About San Mob Detailing',
  primaryAction: { label: 'Get a quote', href: '#book' },
  secondaryAction: { label: '(888) 900-5941', href: 'tel:+18889005941' },
  compact: true,
};

export const aboutStory: GuildContentSection = {
  heading: 'Detailing That Comes To You',
  body: [
    'San Mob Detailing started with a simple idea: your car should not have to suffer because you are too busy to take it to a shop. Sanjar built this business around one principle. Bring professional detailing to the customer, wherever they are, and do the job right every single time.',
    'Based in Alexandria, VA, San Mob Detailing is a fully mobile detailing operation serving the entire DMV region, including Northern Virginia, Washington DC, and Maryland. We do not operate out of a fixed shop. We load up our equipment and come directly to your home, office, or wherever your vehicle is parked.',
  ],
  action: { label: 'Book today', href: '#book' },
};

export const aboutProcess: GuildContentSection = {
  index: '02',
  heading: 'How San Mob Detailing Works',
  body: [
    'We keep things straightforward. You call, text, or request a quote. We confirm the details, show up at the scheduled time, and get to work. No upselling at the door, no surprise charges, no cutting corners to squeeze in another appointment. Your vehicle gets the full time and attention it deserves.',
    'That approach applies to every vehicle we touch. Whether it is a daily driver sedan, a family SUV, a recreational vehicle, a boat sitting on a trailer, or a private aircraft, the standard is the same. Thorough work, clean results, and a customer who is satisfied when we leave.',
  ],
  image: { src: '/assets/waves-accent.png', alt: 'Preview placeholder for the owner of San Mob Detailing' },
  patterned: true,
};

export const aboutCta: GuildCtaData = {
  heading: 'The Standard',
  body: 'No certifications on the wall. No flashy marketing gimmicks. Just consistent, thorough work on every vehicle we touch. The results speak for themselves, and our customers come back because the quality holds up.',
  emphasis: 'If your vehicle needs attention, do not wait!',
  action: { label: 'Book today', href: '#' },
};

export { services };

export const alexandriaShell: GuildShellData = {
  ...homeShell,
  title: 'Mobile Auto Detailing in Alexandria, VA | Detailer Guild',
  description: 'Mobile detailing at your home or office anywhere in Alexandria, VA — Old Town, Del Ray, Potomac Yard, and beyond.',
  path: '/alexandria-va',
};

export const alexandriaHero: GuildHeroData = {
  eyebrow: 'Areas We Serve',
  heading: 'Mobile Auto Detailing in Alexandria, VA',
  primaryAction: { label: 'Get a quote', href: '#book' },
  secondaryAction: { label: '(888) 900-5941', href: 'tel:+18889005941' },
  compact: true,
};

export const alexandriaIntro: GuildContentSection = {
  body: [
    'We are 100% mobile. We detail vehicles at your home in Del Ray, at your office in Eisenhower East, in the parking lot of your Old Town condo, or wherever you park. No shop visits, no waiting rooms.',
  ],
};

export const alexandriaWhy: GuildContentSection = {
  index: '01',
  heading: 'Why Mobile Detailing in Alexandria?',
  body: [
    'Alexandria is a commuter city. Between the Metro, the GW Parkway, 395, and the Beltway, most residents spend hours in their vehicles every day. That time in traffic adds up in the form of brake dust, road film, and interior wear. Dropping your car off at a detail shop means finding a ride, adjusting your schedule, and losing time you do not have.',
    'Mobile detailing solves that. We show up at your location on your schedule. For residents in Old Town, Potomac Yard, Landmark, Cameron Station, or anywhere in the city, we come to you.',
  ],
  image: { src: '/assets/funky-lines.png', alt: 'Preview placeholder for mobile detailing in Alexandria' },
  action: { label: 'Get a quote', href: '#book' },
  secondaryAction: { label: 'Call (888) 900-5941', href: 'tel:+18889005941' },
};

export const alexandriaNeighborhoods: GuildContentSection = {
  heading: 'Neighborhoods We Serve in Alexandria',
  small: true,
  body: [
    'Old Town Alexandria. Del Ray. Potomac Yard. Eisenhower East. Cameron Station. Landmark. Seminary Hill. Beverley Hills. North Ridge. Rosemont. Arlandria. Parkfairfax. We cover all of Alexandria and the surrounding neighborhoods within the city limits.',
  ],
};

export const alexandriaGuarantee: GuildContentSection = {
  heading: 'The San Mob Detailing Guarantee',
  large: true,
  body: [
    'Alexandria is home base for San Mob Detailing. We live and work here. Our reputation depends on the quality of work we deliver to our neighbors. Every vehicle we touch gets the same standard of care. No shortcuts, no rushing, no excuses.',
  ],
};

export const alexandriaCta: GuildCtaData = {
  heading: 'Schedule Your Detail in Alexandria',
  body: "Your car sits in the same Alexandria weather and traffic as everyone else's. The difference is whether you let it accumulate or you do something about it. San Mob Detailing makes it easy.",
  action: { label: 'Book today', href: '#' },
  image: { src: '/assets/terrazzo-accent.png', alt: '' },
};
