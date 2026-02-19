'use client';

import { useState, useCallback, useMemo } from 'react';
import { CurrencyCircleDollar } from '@phosphor-icons/react';
import { useCreditPackages, usePurchasePackage } from '../hooks/useCredits';
import { PackageCard } from './PackageCard';
import { PurchaseConfirmModal } from './PurchaseConfirmModal';
import type { CreditPackage } from '../types/credits.types';

function PackageGridSkeleton(): React.ReactElement {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <div
                    key={i}
                    className="h-56 animate-pulse rounded-xl border border-border/50 bg-muted/30"
                />
            ))}
        </div>
    );
}

export function PackageGrid(): React.ReactElement {
    const { data: packages, isLoading } = useCreditPackages();
    const { mutateAsync: purchase, isPending } = usePurchasePackage();
    const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const bestValueId = useMemo((): string | null => {
        if (!packages || packages.length === 0) return null;
        let best = packages[0];
        let bestRatio = best.price / best.credits;
        for (const pkg of packages) {
            const ratio = pkg.price / pkg.credits;
            if (ratio < bestRatio || (ratio === bestRatio && pkg.credits > best.credits)) {
                best = pkg;
                bestRatio = ratio;
            }
        }
        return best.id;
    }, [packages]);

    const handlePurchaseClick = useCallback((packageId: string): void => {
        const pkg = packages?.find((p) => p.id === packageId) ?? null;
        setSelectedPackage(pkg);
        setIsModalOpen(true);
    }, [packages]);

    const handleConfirm = useCallback(async (): Promise<void> => {
        if (!selectedPackage) return;
        try {
            await purchase(selectedPackage.id);
            setIsModalOpen(false);
            setSelectedPackage(null);
        } catch {
            // Error toast already handled by usePurchasePackage onError
        }
    }, [selectedPackage, purchase]);

    return (
        <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Credit Packages
            </h2>
            <p className="mb-6 mt-1 text-sm text-muted-foreground">
                Choose a package to add credits to your account.
            </p>

            {isLoading && <PackageGridSkeleton />}

            {!isLoading && (!packages || packages.length === 0) && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-16">
                    <CurrencyCircleDollar
                        className="mb-3 h-10 w-10 text-muted-foreground/50"
                        weight="duotone"
                    />
                    <p className="text-sm font-medium text-muted-foreground">
                        No packages available
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                        Check back later for credit packages.
                    </p>
                </div>
            )}

            {!isLoading && packages && packages.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {packages.map((pkg) => (
                        <PackageCard
                            key={pkg.id}
                            creditPackage={pkg}
                            isBestValue={pkg.id === bestValueId}
                            onPurchase={handlePurchaseClick}
                            isPurchasing={isPending}
                        />
                    ))}
                </div>
            )}

            <PurchaseConfirmModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                selectedPackage={selectedPackage}
                onConfirm={handleConfirm}
                isPending={isPending}
            />
        </div>
    );
}
