'use client';

import { useMemo } from 'react';
import { Tag } from '@phosphor-icons/react';
import type { CategoryWithOptions } from '@/features/catalog/types/catalog.types';
import { useConfiguratorContext } from '../../store/configuratorContext';
import type { PriceBreakdown } from '../../types/configurator.types';
import { PriceLineItem } from './PriceLineItem';

interface PricePanelProps {
    category: CategoryWithOptions;
}

/**
 * Computes price breakdown from the category's basePrice + selected option
 * value priceModifiers. Used in Step 2 while the user is customizing.
 */
export function usePriceBreakdown(category: CategoryWithOptions | undefined): PriceBreakdown {
    const { state } = useConfiguratorContext();

    return useMemo(() => {
        if (!category) return { lineItems: [], total: 0, currency: 'USD' };

        const lineItems: PriceBreakdown['lineItems'] = [
            { label: category.name, amount: category.basePrice, isBase: true },
        ];

        for (const group of category.optionGroups) {
            for (const value of group.optionValues) {
                if (state.selectedOptionValueIds.includes(value.id) && value.priceModifier !== 0) {
                    lineItems.push({
                        label: `${group.name}: ${value.label}`,
                        amount: value.priceModifier,
                        isBase: false,
                    });
                }
            }
        }

        const total = lineItems.reduce((sum, item) => sum + item.amount, 0);

        return { lineItems, total, currency: category.currency };
    }, [category, state.selectedOptionValueIds]);
}

export function PricePanel({ category }: PricePanelProps): React.JSX.Element {
    const { lineItems, total } = usePriceBreakdown(category);

    if (lineItems.length === 0) {
        return (
            <div className="rounded-xl border border-[--border-crisp] bg-[--surface-enamel] p-4 backdrop-blur-md">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    <span className="text-sm">Select options to see pricing</span>
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
