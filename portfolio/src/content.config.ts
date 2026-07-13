import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Zod schema for project frontmatter.
 * Each project lives in src/content/projects/<slug>/index.mdx.
 */
const projects = defineCollection({
  loader: glob({ pattern: "**/index.mdx", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    summary: z.string(),
    status: z.enum(["planificació", "desplegament", "producció", "completat", "arxivat"]),
    dateUpdated: z.string(), // ISO date string
    techStack: z.array(z.string()),
    tags: z.array(z.string()),
  }),
});

export const collections = { projects };
