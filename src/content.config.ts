import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { disciplineKeys } from './lib/disciplines';
import { inquiryTypes } from './lib/inquiry';

// `sample: true` marks placeholder content. It shows a small "Sample" badge on
// the site so placeholder work is never mistaken for real client work.
// Remove the flag (or the whole file) once you replace it with your own.
const sample = z.boolean().default(false);

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      client: z.string(),
      summary: z.string(),
      category: z.enum(disciplineKeys),
      role: z.string(),
      tools: z.array(z.string()).default([]),
      year: z.number().int().optional(),
      duration: z.string().optional(),
      // Optional cover image (relative path to an image next to the .md file).
      // Without one, a styled preview is drawn based on the category.
      cover: image().optional(),
      coverAlt: z.string().optional(),
      gallery: z.array(z.object({ src: image(), alt: z.string() })).default([]),
      // Automation projects: the steps shown in the workflow diagram.
      workflow: z
        .array(z.object({ label: z.string(), detail: z.string().optional() }))
        .default([]),
      metrics: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
      liveUrl: z.url().optional(),
      featured: z.boolean().default(false),
      order: z.number().default(100),
      // Self-initiated design for a fictional brand. Shown with a "Concept"
      // badge and listed apart from client work.
      concept: z.boolean().default(false),
      sample,
    }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/testimonials' }),
  schema: z.object({
    quote: z.string(),
    name: z.string(),
    title: z.string(),
    company: z.string(),
    project: reference('projects').optional(),
    order: z.number().default(100),
    sample,
  }),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/services' }),
  schema: z.object({
    pillar: z.enum(['design', 'automation']),
    discipline: z.enum(disciplineKeys),
    title: z.string(),
    summary: z.string(),
    deliverables: z.array(z.string()),
    idealFor: z.string(),
    exampleResult: z.string(),
    // e.g. "From $1,500" or "From $297/mo". Leave out to show "Custom quote".
    startingAt: z.string().optional(),
    // Preselected option when someone clicks "Get started" on this service
    inquiryType: z.enum(inquiryTypes),
    order: z.number().default(100),
  }),
});

const automations = defineCollection({
  loader: file('./src/content/automations.yaml'),
  schema: z.object({
    name: z.string(),
    trigger: z.string(),
    action: z.string(),
    benefit: z.string(),
    order: z.number().default(100),
  }),
});

const experience = defineCollection({
  loader: file('./src/content/experience.yaml'),
  schema: z.object({
    role: z.string(),
    org: z.string(),
    // Which list the entry appears in on the About page
    kind: z.enum(['work', 'education']).default('work'),
    period: z.string().optional(),
    summary: z.string().optional(),
    order: z.number(),
    sample,
  }),
});

export const collections = { projects, testimonials, services, automations, experience };
