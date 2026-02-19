'use client';

import Image from 'next/image';
import {
    CheckCircle,
    XCircle,
    SpinnerGap,
    Clock,
    Lightning,
    Coins,
    Star,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { AiGeneration, AiGenerationStatus } from '@/features/ai-generation/types/ai-generation.types';

const STATUS_CONFIG: Record<AiGenerationStatus, { label: string; className: string; icon: React.ElementType }> = {
    COMPLETED: { label: 'Completed', className: 'bg-success/10 text-success', icon: CheckCircle },
    FAILED: { label: 'Failed', className: 'bg-destructive/10 text-destructive', icon: XCircle },
    PROCESSING: { label: 'Processing', className: 'bg-warning/10 text-warning', icon: SpinnerGap },
    PENDING: { label: 'Pending', className: 'bg-muted text-muted-foreground', icon: Clock },
};

function formatRelativeTime(dateStr: string): string {
    const now = Date.now();
    const date = new Date(dateStr).getTime();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60_000);
    const diffHr = Math.floor(diffMs / 3_600_000);
    const diffDays = Math.floor(diffMs / 86_400_000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
    }).format(new Date(dateStr));
}

interface GenerationCardProps {
    generation: AiGeneration;
    isCurrent: boolean;
}

export function GenerationCard({ generation, isCurrent }: GenerationCardProps): React.JSX.Element {
    const config = STATUS_CONFIG[generation.status];
    const StatusIcon = config.icon;

    return (
        <div className={cn(
            'group relative rounded-xl border overflow-hidden motion-safe:transition-all motion-safe:duration-300',
            isCurrent
                ? 'border-primary/30 bg-primary/[0.02] shadow-sm'
                : 'border-border/50 bg-card shadow-sm motion-safe:hover:shadow-md motion-safe:hover:-translate-y-0.5',
        )}>
            {/* Current badge */}
            {isCurrent && (
                <div className="absolute right-2 top-2 z-10">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                        <Star className="h-3 w-3" weight="fill" />
                        Current
                    </span>
                </div>
            )}

            {/* Image */}
            <div className="relative aspect-[4/3] bg-muted/30">
                {generation.status === 'COMPLETED' && generation.thumbnailUrl ? (
                    <Image
                        src={generation.thumbnailUrl}
                        alt="Generated design"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        unoptimized={generation.thumbnailUrl.startsWith('http')}
                    />
                ) : generation.status === 'PROCESSING' || generation.status === 'PENDING' ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                        <SpinnerGap className="h-8 w-8 animate-spin" />
                        <span className="text-xs">Generating...</span>
                    </div>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                        <XCircle className="h-8 w-8" />
                        <span className="text-xs">Generation failed</span>
                    </div>
                )}

                {/* Status badge */}
                <div className="absolute left-2 top-2">
                    <span className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                        config.className,
                    )}>
                        <StatusIcon className={cn('h-3 w-3', generation.status === 'PROCESSING' && 'animate-spin')} />
                        {config.label}
                    </span>
                </div>
            </div>

            {/* Meta */}
            <div className="p-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(generation.createdAt)}
                    </span>
                    <div className="flex items-center gap-2">
                        {generation.durationMs != null && generation.status === 'COMPLETED' && (
                            <span className="inline-flex items-center gap-0.5 text-xs tabular-nums text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {(generation.durationMs / 1000).toFixed(1)}s
                            </span>
                        )}
                        <span className={cn(
                            'inline-flex items-center gap-0.5 text-xs font-medium',
                            generation.wasFree ? 'text-success' : 'text-primary',
                        )}>
                            {generation.wasFree ? (
                                <>
                                    <Lightning className="h-3 w-3" weight="fill" />
                                    Free
                                </>
                            ) : (
                                <>
                                    <Coins className="h-3 w-3" weight="fill" />
                                    {generation.creditsUsed} credit{generation.creditsUsed !== 1 ? 's' : ''}
                                </>
                            )}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
