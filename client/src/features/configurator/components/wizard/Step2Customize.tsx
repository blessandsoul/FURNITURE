'use client';

import { useCallback } from 'react';
import { useCategoryBySlug } from '@/features/catalog/hooks/useCatalog';
import type { PublicOptionGroup } from '@/features/catalog/types/catalog.types';
import { useConfigurator } from '../../hooks/useConfigurator';
import { OptionGroup } from '../options/OptionGroup';
import { PricePanel } from '../pricing/PricePanel';

export function Step2Customize(): React.JSX.Element {
    const { state, toggleOptionValue } = useConfigurator();
    const { selectedCategorySlug, selectedOptionValueIds } = state;

    const { data: category, isLoading } = useCategoryBySlug(selectedCategorySlug);

    const handleSelect = useCallback(
        (group: PublicOptionGroup, valueId: string) => {
            const groupValueIds = group.optionValues.map((v) => v.id);
            toggleOptionValue(group.id, valueId, group.isRequired, groupValueIds);
        },
        [toggleOptionValue],
    );

    if (!selectedCategorySlug) {
        return (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Please select a furniture category first.
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <div className="h-6 w-48 animate-pulse rounded bg-muted" />
                    <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
                </div>
                <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                    <div className="space-y-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                                <div className="flex flex-wrap gap-2">
                                    {Array.from({ length: 4 }).map((_, j) => (
                                        <div key={j} className="h-10 w-20 animate-pulse rounded-lg bg-muted" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="h-48 animate-pulse rounded-xl bg-muted lg:sticky lg:top-6" />
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Category not found. Please go back and select another.
            </div>
        );
    }

    const sortedGroups = [...category.optionGroups].sort((a, b) => a.sortOrder - b.sortOrder);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-foreground">
                    Customize your {category.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Each selection shapes your final design and price
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                <div className="space-y-6">
                    {sortedGroups.map((group) => {
                        const selectedValueId = group.optionValues.find(
                            (v) => selectedOptionValueIds.includes(v.id),
                        )?.id ?? null;

                        return (
                            <OptionGroup
                                key={group.id}
                                group={group}
                                selectedValueId={selectedValueId}
                                onSelect={(valueId) => handleSelect(group, valueId)}
                            />
                        );
                    })}
                </div>

                <div className="lg:sticky lg:top-6 lg:self-start">
                    <PricePanel category={category} />
                </div>
            </div>
        </div>
    );
}
