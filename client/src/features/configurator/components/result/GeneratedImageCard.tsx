'use client';

import Image from 'next/image';
import { WarningCircle, ArrowsClockwise } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

interface GeneratedImageCardProps {
    imageUrl: string | undefined;
    isPending: boolean;
    isError: boolean;
    onRetry: () => void;
}

export function GeneratedImageCard({
    imageUrl,
    isPending,
    isError,
    onRetry,
}: GeneratedImageCardProps): React.JSX.Element {
    if (isPending) {
        return (
            <div className="aspect-square w-full animate-pulse rounded-2xl bg-muted" role="status" aria-label="Generating image...">
                <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                    <ArrowsClockwise className="h-8 w-8 motion-safe:animate-spin" />
                    <p className="text-sm font-medium">Generating your design…</p>
                </div>
            </div>
        );
    }

    if (isError || !imageUrl) {
        return (
            <div className="flex aspect-square w-full flex-col items-center justify-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5">
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

    return (
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-[--border-crisp] shadow-[--shadow-enamel]">
            <Image
                src={imageUrl}
                alt="Generated furniture design"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 60vw"
                unoptimized={imageUrl.includes('placehold.co')}
            />
        </div>
    );
}
