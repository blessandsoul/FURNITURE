'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Palette } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';
import { getSavedDesigns } from '../services/design-storage.service';
import { SavedDesignCard } from './SavedDesignCard';
import type { SavedDesign } from '../types/design.types';

export function SavedDesignsList(): React.JSX.Element {
    const [designs, setDesigns] = useState<SavedDesign[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setDesigns(getSavedDesigns());
        setIsLoaded(true);
    }, []);

    const handleDelete = useCallback((id: string) => {
        setDesigns((prev) => prev.filter((d) => d.id !== id));
    }, []);

    if (!isLoaded) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse rounded-xl border border-border bg-muted/30">
                        <div className="aspect-[4/3] bg-muted" />
                        <div className="space-y-2 p-4">
                            <div className="h-4 w-2/3 rounded bg-muted" />
                            <div className="h-3 w-1/3 rounded bg-muted" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (designs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Palette className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground">No saved designs yet</h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Design your perfect furniture and save it here to compare options later.
                </p>
                <Button asChild className="mt-4">
                    <Link href={`${ROUTES.CONFIGURATOR.ROOT}?step=1`}>
                        Start Designing
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div>
            <p className="mb-4 text-sm text-muted-foreground">
                {designs.length} saved design{designs.length !== 1 ? 's' : ''}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {designs.map((design) => (
                    <SavedDesignCard
                        key={design.id}
                        design={design}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
        </div>
    );
}
