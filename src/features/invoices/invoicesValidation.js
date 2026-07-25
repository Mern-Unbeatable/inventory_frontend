import { z } from 'zod';

const emptyToUndefined = (value) => (value === '' ? undefined : value);

const invoiceItemSchema = z.object({
  productId: z.string().uuid('Select a product'),
  quantity: z.coerce.number().int().positive('Quantity must be at least 1'),
});

export const invoiceFormSchema = z.object({
  customerId: z.string().uuid('Select a customer'),
  sellerId: z.preprocess(emptyToUndefined, z.string().uuid('Select a seller').optional()),
  notes: z.preprocess(emptyToUndefined, z.string().max(2000).optional()),
  items: z.array(invoiceItemSchema).min(1, 'Add at least one item'),
});
