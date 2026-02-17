import { cn } from '@/lib/utils';
import type { PriceLineItem as PriceLineItemType } from '../../types/configurator.types';

interface PriceLineItemProps {
    item: PriceLineItemType;
}

export function PriceLineItem({ item }: PriceLineItemProps): React.JSX.Element {
    const isPositiveModifier = !item.isBase && item.amount > 0;
    const isNegativeModifier = !item.isBase && item.amount < 0;

    return (
        <div className="flex items-center justify-between gap-3 py-1.5">
            <span
                className={cn(
                    'text-sm',
                    item.isBase ? 'text-foreground' : 'text-muted-foreground',
                )}
            >
                {item.label}
            </span>
            <span
                className={cn(
                    'text-sm font-semibold tabular-nums',
                    item.isBase && 'text-foreground',
                    isPositiveModifier && 'text-warning',
                    isNegativeModifier && 'text-success',
                )}
            >
                {item.isBase
                    ? `$${item.amount}`
                    : isPositiveModifier
                      ? `+$${item.amount}`
                      : `-$${Math.abs(item.amount)}`}
            </span>
        </div>
    );
}
