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
  tagline: 'AI systems for sales & operations',
  // The giant homepage headline, one entry per line. Short words work best.
  heroDisplay: ['AI systems', 'for sales &', 'operations'],
  // The sentence under it. Keep it about outcomes, not tools.
  headline: 'I build AI systems that answer every lead, follow up until they book, and take the busywork off your team.',
  // Shown under the headline and used as the default meta description
  description:
    'AI systems for small and mid-sized businesses: lead follow-up that books more customers, AI agents that handle quotes, onboarding and paperwork, and the websites and campaigns that bring leads in. Built, run and improved for you.',
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
    { value: '4', label: 'Systems', note: 'Sales, AI agents, growth & apps' },
    { value: '24/7', label: 'Automations on duty', note: 'They keep working after hours' },
    { value: '20', label: 'Minute first call, free', note: 'Talk it through, no pressure' },
  ],

  // A message referrers can copy and send to people they want to introduce you to.
  // Give each referrer their own link, e.g. https://yoursite.com/?ref=dad, and
  // every inquiry email will say who sent it.
  referralBlurb:
    "I'd like to introduce you to Jerry Liu. He builds AI systems that answer and follow up with every lead and take admin work off your team, plus the websites that bring customers in. Have a look:",
} as const;

// Chinese versions of the text above, shown on the /zh pages. Anything not
// listed here (name, links, photo…) is shared with the English site.
const siteZh = {
  tagline: '为销售与运营打造的 AI 系统',
  heroDisplay: ['为销售与', '运营打造', 'AI 系统'],
  headline: '我打造 AI 系统：回复每一位潜在客户，持续跟进直到对方预约，并把繁琐工作从你的团队手中接过来。',
  description: '为中小企业打造 AI 系统：让更多潜在客户成交的跟进系统，处理报价、客户入驻和文书工作的 AI 智能体，以及带来客户的网站和推广。由我搭建、运行并持续优化。',
  location: '加拿大多伦多与滑铁卢 · 欢迎各地客户',
  photoAlt: 'Jerry Liu 夜晚站在布鲁克林大桥上',
  stats: [
    { value: '4', label: '涉及行业', note: '航空、牙科、服装与 AI' },
    { value: '4', label: '系统类型', note: '销售、AI 智能体、增长与应用' },
    { value: '24/7', label: '自动化全天候运行', note: '下班后也在为你工作' },
    { value: '20', label: '分钟免费初次通话', note: '聊聊你的需求，没有压力' },
  ],
  referralBlurb:
    '想向你介绍 Jerry Liu。他打造 AI 系统，回复并跟进每一位潜在客户，把行政工作从团队手中接过来，也会做带来客户的网站。可以看看：',
};

export function getSite(lang: Lang) {
  return lang === 'zh' ? { ...site, ...siteZh } : site;
}

const navItems = [
  { en: 'Work', zh: '作品', href: '/work' },
  { en: 'Demos', zh: '演示', href: '/demos' },
  { en: 'Services', zh: '服务', href: '/services' },
  { en: 'About', zh: '关于', href: '/about' },
  { en: 'Contact', zh: '联系', href: '/contact' },
] as const;

export const getNav = (lang: Lang) =>
  navItems.map((item) => ({ label: item[lang], href: localizePath(item.href, lang) }));

/** Where every "Book a free call" button points. */
export const getCtaHref = (lang: Lang) => site.bookingUrl || localizePath('/contact', lang);
