import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { localized, type Lang } from '../i18n';

export { disciplines } from './disciplines';

const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;

/**
 * Projects with their text in the page's language. On Chinese pages, fields
 * from projects-zh/<same name>.md replace the English ones.
 */
export async function getProjects(lang: Lang = 'en') {
  const projects = (await getCollection('projects')).sort(byOrder);
  if (lang === 'en') return projects;
  return Promise.all(
    projects.map(async (project): Promise<CollectionEntry<'projects'>> => {
      const zh = (await getEntry('projectsZh', project.id))?.data;
      if (!zh) return project;
      const { galleryAlts, ...fields } = zh;
      const defined = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
      return {
        ...project,
        data: {
          ...project.data,
          ...defined,
          gallery: project.data.gallery.map((img, i) => ({ ...img, alt: galleryAlts?.[i] ?? img.alt })),
        },
      };
    }),
  );
}

/** The entry to render for a project's write-up: the Chinese one when there is one. */
export async function getProjectBody(project: CollectionEntry<'projects'>, lang: Lang) {
  return (lang === 'zh' && (await getEntry('projectsZh', project.id))) || project;
}

export async function getTestimonials() {
  return (await getCollection('testimonials')).sort(byOrder);
}

export async function getServices(lang: Lang = 'en') {
  return (await getCollection('services'))
    .sort(byOrder)
    .map((service) => ({ ...service, data: localized(service.data, lang) }));
}

export async function getDemos(lang: Lang = 'en') {
  return (await getCollection('demos'))
    .sort(byOrder)
    .map((demo) => ({ ...demo, data: localized(demo.data, lang) }));
}

export async function getAutomations(lang: Lang = 'en') {
  return (await getCollection('automations'))
    .sort(byOrder)
    .map((recipe) => ({ ...recipe, data: localized(recipe.data, lang) }));
}

export async function getExperience(lang: Lang = 'en') {
  return (await getCollection('experience'))
    .sort(byOrder)
    .map((entry) => ({ ...entry, data: localized(entry.data, lang) }));
}
