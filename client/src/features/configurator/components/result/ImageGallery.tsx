'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { ArrowsClockwise, WarningCircle, DownloadSimple } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
    imageUrls: string[] | undefined;
    isPending: boolean;
    isError: boolean;
    onRetry: () => void;
}

const ANGLE_LABELS = ['Front', 'Side', 'Angle', 'Detail', 'Room', 'Top'] as const;

export function ImageGallery({
    imageUrls,
    isPending,
    isError,
    onRetry,
}: ImageGalleryProps): React.JSX.Element {
    const [activeIndex, setActiveIndex] = useState(0);

    const handleDownload = useCallback(() => {
        const url = imageUrls?.[activeIndex];
        if (!url) return;
        const a = document.createElement('a');
        a.href = url;
        a.download = `atlas-design-${activeIndex + 1}.png`;
        a.click();
    }, [imageUrls, activeIndex]);

    if (isPending) {
        return (
            <div className="flex h-full min-h-0 gap-2">
                {/* Main skeleton */}
                <div className="relative min-h-0 flex-1 animate-pulse rounded-2xl bg-muted" role="status" aria-label="Generating images...">
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                        <ArrowsClockwise className="h-8 w-8 motion-safe:animate-spin" />
                        <p className="text-sm font-medium">Generating 6 variations…</p>
                        <p className="text-xs text-muted-foreground/70">Studio · Side · Angle · Detail · Room · Top</p>
                    </div>
                </div>
                {/* Vertical thumbnail strip */}
                <div className="flex w-14 flex-col gap-1.5">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="aspect-square w-full animate-pulse rounded-lg bg-muted" style={{ animationDelay: `${i * 80}ms` }} />
                    ))}
                </div>
            </div>
        );
    }

    if (isError || !imageUrls || imageUrls.length === 0) {
        return (
            <div className="flex h-full min-h-0 flex-col items-center justify-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5">
                <WarningCircle className="h-10 w-10 text-destructive" />
                <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">Generation failed</p>
                    <p className="mt-1 text-xs text-muted-foreground">Please try again</p>
                </div>
                <Button variant="outline" size="sm" onClick={onRetry}>
                    <ArrowsClockwise className="mr-2 h-4 w-4" />
                    Try again
                </Button>
            </div>
        );
    }

    const activeUrl = imageUrls[activeIndex] ?? imageUrls[0];

    return (
        <div className="flex h-full min-h-0 gap-2 animate-scale-in">
            {/* Main image */}
            <div className="group relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-[--border-crisp] shadow-[--shadow-enamel]">
                <Image
                    key={activeUrl}
                    src={activeUrl}
                    alt={`Generated furniture — ${ANGLE_LABELS[activeIndex] ?? 'view'}`}
                    fill
                    priority
                    className="object-cover transition-opacity duration-300"
                    sizes="(max-width: 768px) 100vw, 55vw"
                    unoptimized={activeUrl.startsWith('http')}
                />
                {/* Overlay: angle label + download */}
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/50 to-transparent px-4 py-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <span className="text-xs font-semibold text-white/90">
                        {ANGLE_LABELS[activeIndex] ?? 'View'} · {activeIndex + 1}/{imageUrls.length}
                    </span>
                    <button
                        type="button"
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/30"
                    >
                        <DownloadSimple className="h-3.5 w-3.5" />
                        Save
                    </button>
                </div>
            </div>

            {/* Vertical thumbnail strip */}
            <div className="flex w-14 flex-col gap-1.5">
                {imageUrls.map((url, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => setActiveIndex(i)}
                        aria-label={`View ${ANGLE_LABELS[i] ?? `image ${i + 1}`}`}
                        style={{ animationDelay: `${50 + i * 60}ms` }}
                        className={cn(
                            'group relative aspect-square w-full overflow-hidden rounded-lg border-2 transition-all duration-200 animate-fade-in',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                            i === activeIndex
                                ? 'border-primary shadow-[0_0_0_1px_hsl(var(--primary)_/_0.3)]'
                                : 'border-transparent hover:border-primary/40',
                        )}
                    >
                        <Image
                            src={url}
                            alt={ANGLE_LABELS[i] ?? `View ${i + 1}`}
                            fill
                            className="object-cover"
                            sizes="56px"
                            unoptimized={url.startsWith('http')}
                        />
                        {/* Label on hover */}
                        <div className="absolute inset-x-0 bottom-0 bg-black/50 py-0.5 text-center text-[8px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                            {ANGLE_LABELS[i]}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
