import { z } from 'zod';

const emptyToUndefined = (value) => (value === '' ? undefined : value);

const invoiceItemSchema = z.object({
  productId: z.string().uuid('Select a product'),
  quantity: z.coerce.number().int().positive('Quantity must be at least 1'),
});

/**
 * Builds a create invoice schema that also validates stock + uniqueness
 * against the currently loaded seller inventory options.
 *
 * @param {Array<{ value: string, quantity: number }>} productOptions
 * @param {{ requireSeller?: boolean }} [options]
 */
export const buildInvoiceFormSchema = (
  productOptions = [],
  { requireSeller = false } = {},
) => {
  const stockByProduct = new Map(
    productOptions.map((option) => [option.value, option.quantity]),
  );

  return z
    .object({
      customerId: z.string().uuid('Select a customer'),
      sellerId: z.preprocess(
        emptyToUndefined,
        z.string().uuid('Select a seller').optional(),
      ),
      notes: z.preprocess(emptyToUndefined, z.string().max(2000).optional()),
      items: z.array(invoiceItemSchema).min(1, 'Add at least one item'),
    })
    .superRefine((data, ctx) => {
      if (requireSeller && !data.sellerId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sellerId'],
          message: 'Select a seller',
        });
      }

      const seen = new Set();

      data.items.forEach((item, index) => {
        if (seen.has(item.productId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['items', index, 'productId'],
            message: 'This product is already on the invoice',
          });
        } else {
          seen.add(item.productId);
        }

        if (!stockByProduct.has(item.productId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['items', index, 'productId'],
            message: 'Product is not in seller stock (or is out of stock)',
          });
          return;
        }

        const available = stockByProduct.get(item.productId);
        if (available <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['items', index, 'productId'],
            message: 'Product is out of stock',
          });
          return;
        }

        if (item.quantity > available) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['items', index, 'quantity'],
            message: `Quantity cannot exceed available stock (${available})`,
          });
        }
      });
    });
};

/** Static schema kept for backwards-compatible imports (no stock checks). */
export const invoiceFormSchema = buildInvoiceFormSchema([]);

/**
 * Edit-draft schema: notes + items with stock/uniqueness checks.
 */
export const buildEditInvoiceSchema = (productOptions = []) => {
  const stockByProduct = new Map(
    productOptions.map((option) => [option.value, option.quantity]),
  );

  return z
    .object({
      notes: z.string().max(2000).optional().or(z.literal('')),
      items: z.array(invoiceItemSchema).min(1, 'Add at least one item'),
    })
    .superRefine((data, ctx) => {
      const seen = new Set();

      data.items.forEach((item, index) => {
        if (seen.has(item.productId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['items', index, 'productId'],
            message: 'This product is already on the invoice',
          });
        } else {
          seen.add(item.productId);
        }

        if (!stockByProduct.has(item.productId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['items', index, 'productId'],
            message: 'Product is not in seller stock (or is out of stock)',
          });
          return;
        }

        const available = stockByProduct.get(item.productId);
        if (available <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['items', index, 'productId'],
            message: 'Product is out of stock',
          });
          return;
        }

        if (item.quantity > available) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['items', index, 'quantity'],
            message: `Quantity cannot exceed available stock (${available})`,
          });
        }
      });
    });
};
