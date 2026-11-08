// The four services, each with its own color (used on tags, labels and
// shapes). Projects and services both point at one of these keys.
export const disciplines = {
  crm: { label: 'Sales systems', zh: '销售系统', hue: 'var(--hue-crm)' },
  ai: { label: 'AI agents', zh: 'AI 智能体', hue: 'var(--hue-ai)' },
  website: { label: 'Websites & growth', zh: '网站与增长', hue: 'var(--hue-website)' },
  app: { label: 'Apps', zh: '应用开发', hue: 'var(--hue-app)' },
} as const;

export type Discipline = keyof typeof disciplines;
export const disciplineKeys = Object.keys(disciplines) as [Discipline, ...Discipline[]];

export const disciplineLabel = (key: Discipline, lang: 'en' | 'zh') =>
  lang === 'zh' ? disciplines[key].zh : disciplines[key].label;
