import headshot from '../assets/jerry-liu.jpg';
import { localizePath, type Lang } from '../i18n';

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

  // The homepage stats band. Numbers count up as they scroll into view.
  // Keep them true: clients check. TODO: as your numbers grow, swap in your
  // own, e.g. { value: '25+', label: 'Businesses helped', note: 'Across Ontario' }.
  stats: [
    { value: '4', label: 'Industries', note: 'Aviation, dental, fashion & AI' },
    { value: '4', label: 'Services', note: 'Websites, apps, CRM & automations' },
    { value: '24/7', label: 'Automations on duty', note: 'They keep working after hours' },
    { value: '20', label: 'Minute first call, free', note: 'Talk it through, no pressure' },
  ],

  // A message referrers can copy and send to people they want to introduce you to.
  // Give each referrer their own link, e.g. https://yoursite.com/?ref=dad, and
  // every inquiry email will say who sent it.
  referralBlurb:
    "I'd like to introduce you to Jerry Liu, who designs websites and apps and sets up automations, like missed-call text-back, so businesses stop losing callers. Have a look:",
} as const;

// Chinese versions of the text above, shown on the /zh pages. Anything not
// listed here (name, links, photo…) is shared with the English site.
const siteZh = {
  tagline: '为小企业打造网站、应用和自动化',
  heroDisplay: ['网站、', '应用与', '自动化'],
  headline: '我为企业设计网站和应用，并把拖慢业务的繁琐工作自动化。',
  description: '帮助小企业在网上展现专业形象，不再流失潜在客户：现代化的网站与应用设计，以及全程代办的 CRM 和 AI 自动化。',
  location: '加拿大多伦多与滑铁卢 · 欢迎各地客户',
  photoAlt: 'Jerry Liu 夜晚站在布鲁克林大桥上',
  stats: [
    { value: '4', label: '涉及行业', note: '航空、牙科、服装与 AI' },
    { value: '4', label: '服务项目', note: '网站、应用、CRM 与自动化' },
    { value: '24/7', label: '自动化全天候运行', note: '下班后也在为你工作' },
    { value: '20', label: '分钟免费初次通话', note: '聊聊你的需求，没有压力' },
  ],
  referralBlurb:
    '想向你介绍 Jerry Liu。他设计网站和应用，也会搭建自动化（比如未接来电自动回短信），让企业不再错过来电客户。可以看看：',
};

export function getSite(lang: Lang) {
  return lang === 'zh' ? { ...site, ...siteZh } : site;
}

const navItems = [
  { en: 'Work', zh: '作品', href: '/work' },
  { en: 'Services', zh: '服务', href: '/services' },
  { en: 'About', zh: '关于', href: '/about' },
  { en: 'Contact', zh: '联系', href: '/contact' },
] as const;

export const getNav = (lang: Lang) =>
  navItems.map((item) => ({ label: item[lang], href: localizePath(item.href, lang) }));

/** Where every "Book a free call" button points. */
export const getCtaHref = (lang: Lang) => site.bookingUrl || localizePath('/contact', lang);
