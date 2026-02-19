'use client';

import { useTranslations } from 'next-intl';
import { Receipt } from '@phosphor-icons/react';
import type { PriceBreakdown } from '../../types/configurator.types';
import { PriceLineItem } from '../pricing/PriceLineItem';

interface PriceBreakdownCardProps {
    breakdown: PriceBreakdown;
}

export function PriceBreakdownCard({ breakdown }: PriceBreakdownCardProps): React.JSX.Element {
    const t = useTranslations('Configurator');
    return (
        <div className="rounded-xl border border-[--border-crisp] bg-[--surface-enamel] p-5 backdrop-blur-md shadow-[--shadow-enamel]">
            <div className="mb-4 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">{t('pricing.priceBreakdown')}</span>
            </div>

            <div className="divide-y divide-border">
                {breakdown.lineItems.map((item, index) => (
                    <PriceLineItem key={`${item.label}-${index}`} item={item} />
                ))}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2.5">
                <span className="text-sm font-semibold text-foreground">{t('pricing.total')}</span>
                <span className="text-xl font-bold tabular-nums text-primary">
                    ${breakdown.total.toLocaleString()}
                </span>
            </div>
        </div>
    );
}
