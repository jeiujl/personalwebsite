// ─────────────────────────────────────────────────────────────────────────────
// YOUR DETAILS. Most of the site's personal info lives here.
// Search the project for "TODO:" to find every placeholder that needs your input.
// ─────────────────────────────────────────────────────────────────────────────

export const site = {
  // TODO: your name as clients should see it
  name: 'Your Name',
  // Short version used in the header logo and favicon-style avatar
  initials: 'YN',
  // TODO: one line that says what you do and for whom
  tagline: 'Websites, apps & automations for small businesses',
  // The giant homepage headline, one entry per line. Short words work best.
  heroDisplay: ['Websites,', 'apps &', 'automations'],
  // TODO: the sentence under it. Keep it about outcomes, not tools.
  headline: 'I design websites & apps, and automate the busywork that slows your business down.',
  // Shown under the headline and used as the default meta description
  description:
    'I help small businesses look professional online and stop losing leads: modern website and app design, plus done-for-you CRM and AI automations.',
  // TODO: where you are based / who you serve
  location: 'Based in Your City · working with clients everywhere',

  // TODO: the email address shown on the site (the contact form delivers to
  // CONTACT_TO_EMAIL, set in Vercel)
  email: 'hello@example.com',

  // TODO: optional booking link (Cal.com, Calendly…). Leave empty to send the
  // "Book a free call" buttons to the contact page instead.
  bookingUrl: '',

  // TODO: optional headshot, e.g. '/images/headshot.jpg' (put the file in public/images/)
  photo: '',

  // TODO: optional resume PDF, e.g. '/resume.pdf' (put the file in public/).
  // The download button on the About page only appears when this is set.
  resumeUrl: '',

  // TODO: the name of your white-label CRM & marketing platform
  platformName: 'Your Platform',

  // TODO: your profiles. Remove any you don't use.
  socials: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
    { label: 'GitHub', href: 'https://github.com/jeiujl' },
  ],

  // A message referrers can copy and send to people they want to introduce you to.
  // Give each referrer their own link, e.g. https://yoursite.com/?ref=dad, and
  // every inquiry email will say who sent it.
  referralBlurb:
    "I'd like to introduce you to Your Name, who builds websites and apps and sets up automations that follow up with leads, book appointments and send reminders automatically. Have a look:",
} as const;

export const nav = [
  { label: 'Work', href: '/work' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

/** Where every "Book a free call" button points. */
export const ctaHref = site.bookingUrl || '/contact';
