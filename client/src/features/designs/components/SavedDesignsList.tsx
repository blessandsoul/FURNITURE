'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { MagnifyingGlass, Palette, Plus } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants/routes';
import { useMyDesigns } from '../hooks/useDesigns';
import { SavedDesignCard } from './SavedDesignCard';
import type { DesignStatus, DesignWithCategory } from '../types/design.types';

type StatusFilter = 'ALL' | DesignStatus;
type SortOption = 'recent' | 'oldest' | 'price-high' | 'price-low' | 'name';

function filterAndSort(
    designs: DesignWithCategory[],
    search: string,
    status: StatusFilter,
    sort: SortOption,
): DesignWithCategory[] {
    let filtered = designs;

    // Search filter
    if (search.trim()) {
        const q = search.toLowerCase().trim();
        filtered = filtered.filter(
            (d) =>
                d.name.toLowerCase().includes(q) ||
                d.categoryName.toLowerCase().includes(q),
        );
    }

    // Status filter
    if (status !== 'ALL') {
        filtered = filtered.filter((d) => d.status === status);
    }

    // Sort
    const sorted = [...filtered];
    switch (sort) {
        case 'recent':
            sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
        case 'oldest':
            sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            break;
        case 'price-high':
            sorted.sort((a, b) => b.totalPrice - a.totalPrice);
            break;
        case 'price-low':
            sorted.sort((a, b) => a.totalPrice - b.totalPrice);
            break;
        case 'name':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }

    return sorted;
}

export function SavedDesignsList(): React.JSX.Element {
    const { data, isLoading } = useMyDesigns();
    const designs = data?.items ?? [];
    const totalItems = data?.pagination.totalItems ?? designs.length;

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
    const [sortOption, setSortOption] = useState<SortOption>('recent');

    const filteredDesigns = useMemo(
        () => filterAndSort(designs, search, statusFilter, sortOption),
        [designs, search, statusFilter, sortOption],
    );

    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-3">
                {/* Toolbar skeleton */}
                <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-9 w-56" />
                    <Skeleton className="h-9 w-28" />
                    <Skeleton className="h-9 w-32" />
                </div>
                {/* Row skeletons */}
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4 rounded-xl border border-border/50 px-4 py-3">
                        <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
                        <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-28" />
                        </div>
                        <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                ))}
            </div>
        );
    }

    // Empty state — no designs at all
    if (designs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-20 text-center">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Palette className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground">No saved designs yet</h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Design your perfect furniture and save it here to compare options later.
                </p>
                <Button asChild className="mt-5 gap-2">
                    <Link href={ROUTES.CONFIGURATOR.ROOT}>
                        <Plus className="h-4 w-4" />
                        Start Designing
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative w-full sm:w-56">
                    <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="Search designs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Status filter */}
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                    <SelectTrigger size="sm" className="w-28">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                        <SelectItem value="ALL">All status</SelectItem>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="GENERATED">Generated</SelectItem>
                        <SelectItem value="QUOTED">Quoted</SelectItem>
                    </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
                    <SelectTrigger size="sm" className="w-36">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                        <SelectItem value="recent">Most recent</SelectItem>
                        <SelectItem value="oldest">Oldest first</SelectItem>
                        <SelectItem value="price-high">Price: high to low</SelectItem>
                        <SelectItem value="price-low">Price: low to high</SelectItem>
                        <SelectItem value="name">Name A-Z</SelectItem>
                    </SelectContent>
                </Select>

                {/* Count */}
                <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                    {filteredDesigns.length} of {totalItems} design{totalItems !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Design rows */}
            {filteredDesigns.length > 0 ? (
                <div className="space-y-2">
                    {filteredDesigns.map((design) => (
                        <SavedDesignCard key={design.id} design={design} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-12 text-center">
                    <MagnifyingGlass className="mb-2 h-6 w-6 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                        No designs match your filters
                    </p>
                    <button
                        type="button"
                        onClick={() => { setSearch(''); setStatusFilter('ALL'); }}
                        className="mt-2 text-xs font-medium text-primary hover:underline"
                    >
                        Clear filters
                    </button>
                </div>
            )}
        </div>
    );
}
