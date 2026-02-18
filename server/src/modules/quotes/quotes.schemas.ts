import { z } from 'zod';

// ─── Quote Schemas ──────────────────────────────────────

export const CreateQuoteSchema = z.object({
  designId: z.string().uuid('Invalid design ID'),
  contactName: z.string().min(1, 'Contact name is required').max(100),
  contactEmail: z.string().email('Invalid email address').max(255),
  contactPhone: z.string().min(1, 'Contact phone is required').max(20),
  message: z.string().max(2000).optional(),
});

export const UpdateQuoteStatusSchema = z.object({
  status: z.enum(['PENDING', 'VIEWED', 'CONTACTED', 'COMPLETED', 'CANCELLED'], {
    message: 'Invalid quote status',
  }),
});

export const UpdateQuoteNotesSchema = z.object({
  adminNotes: z.string().max(5000, 'Notes must be under 5000 characters'),
});

export const AdminQuoteFiltersSchema = z.object({
  status: z
    .enum(['PENDING', 'VIEWED', 'CONTACTED', 'COMPLETED', 'CANCELLED'])
    .optional(),
});

// ─── Inferred Types ──────────────────────────────────────

export type CreateQuoteInput = z.infer<typeof CreateQuoteSchema>;
export type UpdateQuoteStatusInput = z.infer<typeof UpdateQuoteStatusSchema>;
export type UpdateQuoteNotesInput = z.infer<typeof UpdateQuoteNotesSchema>;
export type AdminQuoteFiltersInput = z.infer<typeof AdminQuoteFiltersSchema>;
