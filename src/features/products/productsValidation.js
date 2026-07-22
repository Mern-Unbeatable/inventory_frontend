import { z } from 'zod';

export const productFormSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(200),
  sku: z
    .string()
    .trim()
    .min(2, 'SKU is required')
    .max(100)
    .transform((value) => value.toUpperCase()),
  description: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal(''))
    .transform((value) => (value ? value : undefined)),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
});
