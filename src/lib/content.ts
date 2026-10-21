import { getCollection } from 'astro:content';

export { disciplines } from './disciplines';

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
