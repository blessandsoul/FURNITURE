'use client';

import { useTranslations } from 'next-intl';
import {
    ArrowUp,
    ArrowDown,
    Gift,
    ArrowsClockwise,
    Faders,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { CreditTransaction, CreditTransactionType } from '../types/credits.types';
import type { Icon } from '@phosphor-icons/react';

const TRANSACTION_CONFIG: Record<
    CreditTransactionType,
    { translationKey: string; badgeClass: string; icon: Icon }
> = {
    PURCHASE: {
        translationKey: 'transactions.typePurchase',
        badgeClass: 'bg-primary/10 text-primary',
        icon: ArrowUp,
    },
    GENERATION: {
        translationKey: 'transactions.typeGeneration',
        badgeClass: 'bg-warning/10 text-warning',
        icon: ArrowDown,
    },
    REFUND: {
        translationKey: 'transactions.typeRefund',
        badgeClass: 'bg-success/10 text-success',
        icon: ArrowsClockwise,
    },
    BONUS: {
        translationKey: 'transactions.typeBonus',
        badgeClass: 'bg-info/10 text-info',
        icon: Gift,
    },
    ADJUSTMENT: {
        translationKey: 'transactions.typeAdjustment',
        badgeClass: 'bg-muted text-muted-foreground',
        icon: Faders,
    },
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
});

interface TransactionItemProps {
    transaction: CreditTransaction;
}

export function TransactionItem({
    transaction,
}: TransactionItemProps): React.ReactElement {
    const t = useTranslations('Credits');
    const config = TRANSACTION_CONFIG[transaction.type];
    const IconComponent = config.icon;
    const label = t(config.translationKey as Parameters<typeof t>[0]);
    const isPositive = transaction.amount > 0;

    return (
        <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
                {/* Icon */}
                <div
                    className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                        config.badgeClass
                    )}
                >
                    <IconComponent className="h-3.5 w-3.5" weight="bold" />
                </div>

                {/* Description + date */}
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                        {transaction.description ?? label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {dateFormatter.format(new Date(transaction.createdAt))}
                    </p>
                </div>
            </div>

            {/* Amount + type badge */}
            <div className="flex items-center gap-3">
                <span
                    className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        config.badgeClass
                    )}
                >
                    {label}
                </span>
                <span
                    className={cn(
                        'text-sm font-semibold tabular-nums',
                        isPositive ? 'text-success' : 'text-destructive'
                    )}
                >
                    {isPositive ? '+' : ''}
                    {transaction.amount}
                </span>
            </div>
        </div>
    );
}
