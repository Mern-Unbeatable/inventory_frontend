import { z } from "zod";

export const verificationFormSchema = z.object({
  qrId: z
    .string()
    .trim()
    .min(4, "QR ID must be at least 4 characters")
    .max(64, "QR ID must be at most 64 characters")
    .regex(
      /^[A-Za-z0-9_-]+$/,
      'Only letters, numbers, "-" and "_" are allowed',
    ),
  productId: z.string().uuid("Select a product"),
  status: z.enum(["ACTIVE", "DISABLED"]).optional(),
});
