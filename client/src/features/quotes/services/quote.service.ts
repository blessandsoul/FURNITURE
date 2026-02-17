import type { QuoteRequest } from '../types/quote.types';

class QuoteService {
    async submitQuote(data: QuoteRequest): Promise<void> {
        const response = await fetch('/api/quotes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(
                (errorData as { error?: { message?: string } })?.error?.message
                    ?? 'Failed to submit quote request',
            );
        }
    }
}

export const quoteService = new QuoteService();
