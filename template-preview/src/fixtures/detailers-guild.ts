import type {
  GuildFaqGroup,
  GuildFaqItem,
  GuildIncludedData,
  GuildProcessData,
  GuildAreaSectionData,
  GuildContentSection,
  GuildCtaData,
  GuildHeroData,
  GuildServiceCard,
  GuildQuoteData,
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
  heading: 'No Shop. No Drop-Off. No Waiting.',
  body: [
    'Your car sits in the sun all day, collects road grime on your commute through the Beltway, and picks up dust from every parking lot in Northern Virginia. By the time you notice, the paint is fading, the interior smells, and the seats are stained. You do not have time to drop it off at a shop and wait. San Mob Detailing brings the detail to your driveway, your office parking lot, or wherever your vehicle sits.',
    'We are a 100% mobile detailing service based in Alexandria, VA, serving the entire DMV region. From sedans and SUVs to RVs, boats, motorcycles, and aircraft — we handle every vehicle type with the same level of care. No shortcuts, no rushing, no excuses.',
  ],
  image: { src: '/assets/funky-lines.png', alt: 'Preview placeholder for a detailer working in a driveway' },
  action: { label: 'Book today', href: '#book' },
};

export const homePromise: GuildContentSection = {
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

export const autoDetailShell: GuildShellData = {
  ...homeShell,
  title: 'Full Auto Detailing in Alexandria, VA | Detailer Guild',
  description: 'Complete mobile interior and exterior detailing for sedans, SUVs, trucks, and minivans across the DMV.',
  path: '/auto-detailing',
};

export const autoDetailHero: GuildHeroData = {
  eyebrow: 'Our Services',
  heading: 'Full Auto Detailing in Alexandria, VA',
  primaryAction: { label: 'Get a quote', href: '#book' },
  secondaryAction: { label: '(888) 900-5941', href: 'tel:+18889005941' },
  compact: true,
};

export const autoDetailIntro: GuildContentSection = {
  body: [
    'Your car picks up more grime in a single week on the Beltway than most people realize. Brake dust embeds itself in the wheel wells. Road film coats the paint. Dust, crumbs, and spills build up on the seats and carpets until the interior feels grimy no matter how often you wipe things down. A basic car wash will not fix that. A full auto detail will.',
    'San Mob Detailing provides complete interior and exterior detailing for sedans, SUVs, trucks, and minivans across the DMV. We are 100% mobile, which means we bring everything to your driveway, your office lot, or wherever your vehicle sits. No drop-off required.',
  ],
  image: { src: '/assets/ripples.png', alt: 'Preview placeholder for the owner detailing a car' },
  seamless: true,
};

export const autoDetailOverview: GuildContentSection = {
  heading: 'What Is Full Auto Detailing?',
  body: [
    'A full auto detail is a comprehensive, top-to-bottom restoration of your vehicle. It goes far beyond what a standard car wash or quick clean can do. We address every surface, both inside and outside, to remove contaminants, restore the finish, and protect the paint.',
    'Think of it as a deep reset for your car. The goal is to bring it as close to showroom condition as possible, regardless of how long it has been since the last proper cleaning. Whether your vehicle has months of buildup or just needs a thorough seasonal refresh, a full detail covers it all.',
  ],
  image: { src: '/assets/funky-lines.png', alt: 'Preview placeholder for a full detail in progress' },
  reversed: true,
  action: { label: 'Get a quote', href: '#book' },
  secondaryAction: { label: 'Call (888) 900-5941', href: 'tel:+18889005941' },
};

export const autoDetailIncluded: GuildIncludedData = {
  heading: 'What Is Included',
  panels: [
    {
      eyebrow: 'Wash & Protect',
      heading: 'Exterior Wash & Detail',
      image: { src: '/assets/terrazzo-accent.png', alt: 'Preview placeholder for exterior detailing' },
      items: [
        'Hand wash and dry using proper wash mitts and drying towels',
        'Clay bar treatment to remove embedded surface contaminants',
        'Wheel and tire cleaning, including the barrel and lug nuts',
        'Tire dressing applied for a clean, even finish',
        'Window and mirror cleaning inside and out',
        'Door jamb cleaning and trim restoration where needed',
        'Final wax or sealant application for paint protection and shine',
      ],
      action: { label: 'Book today', href: '#book' },
    },
    {
      eyebrow: 'Clean & Perfect',
      heading: 'Interior Detail & Clean',
      image: { src: '/assets/waves-accent.png', alt: 'Preview placeholder for interior detailing' },
      items: [
        'Full vacuum of seats, carpets, floor mats, trunk, and all crevices',
        'Steam cleaning or hot water extraction on fabric surfaces',
        'Leather cleaning and conditioning (if applicable)',
        'Dashboard, console, and door panel wipe-down and protection',
        'Vent, cup holder, and storage compartment detailing',
        'Pet hair removal included at no extra charge for all vehicles',
        'Interior glass cleaning for a streak-free finish',
      ],
      action: { label: 'Book today', href: '#book' },
    },
  ],
};

export const autoDetailProcess: GuildProcessData = {
  heading: 'Our Full Auto Detailing Process',
  image: { src: '/assets/ripples.png', alt: 'Preview placeholder for the detailing process' },
  steps: [
    { title: 'Inspection', body: 'We walk around your vehicle and assess its condition. We note any trouble spots, stains, scratches, or areas that need extra attention.' },
    { title: 'Interior First', body: 'We start inside. Remove floor mats, vacuum every surface, extract or steam clean the seats and carpets, clean and condition all hard surfaces, and detail every compartment and crevice.' },
    { title: 'Exterior Wash', body: 'Hand wash the exterior with a foam cannon and proper wash mitts. No brushes, no automated systems. Clean the wheels, tires, and wheel wells individually.' },
    { title: 'Decontamination', body: 'Clay bar the paint to remove bonded contaminants that washing alone cannot remove. This step prepares the surface for wax or sealant.' },
    { title: 'Protection and Finishing', body: 'Apply a coat of wax or sealant to protect the paint. Dress the tires, restore trim, and clean all glass. Final walkthrough with you to make sure everything meets the standard.' },
  ],
};

export const autoDetailAddOns: GuildContentSection[] = [
  {
    heading: 'Ozone Treatment',
    small: true,
    body: [
      'Eliminates stubborn odors from smoke, pets, food, mildew, and bacteria that standard cleaning cannot reach. Our professional ozone generator works at the molecular level, neutralizing odor-causing compounds throughout your interior.',
      'The result is a genuinely clean-smelling interior, not a fragrance masking the problem underneath. Most treatments take 30 to 60 minutes and can be added to any detailing service.',
    ],
    image: { src: '/assets/funky-lines.png', alt: 'Preview placeholder for ozone treatment' },
  },
  {
    heading: 'Stain Removal',
    small: true,
    body: [
      'Targeted deep extraction treatment for tough stains on seats, carpets, door panels, and upholstery that standard vacuuming and wiping cannot remove.',
      'We use professional-grade hot water extraction and stain-specific chemistry to break down and lift coffee, juice, grease, ink, and biological stains at the fiber level. Pricing is per seat so you only pay for exactly what you need.',
    ],
    image: { src: '/assets/terrazzo-accent.png', alt: 'Preview placeholder for stain removal' },
  },
  {
    heading: 'Pet Hair Removal',
    small: true,
    body: [
      'Pet hair embeds deep into carpet fibers, seat fabric, and floor mat loops in ways that a standard vacuum simply cannot reach. We use specialized rubber extraction tools and high-powered vacuums to systematically pull embedded hair from every surface.',
      'No matter how heavy the shedding, we do not stop until the interior is completely hair-free. Included at no additional charge with every full auto detail booking.',
    ],
    image: { src: '/assets/waves-accent.png', alt: 'Preview placeholder for pet hair removal' },
  },
];

export const autoDetailWhy: GuildContentSection = {
  heading: 'Why Auto Detailing Matters',
  body: [
    "Road grime, UV exposure, bird droppings, tree sap, and everyday use break down your paint and interior surfaces over time. A full detail removes those contaminants before they cause permanent damage. It also restores your vehicle's appearance, which directly impacts resale value.",
    "If you plan on keeping your car for years, regular full details prevent the kind of wear that leads to expensive repairs or reupholstering. If you are looking to sell or trade in, a professional detail can add hundreds to your vehicle's perceived value.",
    'For customers who want to maintain their vehicle between full details, San Mob Detailing offers a maintenance wash program exclusively for existing customers. And for those looking for long-term paint protection after a detail, consider our ceramic coating service or a paint correction to remove any existing scratches before sealing the finish.',
  ],
  image: { src: '/assets/ripples.png', alt: 'Preview placeholder for a finished detail' },
};

export const autoDetailFaqs: GuildFaqItem[] = [
  { question: 'How long does a full auto detail take?', answer: 'A typical full auto detail takes between two and four hours depending on the size and condition of your vehicle. Larger vehicles like SUVs, trucks, and minivans take longer due to additional surface area. Heavily soiled vehicles may also require extra time.' },
  { question: 'Do I need to be home during the detail?', answer: 'Not necessarily. As long as we have access to your vehicle and a reasonable workspace around it, you can go about your day. Many of our customers schedule details while they are at work or running errands.' },
  { question: 'What do I need to provide?', answer: 'Just access to your vehicle. We bring all equipment, water, and supplies. If you have access to a water spigot or electrical outlet nearby, that helps, but it is not required. Our mobile setup is fully self-contained.' },
  { question: 'How is this different from a car wash?', answer: 'A car wash cleans the surface. A full auto detail restores and protects every surface of your vehicle. We clean areas a car wash cannot reach, use professional-grade products, and spend the time necessary to get the job done right.' },
  { question: 'How often should I get a full detail?', answer: 'For most daily drivers in the DMV area, two to three times per year is a solid schedule. Between full details, our maintenance wash keeps your vehicle looking sharp without needing another full session.' },
];

export const autoDetailCta: GuildCtaData = {
  heading: 'Get Your Full Auto Detail Scheduled',
  body: 'Your car is overdue. You know it, and so does everyone who rides in it. San Mob Detailing comes directly to you in Alexandria, VA and across the DMV. No drop-off, no waiting, no hassle.',
  action: { label: 'Book today', href: '#' },
  image: { src: '/assets/funky-lines.png', alt: '' },
};

export const faqShell: GuildShellData = {
  ...homeShell,
  title: 'Frequently Asked Questions | Detailer Guild',
  description: 'Answers about booking, services, pricing, and aftercare for mobile detailing across the DMV.',
  path: '/faqs',
};

export const faqHero: GuildHeroData = {
  eyebrow: 'Help Center',
  heading: 'Frequently Asked Questions',
  primaryAction: { label: 'Get a quote', href: '#book' },
  secondaryAction: { label: '(888) 900-5941', href: 'tel:+18889005941' },
  compact: true,
};

export const faqIntro: GuildContentSection = {
  body: [],
  bodyHtml: [
    'Got questions about San Mob Detailing? We have answers. If you do not find what you are looking for below, call us at <a href="tel:+18889005941">(888) 900-5941</a> or <a href="/get-quote">request a quote</a>.',
  ],
  lead: true,
  seamless: true,
};

export const faqGroups: GuildFaqGroup[] = [
  {
    heading: 'Booking & Policies',
    items: [
      { question: 'How do I book a detailing appointment?', answer: 'You can book online through our website, call us at (888) 900-5941, or request a quote. We will confirm the details and schedule a time that works for you. Our availability is 10:00 AM - 10:00 PM.' },
      { question: 'What areas do you serve?', answer: 'San Mob Detailing is based in Alexandria, VA and serves the entire DMV region including Great Falls, McLean, Vienna, Arlington, Fort Hunt, Clifton, and Washington, DC. We travel up to 40 miles from Alexandria at no additional charge. Service beyond 40 miles is available with an additional travel fee.' },
      { question: 'Do I need to be home during the appointment?', answer: 'Not necessarily. As long as we have access to your vehicle and enough space to work around it, you can go about your day.' },
      { question: 'What happens if it rains on my appointment day?', answer: 'Light rain does not stop us for most services. Heavy rain or severe weather may require rescheduling. If we need to reschedule, we will reach out in advance.' },
      { question: 'Do you charge a cancellation fee?', answer: 'We ask for reasonable notice if you need to cancel or reschedule. Last-minute cancellations may be subject to a fee. Call us at (888) 900-5941 if you need to make changes.' },
    ],
  },
  {
    heading: 'Services',
    items: [
      { question: 'What is the difference between a full detail and an interior detail?', answer: 'A full auto detail covers both the interior and exterior of your vehicle. An interior detail focuses exclusively on the cabin. Choose interior only if your exterior is in good shape and the cabin needs the attention.' },
      { question: 'What is a maintenance wash and who can book it?', answer: 'A maintenance wash is a lighter service designed to keep your vehicle looking clean between full details. It is exclusively available to existing San Mob Detailing customers who have already received a full detail from us.' },
      { question: 'Do you do ceramic coating?', answer: 'Yes. Our ceramic coating service provides two to three years of hydrophobic paint protection. We also offer a hybrid ceramic option that provides over twelve months of protection. We recommend a paint correction before coating.' },
      { question: 'Do you detail RVs, boats, and aircraft?', answer: 'Yes. We detail RVs, boats, and aircraft of all sizes. These services are priced by the foot and require an in-person inspection before quoting.' },
      { question: 'Is pet hair removal included?', answer: 'Yes. Pet hair removal is included at no additional charge with every detailing service that involves interior work.' },
    ],
  },
  {
    heading: 'Pricing',
    items: [
      { question: 'How much does a detail cost?', answer: 'Pricing depends on the vehicle type, size, condition, and the service selected. Call us at (888) 900-5941 or request a free quote.' },
      { question: 'Do you charge a travel fee?', answer: 'Service within 40 miles of Alexandria, VA has no additional travel charge. Beyond 40 miles, an additional travel fee applies.' },
      { question: 'When is payment due?', answer: 'Payment is due upon completion of the service after you are satisfied with the results.' },
    ],
  },
  {
    heading: 'Maintenance & Aftercare',
    items: [
      { question: 'How often should I get my car detailed?', answer: 'For most daily drivers in the DMV, a full detail two to three times per year is a good schedule. Between full details, scheduling maintenance washes every two to four weeks keeps your vehicle looking sharp.' },
      { question: 'How do I maintain my ceramic coating?', answer: 'Regular washing is the most important thing. Our maintenance wash program is designed specifically for maintaining coated vehicles. Avoid automated car washes with brushes.' },
      { question: 'What should I avoid after a paint correction?', answer: 'Avoid automated car washes with brushes. Stick to hand washing or our maintenance wash program. If you are considering ceramic coating to protect your corrected paint long-term, schedule it soon after the correction.' },
    ],
  },
];

export const faqOutro: GuildContentSection = {
  heading: 'Still Have Questions?',
  small: true,
  body: [
    'Call us at (888) 900-5941 or send us a message. We respond quickly. Happy with your last detail? Leave us a review on Google. It helps more people in the DMV find professional mobile detailing.',
  ],
  action: { label: 'Get a quote', href: '#book' },
  secondaryAction: { label: 'Call (888) 900-5941', href: 'tel:+18889005941' },
};

export const faqCta: GuildCtaData = {
  heading: 'Ready to Experience Auto Care Excellence?',
  body: 'Not sure if your vehicle needs a heavy paint correction or just a standard wash? We are here to help you make the right call.',
  action: { label: 'Book today', href: '#' },
  image: { src: '/assets/waves-accent.png', alt: '' },
};

export const quoteShell: GuildShellData = {
  ...homeShell,
  title: 'Get a Quote | Detailer Guild',
  description: 'Request a free mobile detailing quote. We come to you anywhere in the DMV.',
  path: '/get-quote',
};

export const quoteHero: GuildHeroData = {
  eyebrow: 'Get a Quote',
  heading: 'Book Your Detail Today',
  secondaryAction: { label: 'Call (888) 900-5941', href: 'tel:+18889005941' },
  compact: true,
};

export const quoteData: GuildQuoteData = {
  eyebrow: 'Book Your Detail Today',
  heading: 'Contact San Mob Detailing Today',
  hours: [
    { days: 'Monday – Saturday', hours: '10:00 AM – 10:00 PM' },
    { days: 'Sunday', hours: 'Appointments Only' },
  ],
  note: 'Based in Alexandria, VA — we come to you',
  image: { src: '/assets/terrazzo-accent.png', alt: 'Preview placeholder for the mobile detailing unit' },
};

export const quoteCta: GuildCtaData = {
  heading: 'Ready to Get Your Vehicle Detailed?',
  action: { label: 'Book today', href: '#' },
  image: { src: '/assets/ripples.png', alt: '' },
};
