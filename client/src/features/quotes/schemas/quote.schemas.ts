import { z } from 'zod';

export const quoteRequestSchema = z.object({
    contactName: z.string().min(2, 'Name must be at least 2 characters'),
    contactEmail: z.string().email('Please enter a valid email address'),
    contactPhone: z.string().min(7, 'Please enter a valid phone number'),
    message: z.string().max(500, 'Message must be under 500 characters').optional(),
});

export type QuoteFormValues = z.infer<typeof quoteRequestSchema>;
