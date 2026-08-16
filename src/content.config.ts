import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    lang: z.enum(['en', 'fr']),
    title: z.string(),
  }),
})

export const collections = { projects }
