import { z } from 'zod';

export const PAYMENT_METHODS = ['CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CARD', 'OTHER'];

export const paymentFormSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  paymentMethod: z.enum(PAYMENT_METHODS).default('CASH'),
  notes: z.string().max(1000).optional().or(z.literal('')),
});
