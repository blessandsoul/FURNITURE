import { z } from 'zod';

export const quoteRequestSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().optional(),
    city: z.string().optional(),
    message: z.string().max(500, 'Message must be under 500 characters').optional(),
});

export type QuoteFormValues = z.infer<typeof quoteRequestSchema>;
