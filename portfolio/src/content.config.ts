import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Single source of truth for the project status enum. StatusBadge.astro and
 * ProjectLayout.astro import ProjectStatus from here instead of re-declaring
 * the same union, so the three never drift apart when a status is added.
 */
export const PROJECT_STATUSES = ["planificació", "desplegament", "producció", "completat", "arxivat"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

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
    status: z.enum(PROJECT_STATUSES),
    dateUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "dateUpdated must be an ISO date (YYYY-MM-DD)"),
    techStack: z.array(z.string()),
    tags: z.array(z.string()),
  }),
});

export const collections = { projects };
