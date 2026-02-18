import { z } from 'zod';

// ─── Category Schemas ────────────────────────────────────

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(2000).optional(),
  basePrice: z.number().min(0, 'Base price must be non-negative'),
  currency: z.string().length(3).default('GEL'),
  imageUrl: z.string().url().max(500).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).nullable().optional(),
  basePrice: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  imageUrl: z.string().url().max(500).nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// ─── Option Group Schemas ────────────────────────────────

export const CreateOptionGroupSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(2000).optional(),
  isRequired: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

export const UpdateOptionGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).nullable().optional(),
  isRequired: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// ─── Option Value Schemas ────────────────────────────────

export const CreateOptionValueSchema = z.object({
  groupId: z.string().uuid('Invalid option group ID'),
  label: z.string().min(1, 'Label is required').max(100),
  description: z.string().max(2000).optional(),
  priceModifier: z.number().default(0),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color').optional(),
  imageUrl: z.string().url().max(500).optional(),
  promptHint: z.string().max(2000).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const UpdateOptionValueSchema = z.object({
  label: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).nullable().optional(),
  priceModifier: z.number().optional(),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color').nullable().optional(),
  imageUrl: z.string().url().max(500).nullable().optional(),
  promptHint: z.string().max(2000).nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// ─── Inferred Types ──────────────────────────────────────

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
export type CreateOptionGroupInput = z.infer<typeof CreateOptionGroupSchema>;
export type UpdateOptionGroupInput = z.infer<typeof UpdateOptionGroupSchema>;
export type CreateOptionValueInput = z.infer<typeof CreateOptionValueSchema>;
export type UpdateOptionValueInput = z.infer<typeof UpdateOptionValueSchema>;
