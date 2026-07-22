import { z } from 'zod';

export const createUserSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().trim().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['ADMIN', 'SELLER']),
    branchId: z
      .string()
      .uuid()
      .optional()
      .or(z.literal(''))
      .transform((value) => (value ? value : undefined)),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'SELLER' && !data.branchId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['branchId'],
        message: 'Sellers must be assigned to a branch',
      });
    }
  });

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    email: z.string().trim().email().optional(),
    password: z
      .string()
      .optional()
      .or(z.literal(''))
      .transform((value) => (value ? value : undefined))
      .refine((value) => value === undefined || value.length >= 8, {
        message: 'Password must be at least 8 characters',
      }),
    role: z.enum(['ADMIN', 'SELLER']).optional(),
    branchId: z
      .string()
      .uuid()
      .optional()
      .or(z.literal(''))
      .nullable()
      .transform((value) => (value === '' ? null : value)),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Provide at least one field to update',
  });
