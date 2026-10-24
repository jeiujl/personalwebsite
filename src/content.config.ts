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
      // Marks demo projects in this prototype (not shown on the site), so
      // they're easy to find and replace with real work.
      concept: z.boolean().default(false),
      sample,
    }),
});

// Chinese versions of the projects, one file per project with the same file
// name (e.g. projects-zh/flowa-ai.md). The body is the translated write-up;
// any field left out falls back to the English one.
const projectsZh = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects-zh' }),
  schema: z.object({
    title: z.string(),
    client: z.string().optional(),
    summary: z.string(),
    role: z.string().optional(),
    tools: z.array(z.string()).optional(),
    duration: z.string().optional(),
    coverAlt: z.string().optional(),
    // Alt text for each gallery image, in the same order as the English file
    galleryAlts: z.array(z.string()).optional(),
    workflow: z.array(z.object({ label: z.string(), detail: z.string().optional() })).optional(),
    metrics: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
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
    // Chinese text for the /zh pages
    zh: z
      .object({
        title: z.string(),
        summary: z.string(),
        deliverables: z.array(z.string()),
        idealFor: z.string(),
        exampleResult: z.string(),
        startingAt: z.string(),
      })
      .partial()
      .optional(),
  }),
});

// Live demo websites, shown in the Demos section. One file per demo; the
// Chinese text sits in the `zh` block.
const demos = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/demos' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      // What kind of site it is, e.g. "Private aviation website"
      kind: z.string(),
      summary: z.string(),
      url: z.url(),
      cover: image(),
      coverAlt: z.string(),
      // Just the site, no browser frame: shown in the live preview until it loads
      preview: image(),
      highlights: z.array(z.string()).default([]),
      tools: z.array(z.string()).default([]),
      order: z.number().default(100),
      zh: z
        .object({ kind: z.string(), summary: z.string(), coverAlt: z.string(), highlights: z.array(z.string()) })
        .partial()
        .optional(),
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
    zh: z
      .object({ name: z.string(), trigger: z.string(), action: z.string(), benefit: z.string() })
      .partial()
      .optional(),
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
    zh: z
      .object({ role: z.string(), org: z.string(), period: z.string(), summary: z.string() })
      .partial()
      .optional(),
  }),
});

export const collections = { projects, projectsZh, demos, testimonials, services, automations, experience };
