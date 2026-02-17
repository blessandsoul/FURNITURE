'use client';

import { Tag } from '@phosphor-icons/react';
import { usePriceCalculator } from '../../hooks/usePriceCalculator';
import { PriceLineItem } from './PriceLineItem';

export function PricePanel(): React.JSX.Element {
    const { lineItems, total } = usePriceCalculator();

    if (lineItems.length === 0) {
        return (
            <div className="rounded-xl border border-[--border-crisp] bg-[--surface-enamel] p-4 backdrop-blur-md">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    <span className="text-sm">Select a style to see pricing</span>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-[--border-crisp] bg-[--surface-enamel] p-4 backdrop-blur-md shadow-[--shadow-enamel]">
            <div className="mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Price Breakdown</span>
            </div>

            <div className="divide-y divide-border">
                {lineItems.map((item, index) => (
                    <PriceLineItem key={`${item.label}-${index}`} item={item} />
                ))}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm font-semibold text-foreground">Total</span>
                <span className="text-lg font-bold tabular-nums text-primary">${total}</span>
            </div>
        </div>
    );
}
