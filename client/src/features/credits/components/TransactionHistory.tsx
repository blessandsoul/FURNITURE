'use client';

import { useState, useCallback } from 'react';
import { CaretLeft, CaretRight, ClockCounterClockwise } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useCreditTransactions } from '../hooks/useCredits';
import { TransactionItem } from './TransactionItem';
import { PAGINATION } from '@/lib/constants/app.constants';

function TransactionSkeleton(): React.ReactElement {
    return (
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className="h-12 animate-pulse rounded-lg bg-muted/30"
                />
            ))}
        </div>
    );
}

export function TransactionHistory(): React.ReactElement {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useCreditTransactions({
        page,
        limit: PAGINATION.DEFAULT_LIMIT,
    });

    const transactions = data?.items ?? [];
    const pagination = data?.pagination;

    const handlePrev = useCallback((): void => {
        setPage((p) => Math.max(1, p - 1));
    }, []);

    const handleNext = useCallback((): void => {
        setPage((p) => p + 1);
    }, []);

    return (
        <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Transaction History
            </h2>
            <p className="mb-6 mt-1 text-sm text-muted-foreground">
                Your credit purchases and usage.
            </p>

            {isLoading && <TransactionSkeleton />}

            {!isLoading && transactions.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-16">
                    <ClockCounterClockwise
                        className="mb-3 h-10 w-10 text-muted-foreground/50"
                        weight="duotone"
                    />
                    <p className="text-sm font-medium text-muted-foreground">
                        No transactions yet
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                        Your credit purchases and usage will appear here.
                    </p>
                </div>
            )}

            {!isLoading && transactions.length > 0 && (
                <>
                    <div className="divide-y divide-border/30 rounded-xl border border-[--border-crisp] bg-[--surface-enamel] px-4 shadow-[--shadow-enamel]">
                        {transactions.map((tx) => (
                            <TransactionItem key={tx.id} transaction={tx} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm tabular-nums text-muted-foreground">
                                Page {pagination.page} of {pagination.totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrev}
                                    disabled={!pagination.hasPreviousPage}
                                >
                                    <CaretLeft className="mr-1 h-3.5 w-3.5" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNext}
                                    disabled={!pagination.hasNextPage}
                                >
                                    Next
                                    <CaretRight className="ml-1 h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
