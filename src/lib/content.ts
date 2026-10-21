import { getCollection, type CollectionEntry } from 'astro:content';

export const categoryLabels = {
  website: 'Website',
  app: 'App design',
  automation: 'Automation',
} as const satisfies Record<CollectionEntry<'projects'>['data']['category'], string>;

const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;

export async function getProjects() {
  return (await getCollection('projects')).sort(byOrder);
}

export async function getTestimonials() {
  return (await getCollection('testimonials')).sort(byOrder);
}

export async function getServices() {
  return (await getCollection('services')).sort(byOrder);
}
