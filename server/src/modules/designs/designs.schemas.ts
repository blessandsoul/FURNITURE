import { z } from 'zod';

// ─── Design Schemas ──────────────────────────────────────

export const CreateDesignSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  name: z.string().min(1, 'Name is required').max(200),
  optionValueIds: z.array(z.string().uuid('Invalid option value ID')).min(1, 'At least one option must be selected'),
  roomImageUrl: z.string().max(500).optional(),
  roomThumbnailUrl: z.string().max(500).optional(),
});

export const UpdateDesignSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  optionValueIds: z.array(z.string().uuid('Invalid option value ID')).min(1, 'At least one option must be selected').optional(),
});

export const CalculatePriceSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  optionValueIds: z.array(z.string().uuid('Invalid option value ID')).min(1, 'At least one option must be selected'),
});

// ─── Inferred Types ──────────────────────────────────────

export type CreateDesignInput = z.infer<typeof CreateDesignSchema>;
export type UpdateDesignInput = z.infer<typeof UpdateDesignSchema>;
export type CalculatePriceInput = z.infer<typeof CalculatePriceSchema>;
