import { z } from 'zod';

export const quoteRequestSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(7, 'Please enter a valid phone number'),
    email: z.union([z.string().email('Please enter a valid email address'), z.literal('')]).optional(),
    city: z.string().optional(),
    message: z.string().max(500, 'Message must be under 500 characters').optional(),
});

export type QuoteFormValues = z.infer<typeof quoteRequestSchema>;
