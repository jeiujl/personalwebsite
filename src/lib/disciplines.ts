// The four services, each with its own color (used on tags, labels and
// shapes). Projects and services both point at one of these keys.
export const disciplines = {
  website: { label: 'Websites', zh: '网站设计', hue: 'var(--hue-website)' },
  app: { label: 'App design', zh: '应用设计', hue: 'var(--hue-app)' },
  crm: { label: 'CRM platform', zh: 'CRM 平台', hue: 'var(--hue-crm)' },
  ai: { label: 'AI automation', zh: 'AI 自动化', hue: 'var(--hue-ai)' },
} as const;

export type Discipline = keyof typeof disciplines;
export const disciplineKeys = Object.keys(disciplines) as [Discipline, ...Discipline[]];

export const disciplineLabel = (key: Discipline, lang: 'en' | 'zh') =>
  lang === 'zh' ? disciplines[key].zh : disciplines[key].label;
