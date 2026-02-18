'use client';

import Image from 'next/image';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash, ArrowSquareOut } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';
import { deleteDesign } from '../services/design-storage.service';
import type { SavedDesign } from '../types/design.types';

interface SavedDesignCardProps {
    design: SavedDesign;
    onDelete: (id: string) => void;
}

export function SavedDesignCard({ design, onDelete }: SavedDesignCardProps): React.JSX.Element {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleLoad = useCallback(() => {
        const params = new URLSearchParams({ step: '2', mode: 'scratch', style: design.styleId });
        for (const [category, optionId] of Object.entries(design.options)) {
            if (optionId) params.set(category, optionId);
        }
        router.push(`${ROUTES.CONFIGURATOR.ROOT}?${params.toString()}`);
    }, [design, router]);

    const handleDelete = useCallback(() => {
        setIsDeleting(true);
        deleteDesign(design.id);
        onDelete(design.id);
        toast.success('Design deleted');
    }, [design.id, onDelete]);

    const optionTags = Object.values(design.optionLabels).filter(Boolean);
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(design.createdAt));

    return (
        <div className="group rounded-xl border border-[--border-crisp] bg-[--surface-enamel] shadow-[--shadow-enamel] motion-safe:transition-all motion-safe:duration-300 motion-safe:hover:shadow-[--shadow-enamel-hover] motion-safe:hover:-translate-y-0.5 overflow-hidden">
            {/* Image */}
            <div className="relative aspect-[4/3] bg-muted/30">
                {design.imageUrl ? (
                    <Image
                        src={design.imageUrl}
                        alt={design.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        No preview
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                            {design.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">{formattedDate}</p>
                    </div>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">
                        ${design.totalPrice.toLocaleString()}
                    </span>
                </div>

                {optionTags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {optionTags.map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="mt-3 flex gap-2">
                    <Button
                        size="sm"
                        onClick={handleLoad}
                        className="flex-1 gap-1.5"
                    >
                        <ArrowSquareOut className="h-3.5 w-3.5" />
                        Load
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                        <Trash className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
