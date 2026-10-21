import headshot from '../assets/jerry-liu.jpg';

// ─────────────────────────────────────────────────────────────────────────────
// YOUR DETAILS. Most of the site's personal info lives here.
// Search the project for "TODO:" to find every placeholder that needs your input.
// ─────────────────────────────────────────────────────────────────────────────

export const site = {
  name: 'Jerry Liu',
  // Short version used where there is no photo
  initials: 'JL',
  // One line that says what you do and for whom
  tagline: 'Websites, apps & automations for small businesses',
  // The giant homepage headline, one entry per line. Short words work best.
  heroDisplay: ['Websites,', 'apps &', 'automations'],
  // The sentence under it. Keep it about outcomes, not tools.
  headline: 'I design websites & apps, and automate the busywork that slows your business down.',
  // Shown under the headline and used as the default meta description
  description:
    'I help small businesses look professional online and stop losing leads: modern website and app design, plus done-for-you CRM and AI automations.',
  location: 'Toronto & Waterloo, Canada · open to clients anywhere',

  // TODO: the email address shown on the site. While empty, email links are
  // hidden and visitors use the contact form (which delivers to
  // CONTACT_TO_EMAIL, set in Vercel).
  email: '' as string,

  // TODO: optional booking link (Cal.com, Calendly…). Leave empty to send the
  // "Book a free call" buttons to the contact page instead.
  bookingUrl: '',

  // Headshot (in src/assets/, optimised by Astro). Set to null to show initials.
  photo: headshot as ImageMetadata | null,
  photoAlt: 'Jerry Liu on the Brooklyn Bridge at night',

  // TODO: optional resume PDF, e.g. '/resume.pdf' (put the file in public/).
  // The download button on the About page only appears when this is set.
  resumeUrl: '',

  // TODO: the name of your white-label CRM & marketing platform
  platformName: '' as string,

  // TODO: add LinkedIn and any other profiles, e.g. { label: 'LinkedIn', href: 'https://www.linkedin.com/in/…' }
  socials: [{ label: 'GitHub', href: 'https://github.com/jeiujl' }],

  // A message referrers can copy and send to people they want to introduce you to.
  // Give each referrer their own link, e.g. https://yoursite.com/?ref=dad, and
  // every inquiry email will say who sent it.
  referralBlurb:
    "I'd like to introduce you to Jerry Liu, who designs websites and apps and sets up automations, like missed-call text-back, so businesses stop losing callers. Have a look:",
} as const;

export const nav = [
  { label: 'Work', href: '/work' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

/** Where every "Book a free call" button points. */
export const ctaHref = site.bookingUrl || '/contact';
