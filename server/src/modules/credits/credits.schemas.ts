import { z } from 'zod';

// ─── User Schemas ────────────────────────────────────────

export const PurchasePackageSchema = z.object({
  packageId: z.string().uuid('Invalid package ID'),
});

// ─── Admin Schemas ───────────────────────────────────────

export const AdminAdjustCreditsSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  amount: z.number().int('Amount must be an integer').refine((v) => v !== 0, 'Amount cannot be zero'),
  type: z.enum(['BONUS', 'ADJUSTMENT'], { message: 'Type must be BONUS or ADJUSTMENT' }),
  description: z.string().min(1, 'Description is required').max(500),
});

export const CreateCreditPackageSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  credits: z.number().int().min(1, 'Credits must be at least 1'),
  price: z.number().min(0, 'Price must be non-negative'),
  currency: z.string().length(3).default('GEL'),
  description: z.string().max(2000).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const UpdateCreditPackageSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  credits: z.number().int().min(1).optional(),
  price: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  description: z.string().max(2000).nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// ─── Inferred Types ──────────────────────────────────────

export type PurchasePackageInput = z.infer<typeof PurchasePackageSchema>;
export type AdminAdjustCreditsInput = z.infer<typeof AdminAdjustCreditsSchema>;
export type CreateCreditPackageInput = z.infer<typeof CreateCreditPackageSchema>;
export type UpdateCreditPackageInput = z.infer<typeof UpdateCreditPackageSchema>;
