import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password must be less than 100 characters'),
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address')
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password must be less than 100 characters')
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
