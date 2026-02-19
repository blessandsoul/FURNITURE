'use client';

import Image from 'next/image';
import { useCallback, useState } from 'react';
import Link from 'next/link';
import { Trash, SpinnerGap } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants/routes';
import { useDeleteDesign } from '../hooks/useDesigns';
import type { DesignWithCategory, DesignStatus } from '../types/design.types';

const STATUS_CONFIG: Record<DesignStatus, { label: string; dotClass: string; bgClass: string }> = {
    DRAFT: {
        label: 'Draft',
        dotClass: 'bg-muted-foreground',
        bgClass: 'bg-muted text-muted-foreground',
    },
    GENERATED: {
        label: 'Generated',
        dotClass: 'bg-success',
        bgClass: 'bg-success/10 text-success',
    },
    QUOTED: {
        label: 'Quoted',
        dotClass: 'bg-primary',
        bgClass: 'bg-primary/10 text-primary',
    },
};

interface SavedDesignCardProps {
    design: DesignWithCategory;
}

export function SavedDesignCard({ design }: SavedDesignCardProps): React.JSX.Element {
    const deleteDesign = useDeleteDesign();
    const [isConfirming, setIsConfirming] = useState(false);

    const status = STATUS_CONFIG[design.status] ?? STATUS_CONFIG.DRAFT;

    const handleDelete = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isConfirming) {
            setIsConfirming(true);
            return;
        }
        deleteDesign.mutateAsync(design.id)
            .catch(() => {
                toast.error('Failed to delete design');
                setIsConfirming(false);
            });
    }, [design.id, deleteDesign, isConfirming]);

    const handleCancelDelete = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsConfirming(false);
    }, []);

    const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(design.createdAt));

    return (
        <Link
            href={ROUTES.DESIGN_DETAIL(design.id)}
            className="group flex items-center gap-4 rounded-xl border border-border/50 bg-card px-4 py-3 motion-safe:transition-all motion-safe:duration-200 hover:bg-muted/50 hover:border-border hover:shadow-sm focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
        >
            {/* Thumbnail */}
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted/30">
                {design.thumbnailUrl || design.imageUrl ? (
                    <Image
                        src={design.thumbnailUrl ?? design.imageUrl!}
                        alt={design.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                        unoptimized={(design.thumbnailUrl ?? design.imageUrl ?? '').startsWith('http')}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                        N/A
                    </div>
                )}
            </div>

            {/* Name + category — takes available space */}
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                    {design.name}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {design.categoryName} &middot; {formattedDate}
                </p>
            </div>

            {/* Status badge — hidden on mobile, shown on sm+ */}
            <span className={cn(
                'hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium sm:inline-flex',
                status.bgClass,
            )}>
                <span className={cn('h-1.5 w-1.5 rounded-full', status.dotClass)} />
                {status.label}
            </span>

            {/* Price */}
            <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                ${design.totalPrice.toLocaleString()}
            </span>

            {/* Delete action */}
            <div className="shrink-0">
                {isConfirming ? (
                    <div className="flex items-center gap-1">
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteDesign.isPending}
                            className="h-7 px-2 text-xs"
                        >
                            {deleteDesign.isPending ? (
                                <SpinnerGap className="h-3 w-3 animate-spin" />
                            ) : (
                                'Delete'
                            )}
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelDelete}
                            className="h-7 px-2 text-xs text-muted-foreground"
                        >
                            Cancel
                        </Button>
                    </div>
                ) : (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleDelete}
                        className="h-7 w-7 p-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 focus-visible:opacity-100"
                        aria-label="Delete design"
                    >
                        <Trash className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>
        </Link>
    );
}
