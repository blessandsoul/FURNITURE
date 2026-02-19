'use client';

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
    if (!selectedPackage) return <></>;

    const currencySymbol = selectedPackage.currency === 'GEL' ? '₾' : '$';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-primary" weight="duotone" />
                        Confirm Purchase
                    </DialogTitle>
                    <DialogDescription>
                        Review the package details before purchasing.
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
                        {selectedPackage.credits.toLocaleString()} credits will be added
                        to your balance
                    </p>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button onClick={onConfirm} disabled={isPending}>
                        {isPending
                            ? 'Processing...'
                            : `Buy ${selectedPackage.credits.toLocaleString()} Credits`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
