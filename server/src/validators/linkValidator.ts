import { z } from 'zod';
import { isValidCustomSlug, RESERVED_SLUGS } from '../utils/shortCodeGenerator';

export const createLinkSchema = z.object({
  originalUrl: z
    .string()
    .trim()
    .url('Please provide a valid URL (including http:// or https://)')
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return ['http:', 'https:'].includes(parsed.protocol);
        } catch {
          return false;
        }
      },
      { message: 'URL protocol must be http or https' }
    ),
  title: z.string().trim().max(100, 'Title must be 100 characters or less').optional(),
  customSlug: z
    .string()
    .trim()
    .min(3, 'Custom slug must be at least 3 characters')
    .max(30, 'Custom slug must be 30 characters or less')
    .refine(
      (slug) => isValidCustomSlug(slug),
      { message: 'Custom slug can only contain alphanumeric characters, hyphens, and underscores' }
    )
    .refine(
      (slug) => !RESERVED_SLUGS.has(slug.toLowerCase()),
      { message: 'This slug is reserved by the system' }
    )
    .optional()
    .nullable()
});

export const linkQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().optional()
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type LinkQueryInput = z.infer<typeof linkQuerySchema>;
