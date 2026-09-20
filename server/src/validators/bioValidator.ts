import { z } from 'zod';

const socialLinkItemSchema = z.object({
  platform: z.string().trim().min(1, 'Platform is required'),
  url: z.string().trim().url('Valid URL required for social link'),
  title: z.string().trim().min(1, 'Title is required'),
  isEnabled: z.boolean().default(true)
});

export const updateBioSchema = z.object({
  displayName: z.string().trim().min(1, 'Display name cannot be empty').max(50),
  avatarUrl: z.string().trim().optional(),
  bio: z.string().trim().max(500, 'Bio cannot exceed 500 characters').optional(),
  theme: z.enum(['minimal-light', 'dark-slate', 'gradient', 'midnight-aurora', 'paper-studio']),
  socialLinks: z.array(socialLinkItemSchema).optional(),
  showcaseLinkIds: z.array(z.string()).optional()
});

export type UpdateBioInput = z.infer<typeof updateBioSchema>;
