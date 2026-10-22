// The four services, each with its own color (used on tags, labels and
// shapes). Projects and services both point at one of these keys.
export const disciplines = {
  website: { label: 'Websites', hue: 'var(--hue-website)' },
  app: { label: 'App design', hue: 'var(--hue-app)' },
  crm: { label: 'CRM platform', hue: 'var(--hue-crm)' },
  ai: { label: 'AI automation', hue: 'var(--hue-ai)' },
} as const;

export type Discipline = keyof typeof disciplines;
export const disciplineKeys = Object.keys(disciplines) as [Discipline, ...Discipline[]];
