import { z } from 'zod';

const emptyToUuid = (value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  return value;
};

const baseProductFormFields = {
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
  quantity: z.coerce
    .number()
    .int('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative')
    .optional()
    .default(0),
  assignUserId: z.preprocess(emptyToUuid, z.string().uuid('Select a seller').optional()),
};

export const buildProductFormSchema = ({ requireSellerForStock = false } = {}) =>
  z.object(baseProductFormFields).superRefine((data, ctx) => {
    if (requireSellerForStock && data.quantity > 0 && !data.assignUserId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select a seller when setting initial quantity',
        path: ['assignUserId'],
      });
    }
  });

/** Default schema — seller flows do not require assignUserId. */
export const productFormSchema = buildProductFormSchema();
