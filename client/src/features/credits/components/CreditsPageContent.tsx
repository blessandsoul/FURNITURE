'use client';

import { useCreditBalance } from '../hooks/useCredits';
import { useGenerationStatus } from '@/features/ai-generation/hooks/useAiGeneration';
import { CreditBalanceCard } from './CreditBalanceCard';
import { PackageGrid } from './PackageGrid';
import { TransactionHistory } from './TransactionHistory';

export function CreditsPageContent(): React.ReactElement {
    const { data: balance, isLoading: isBalanceLoading } = useCreditBalance();
    const { data: generationStatus, isLoading: isStatusLoading } =
        useGenerationStatus();

    return (
        <div className="space-y-12">
            <CreditBalanceCard
                balance={balance}
                generationStatus={generationStatus}
                isLoading={isBalanceLoading || isStatusLoading}
            />

            <section>
                <PackageGrid />
            </section>

            <section>
                <TransactionHistory />
            </section>
        </div>
    );
}
