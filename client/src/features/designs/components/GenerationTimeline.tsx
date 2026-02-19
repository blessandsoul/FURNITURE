'use client';

import { Images } from '@phosphor-icons/react';
import { useMyGenerations } from '@/features/ai-generation/hooks/useAiGeneration';
import { GenerationCard } from './GenerationCard';
import type { Design } from '../types/design.types';

interface GenerationTimelineProps {
    design: Design;
}

export function GenerationTimeline({ design }: GenerationTimelineProps): React.JSX.Element {
    const { data, isLoading } = useMyGenerations({ designId: design.id, limit: 50 });
    const generations = data?.items ?? [];
    const totalCount = data?.pagination.totalItems ?? 0;

    // Loading skeleton
    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-7 w-48 animate-pulse rounded-lg bg-muted" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-xl border border-border/50 overflow-hidden">
                            <div className="aspect-[4/3] animate-pulse bg-muted/30" />
                            <div className="p-3">
                                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Empty state
    if (generations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-muted/10 px-6 py-16 text-center">
                <Images className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <h3 className="text-sm font-medium text-foreground">No generations yet</h3>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                    This design hasn&apos;t been generated yet. Open it in the configurator to create your first AI visualization.
                </p>
            </div>
        );
    }

    // Find the latest COMPLETED generation (first in list since sorted by createdAt desc)
    const latestCompletedId = generations.find((g) => g.status === 'COMPLETED')?.id ?? null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">Generation History</h2>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                    {totalCount}
                </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {generations.map((gen) => (
                    <GenerationCard
                        key={gen.id}
                        generation={gen}
                        isCurrent={gen.id === latestCompletedId}
                    />
                ))}
            </div>
        </div>
    );
}
