import { z } from 'zod';

const emptyToUndefined = (value) => (value === '' ? undefined : value);

export const customerFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(150),
  email: z.preprocess(
    emptyToUndefined,
    z.string().email('Enter a valid email').optional()
  ),
  phone: z.preprocess(emptyToUndefined, z.string().max(30).optional()),
  address: z.preprocess(emptyToUndefined, z.string().max(300).optional()),
  notes: z.preprocess(emptyToUndefined, z.string().max(2000).optional()),
  countryId: z.string().uuid('Select a country'),
  branchId: z.string().uuid('Select a branch'),
});

export const portalAccountSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const portalPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm the new password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
