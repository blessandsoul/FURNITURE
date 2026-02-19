import { z } from 'zod';

export const GenerateSchema = z.object({
  designId: z.string().uuid(),
  freeText: z.string().max(500).optional(),
  roomImageUrl: z.string().url().optional(),
  placementInstructions: z.string().max(500).optional(),
});
export type GenerateInput = z.infer<typeof GenerateSchema>;

export const AdminGenerationsFilterSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']).optional(),
  userId: z.string().uuid().optional(),
});
export type AdminGenerationsFilter = z.infer<typeof AdminGenerationsFilterSchema>;

export const UserGenerationsFilterSchema = z.object({
  designId: z.string().uuid().optional(),
});
export type UserGenerationsFilter = z.infer<typeof UserGenerationsFilterSchema>;
