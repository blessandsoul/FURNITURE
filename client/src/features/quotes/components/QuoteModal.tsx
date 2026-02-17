'use client';

import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useConfigurator } from '@/features/configurator/hooks/useConfigurator';
import { usePriceCalculator } from '@/features/configurator/hooks/usePriceCalculator';
import { quoteRequestSchema } from '../schemas/quote.schemas';
import { quoteService } from '../services/quote.service';
import type { QuoteFormValues } from '../schemas/quote.schemas';
import type { QuoteRequest } from '../types/quote.types';

interface QuoteModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    imageUrl: string | undefined;
}

export function QuoteModal({ open, onOpenChange, imageUrl }: QuoteModalProps): React.JSX.Element {
    const { selectedStyle, selectedOptions } = useConfigurator();
    const breakdown = usePriceCalculator();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<QuoteFormValues>({
        resolver: zodResolver(quoteRequestSchema),
        defaultValues: { name: '', email: '', phone: '', city: '', message: '' },
    });

    const onSubmit = useCallback(async (formData: QuoteFormValues) => {
        if (!selectedStyle) return;

        setIsSubmitting(true);
        try {
            const quoteData: QuoteRequest = {
                ...formData,
                phone: formData.phone || undefined,
                city: formData.city || undefined,
                message: formData.message || undefined,
                design: {
                    styleId: selectedStyle.id,
                    styleLabel: selectedStyle.label,
                    options: selectedOptions.map((opt) => ({
                        category: opt.category,
                        label: opt.label,
                        priceModifier: opt.priceModifier,
                    })),
                    totalPrice: breakdown.total,
                    imageUrl,
                },
            };

            await quoteService.submitQuote(quoteData);
            toast.success('Quote request sent! We\'ll get back to you soon.');
            reset();
            onOpenChange(false);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : 'Failed to send quote request',
            );
        } finally {
            setIsSubmitting(false);
        }
    }, [selectedStyle, selectedOptions, breakdown.total, imageUrl, reset, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Request a Quote</DialogTitle>
                    <DialogDescription>
                        Tell us how to reach you and we&apos;ll send a detailed quote for your design.
                    </DialogDescription>
                </DialogHeader>

                {/* Design summary */}
                {selectedStyle && (
                    <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">
                                {selectedStyle.label}
                            </span>
                            <span className="text-sm font-bold tabular-nums text-foreground">
                                ${breakdown.total.toLocaleString()}
                            </span>
                        </div>
                        {selectedOptions.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                                {selectedOptions.map((opt) => (
                                    <span
                                        key={opt.id}
                                        className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                                    >
                                        {opt.label}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="quote-name">Name *</Label>
                        <Input
                            id="quote-name"
                            placeholder="Your full name"
                            aria-invalid={!!errors.name}
                            {...register('name')}
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quote-email">Email *</Label>
                        <Input
                            id="quote-email"
                            type="email"
                            placeholder="you@example.com"
                            aria-invalid={!!errors.email}
                            {...register('email')}
                        />
                        {errors.email && (
                            <p className="text-xs text-destructive">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="quote-phone">Phone</Label>
                            <Input
                                id="quote-phone"
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                {...register('phone')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quote-city">City</Label>
                            <Input
                                id="quote-city"
                                placeholder="Your city"
                                {...register('city')}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quote-message">Message</Label>
                        <Textarea
                            id="quote-message"
                            placeholder="Any special requirements or questions..."
                            rows={3}
                            {...register('message')}
                        />
                        {errors.message && (
                            <p className="text-xs text-destructive">{errors.message.message}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full"
                    >
                        {isSubmitting ? 'Sending...' : 'Send Quote Request'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
