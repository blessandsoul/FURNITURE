'use client';

import { CircleNotch, Warning, Video, DownloadSimple } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { cn } from '@/lib/utils';

interface GeneratedVideoCardProps {
    videoUrl: string | undefined;
    isPending: boolean;
    isError: boolean;
    onRetry: () => void;
    fullHeight?: boolean;
}

export function GeneratedVideoCard({
    videoUrl,
    isPending,
    isError,
    onRetry,
    fullHeight = false,
}: GeneratedVideoCardProps): React.JSX.Element {
    const containerClass = fullHeight ? 'h-full min-h-0' : 'aspect-video w-full';
    const handleDownload = useCallback(() => {
        if (!videoUrl) return;
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = 'atlas-furniture-video.mp4';
        a.click();
    }, [videoUrl]);

    if (isPending) {
        return (
            <div className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-[--border-crisp] bg-muted/30 ${containerClass}`}>
                <CircleNotch className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-foreground">Generating video…</p>
                <p className="text-xs text-muted-foreground">This may take 10-30 seconds</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 ${containerClass}`}>
                <Warning className="h-8 w-8 text-destructive" weight="fill" />
                <p className="text-sm font-medium text-foreground">Video generation failed</p>
                <button
                    type="button"
                    onClick={onRetry}
                    className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (!videoUrl) {
        return (
            <div className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[--border-crisp] bg-muted/10 ${containerClass}`}>
                <Video className="h-8 w-8 text-muted-foreground" weight="thin" />
                <p className="text-sm text-muted-foreground">Select an animation above</p>
            </div>
        );
    }

    return (
        <div className={`group relative overflow-hidden rounded-xl border border-[--border-crisp] bg-black ${containerClass}`}>
            <video
                src={videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className={`object-cover ${fullHeight ? 'h-full w-full' : 'aspect-video w-full'}`}
            />
            <div
                className={cn(
                    'absolute inset-x-0 bottom-0 flex items-center justify-end gap-2 px-3 py-2',
                    'bg-gradient-to-t from-black/60 to-transparent',
                    'opacity-0 transition-opacity duration-200 group-hover:opacity-100',
                )}
            >
                <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/30"
                >
                    <DownloadSimple className="h-3.5 w-3.5" />
                    Download
                </button>
            </div>
        </div>
    );
}
