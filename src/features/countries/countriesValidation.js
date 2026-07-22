import { z } from 'zod';

export const countryFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  code: z
    .string()
    .trim()
    .max(10)
    .optional()
    .or(z.literal(''))
    .transform((value) => (value ? value.toUpperCase() : undefined)),
});
