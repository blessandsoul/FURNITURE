'use client';

import { useTranslations } from 'next-intl';
import { Coins, Sparkle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { CreditBalance } from '../types/credits.types';
import type { GenerationStatusResponse } from '@/features/ai-generation/types/ai-generation.types';

interface CreditBalanceCardProps {
    balance: CreditBalance | undefined;
    generationStatus: GenerationStatusResponse | undefined;
    isLoading: boolean;
}

function BalanceSkeleton(): React.ReactElement {
    return (
        <div className="rounded-2xl border border-[--border-crisp] bg-[--surface-enamel] p-6 shadow-[--shadow-enamel]">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <div className="h-4 w-28 animate-pulse rounded bg-muted/40" />
                    <div className="h-10 w-24 animate-pulse rounded bg-muted/40" />
                    <div className="h-3 w-36 animate-pulse rounded bg-muted/40" />
                </div>
                <div className="h-16 w-48 animate-pulse rounded-xl bg-muted/40" />
            </div>
        </div>
    );
}

export function CreditBalanceCard({
    balance,
    generationStatus,
    isLoading,
}: CreditBalanceCardProps): React.ReactElement {
    const t = useTranslations('Credits');

    if (isLoading) return <BalanceSkeleton />;

    const creditCount = balance?.balance ?? 0;
    const freeRemaining = generationStatus?.freeRemaining ?? 0;
    const hasFree = freeRemaining > 0;

    return (
        <div className="rounded-2xl border border-[--border-crisp] bg-[--surface-enamel] p-6 shadow-[--shadow-enamel]">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                {/* Balance display */}
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Coins className="h-6 w-6 text-primary" weight="duotone" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            {t('balance.title')}
                        </p>
                        <p
                            className={cn(
                                'text-4xl font-bold tabular-nums tracking-tight',
                                creditCount === 0
                                    ? 'text-muted-foreground'
                                    : 'text-foreground'
                            )}
                        >
                            {creditCount.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Free generations indicator */}
                <div
                    className={cn(
                        'flex items-center gap-3 rounded-xl px-4 py-3',
                        hasFree
                            ? 'bg-success/10'
                            : 'bg-muted/30'
                    )}
                >
                    <Sparkle
                        className={cn(
                            'h-5 w-5',
                            hasFree ? 'text-success' : 'text-muted-foreground'
                        )}
                        weight="fill"
                    />
                    <div>
                        <p
                            className={cn(
                                'text-sm font-semibold tabular-nums',
                                hasFree ? 'text-success' : 'text-muted-foreground'
                            )}
                        >
                            {t('balance.freeToday', { count: freeRemaining })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {t('balance.dailyGenerations')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
