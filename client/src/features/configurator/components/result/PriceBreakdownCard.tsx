import { Receipt } from '@phosphor-icons/react/dist/ssr';
import type { PriceBreakdown } from '../../types/configurator.types';
import { PriceLineItem } from '../pricing/PriceLineItem';

interface PriceBreakdownCardProps {
    breakdown: PriceBreakdown;
}

export function PriceBreakdownCard({ breakdown }: PriceBreakdownCardProps): React.JSX.Element {
    return (
        <div className="rounded-xl border border-[--border-crisp] bg-[--surface-enamel] p-5 backdrop-blur-md shadow-[--shadow-enamel]">
            <div className="mb-4 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Price Breakdown</span>
            </div>

            <div className="divide-y divide-border">
                {breakdown.lineItems.map((item, index) => (
                    <PriceLineItem key={`${item.label}-${index}`} item={item} />
                ))}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2.5">
                <span className="text-sm font-semibold text-foreground">Total</span>
                <span className="text-xl font-bold tabular-nums text-primary">
                    ${breakdown.total.toLocaleString()}
                </span>
            </div>
        </div>
    );
}
