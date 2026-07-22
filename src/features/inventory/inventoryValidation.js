import { z } from 'zod';

export const assignStockSchema = z.object({
  userId: z.string().uuid('Select a seller'),
  productId: z.string().uuid('Select a product'),
  quantity: z.coerce.number().int().min(0, 'Quantity cannot be negative'),
});

export const setQuantitySchema = z.object({
  quantity: z.coerce.number().int().min(0, 'Quantity cannot be negative'),
});

export const adjustQuantitySchema = z.object({
  delta: z.coerce
    .number()
    .int()
    .refine((value) => value !== 0, { message: 'Delta must be non-zero' }),
});

export const sellStockSchema = z.object({
  quantity: z.coerce.number().int().positive('Sold quantity must be at least 1'),
});
