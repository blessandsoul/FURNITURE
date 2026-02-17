'use client';

import { useMemo } from 'react';
import { getOptionById, getStyleById } from '../data/furniture-catalog';
import { useConfiguratorContext } from '../store/configuratorContext';
import type { OptionCategory, PriceBreakdown, PriceLineItem } from '../types/configurator.types';

export function usePriceCalculator(): PriceBreakdown {
    const { state } = useConfiguratorContext();
    const { selections } = state;

    return useMemo<PriceBreakdown>(() => {
        if (!selections.style) {
            return { lineItems: [], total: 0 };
        }

        const style = getStyleById(selections.style);
        if (!style) {
            return { lineItems: [], total: 0 };
        }

        const lineItems: PriceLineItem[] = [
            { label: `${style.label} — base price`, amount: style.basePrice, isBase: true },
        ];

        const categories = Object.keys(selections.options) as OptionCategory[];
        for (const category of categories) {
            const optionId = selections.options[category];
            if (!optionId) continue;

            const option = getOptionById(selections.style, optionId);
            if (!option || option.priceModifier === 0) continue;

            lineItems.push({
                label: option.label,
                amount: option.priceModifier,
                isBase: false,
            });
        }

        const total = lineItems.reduce((sum, item) => sum + item.amount, 0);

        return { lineItems, total };
    }, [selections]);
}
