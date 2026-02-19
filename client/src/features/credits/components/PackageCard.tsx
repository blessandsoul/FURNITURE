'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CreditPackage } from '../types/credits.types';

interface PackageCardProps {
    creditPackage: CreditPackage;
    isBestValue: boolean;
    onPurchase: (packageId: string) => void;
    isPurchasing: boolean;
}

export function PackageCard({
    creditPackage,
    isBestValue,
    onPurchase,
    isPurchasing,
}: PackageCardProps): React.ReactElement {
    const perCredit = (creditPackage.price / creditPackage.credits).toFixed(2);
    const currencySymbol = creditPackage.currency === 'GEL' ? '₾' : '$';

    return (
        <div
            className={cn(
                'relative flex flex-col overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
                isBestValue
                    ? 'border-primary ring-1 ring-primary/20'
                    : 'border-border/50'
            )}
        >
            {/* Best value ribbon */}
            {isBestValue && (
                <div className="absolute -right-8 top-3 rotate-45 bg-primary px-8 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                    Best Value
                </div>
            )}

            {/* Credits amount */}
            <div className="mb-4">
                <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
                    {creditPackage.credits.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">credits</p>
            </div>

            {/* Price */}
            <div className="mb-1">
                <p className="text-lg font-semibold tabular-nums text-foreground">
                    {currencySymbol}
                    {creditPackage.price.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                    {currencySymbol}
                    {perCredit} per credit
                </p>
            </div>

            {/* Description */}
            {creditPackage.description && (
                <p className="mb-4 mt-2 text-sm text-muted-foreground line-clamp-2">
                    {creditPackage.description}
                </p>
            )}

            {/* Spacer to push button down */}
            <div className="flex-1" />

            {/* Purchase button */}
            <Button
                className="mt-4 w-full"
                variant={isBestValue ? 'default' : 'outline'}
                onClick={() => onPurchase(creditPackage.id)}
                disabled={isPurchasing}
            >
                {isPurchasing ? 'Processing...' : 'Purchase'}
            </Button>
        </div>
    );
}
