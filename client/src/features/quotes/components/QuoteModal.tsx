'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
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
import { getErrorMessage } from '@/lib/utils/error';
import { useDesign } from '@/features/designs/hooks/useDesigns';
import { useSubmitQuote } from '../hooks/useQuotes';
import { quoteRequestSchema } from '../schemas/quote.schemas';
import type { QuoteFormValues } from '../schemas/quote.schemas';

interface QuoteModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    designId: string;
}

export function QuoteModal({ open, onOpenChange, designId }: QuoteModalProps): React.JSX.Element {
    const t = useTranslations('Quotes');
    const { data: design } = useDesign(designId);
    const submitQuote = useSubmitQuote();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<QuoteFormValues>({
        resolver: zodResolver(quoteRequestSchema),
        defaultValues: { contactName: '', contactEmail: '', contactPhone: '', message: '' },
    });

    const onSubmit = useCallback(
        (formData: QuoteFormValues) => {
            submitQuote.mutateAsync({
                designId,
                contactName: formData.contactName,
                contactEmail: formData.contactEmail,
                contactPhone: formData.contactPhone,
                message: formData.message || undefined,
            })
                .then(() => {
                    toast.success(t('successToast'));
                    reset();
                    onOpenChange(false);
                })
                .catch((error: unknown) => {
                    toast.error(getErrorMessage(error));
                });
        },
        [designId, submitQuote, reset, onOpenChange],
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                    <DialogDescription>
                        {t('description')}
                    </DialogDescription>
                </DialogHeader>

                {/* Design summary */}
                {design && (
                    <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">
                                {design.name}
                            </span>
                            <span className="text-sm font-bold tabular-nums text-foreground">
                                ${design.totalPrice.toLocaleString()}
                            </span>
                        </div>
                        {design.configSnapshot?.options && design.configSnapshot.options.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                                {design.configSnapshot.options.map((opt) => (
                                    <span
                                        key={`${opt.groupSlug}-${opt.valueSlug}`}
                                        className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                                    >
                                        {opt.valueLabel}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="quote-name">{t('nameLabel')}</Label>
                        <Input
                            id="quote-name"
                            placeholder={t('namePlaceholder')}
                            aria-invalid={!!errors.contactName}
                            {...register('contactName')}
                        />
                        {errors.contactName && (
                            <p className="text-xs text-destructive">{errors.contactName.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quote-email">{t('emailLabel')}</Label>
                        <Input
                            id="quote-email"
                            type="email"
                            placeholder={t('emailPlaceholder')}
                            aria-invalid={!!errors.contactEmail}
                            {...register('contactEmail')}
                        />
                        {errors.contactEmail && (
                            <p className="text-xs text-destructive">{errors.contactEmail.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quote-phone">{t('phoneLabel')}</Label>
                        <Input
                            id="quote-phone"
                            type="tel"
                            placeholder={t('phonePlaceholder')}
                            aria-invalid={!!errors.contactPhone}
                            {...register('contactPhone')}
                        />
                        {errors.contactPhone && (
                            <p className="text-xs text-destructive">{errors.contactPhone.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quote-message">{t('messageLabel')}</Label>
                        <Textarea
                            id="quote-message"
                            placeholder={t('messagePlaceholder')}
                            rows={3}
                            {...register('message')}
                        />
                        {errors.message && (
                            <p className="text-xs text-destructive">{errors.message.message}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={submitQuote.isPending}
                        className="w-full"
                    >
                        {submitQuote.isPending ? t('sending') : t('sendQuoteRequest')}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
