import { z } from 'zod';
import { isValidCustomSlug, RESERVED_SLUGS } from '../utils/shortCodeGenerator';
import { env } from '../config/env';

/**
 * Detects whether a target URL points to this application's own redirect engine (/r/:slug),
 * which would cause a circular redirect loop.
 */
export const isSelfReferencingRedirect = (url: string, slug?: string | null): boolean => {
  try {
    const parsed = new URL(url);

    const hostsToCheck = new Set<string>();
    if (env.BASE_URL) {
      try {
        hostsToCheck.add(new URL(env.BASE_URL).host.toLowerCase());
      } catch {
        /* ignore invalid config */
      }
    }
    if (env.CLIENT_URL) {
      try {
        hostsToCheck.add(new URL(env.CLIENT_URL).host.toLowerCase());
      } catch {
        /* ignore invalid config */
      }
    }
    hostsToCheck.add(`localhost:${env.PORT}`);
    hostsToCheck.add(`127.0.0.1:${env.PORT}`);
    hostsToCheck.add('localhost:5001');
    hostsToCheck.add('127.0.0.1:5001');

    const targetHost = parsed.host.toLowerCase();
    const pathname = parsed.pathname;

    if (hostsToCheck.has(targetHost) && pathname.startsWith('/r/')) {
      return true;
    }

    if (slug && pathname.toLowerCase() === `/r/${slug.toLowerCase().trim()}`) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
};

export const createLinkSchema = z
  .object({
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
  })
  .refine(
    (data) => !isSelfReferencingRedirect(data.originalUrl, data.customSlug),
    {
      message: 'Self-referencing redirect loops are not permitted. Original URL cannot point to the /r/ redirect engine.',
      path: ['originalUrl']
    }
  );

export const linkQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().optional()
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type LinkQueryInput = z.infer<typeof linkQuerySchema>;
