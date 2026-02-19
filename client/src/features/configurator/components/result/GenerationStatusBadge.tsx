'use client';

import { Sparkle, CurrencyCircleDollar } from '@phosphor-icons/react';
import { useGenerationStatus } from '@/features/ai-generation/hooks/useAiGeneration';

export function GenerationStatusBadge(): React.JSX.Element | null {
    const { data: status, isLoading } = useGenerationStatus();

    if (isLoading || !status) return null;

    const hasFree = status.freeRemaining > 0;

    return (
        <div className="flex items-center gap-2">
            {hasFree ? (
                <div className="flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                    <Sparkle className="h-3 w-3" weight="fill" />
                    {status.freeRemaining} free left
                </div>
            ) : (
                <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    <CurrencyCircleDollar className="h-3 w-3" weight="fill" />
                    {status.creditBalance} credits
                </div>
            )}
        </div>
    );
}
