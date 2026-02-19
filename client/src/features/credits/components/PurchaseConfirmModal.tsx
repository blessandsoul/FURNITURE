'use client';

import { useTranslations } from 'next-intl';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from '@phosphor-icons/react';
import type { CreditPackage } from '../types/credits.types';

interface PurchaseConfirmModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedPackage: CreditPackage | null;
    onConfirm: () => void;
    isPending: boolean;
}

export function PurchaseConfirmModal({
    open,
    onOpenChange,
    selectedPackage,
    onConfirm,
    isPending,
}: PurchaseConfirmModalProps): React.ReactElement {
    const t = useTranslations('Credits');
    const tCommon = useTranslations('Common');

    if (!selectedPackage) return <></>;

    const currencySymbol = selectedPackage.currency === 'GEL' ? '₾' : '$';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-primary" weight="duotone" />
                        {t('purchaseModal.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('purchaseModal.description')}
                    </DialogDescription>
                </DialogHeader>

                {/* Package summary */}
                <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                    <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">
                            {selectedPackage.name}
                        </span>
                        <span className="text-lg font-bold tabular-nums text-foreground">
                            {currencySymbol}
                            {selectedPackage.price.toLocaleString()}
                        </span>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                        {t('purchaseModal.creditsAdded', { count: selectedPackage.credits.toLocaleString() })}
                    </p>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        {tCommon('cancel')}
                    </Button>
                    <Button onClick={onConfirm} disabled={isPending}>
                        {isPending
                            ? t('purchaseModal.processing')
                            : t('purchaseModal.buyCredits', { count: selectedPackage.credits.toLocaleString() })}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
