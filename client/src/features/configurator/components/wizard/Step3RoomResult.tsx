'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowCounterClockwise, DownloadSimple, ShareNetwork } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants/routes';
import { useConfigurator } from '../../hooks/useConfigurator';
import { useRoomRedesign } from '../../hooks/useRoomRedesign';
import { getRoomStyleById, getTransformationById } from '../../data/room-catalog';
import { GeneratingOverlay } from '../skeletons/GeneratingOverlay';
import { BeforeAfterSlider } from '../result/BeforeAfterSlider';

interface Step3RoomResultProps {
    basePath?: string;
}

export function Step3RoomResult({ basePath = ROUTES.CONFIGURATOR.ROOT }: Step3RoomResultProps): React.JSX.Element {
    const router = useRouter();
    const { state } = useConfigurator();
    const { roomRedesign } = state;
    const { generate, data, isPending, isError, reset: resetGeneration } = useRoomRedesign();

    const generateRef = useRef(generate);
    generateRef.current = generate;

    // Auto-trigger generation when step loads with valid state
    const hasFired = useRef(false);
    useEffect(() => {
        if (hasFired.current) return;
        if (!roomRedesign.roomImageUrl || !roomRedesign.roomType || !roomRedesign.transformationMode || !roomRedesign.roomStyle) return;

        hasFired.current = true;
        generateRef.current({
            roomImage: roomRedesign.roomImageUrl,
            roomType: roomRedesign.roomType,
            transformationMode: roomRedesign.transformationMode,
            roomStyle: roomRedesign.roomStyle,
        });

        return () => {
            hasFired.current = false;
        };
    }, [roomRedesign.roomImageUrl, roomRedesign.roomType, roomRedesign.transformationMode, roomRedesign.roomStyle]);

    const handleBack = useCallback(() => {
        resetGeneration();
        router.push(`${basePath}?step=2&mode=reimagine`);
    }, [basePath, resetGeneration, router]);

    const handleTryAnother = useCallback(() => {
        resetGeneration();
        router.push(`${basePath}?step=2&mode=reimagine`);
    }, [basePath, resetGeneration, router]);

    const handleStartOver = useCallback(() => {
        resetGeneration();
        router.push(`${basePath}?step=1`);
    }, [basePath, resetGeneration, router]);

    const handleRetry = useCallback(() => {
        if (!roomRedesign.roomImageUrl || !roomRedesign.roomType || !roomRedesign.transformationMode || !roomRedesign.roomStyle) return;
        resetGeneration();
        hasFired.current = false;
        generate({
            roomImage: roomRedesign.roomImageUrl,
            roomType: roomRedesign.roomType,
            transformationMode: roomRedesign.transformationMode,
            roomStyle: roomRedesign.roomStyle,
        });
    }, [roomRedesign, generate, resetGeneration]);

    const handleDownload = useCallback(async () => {
        const resultUrl = data?.resultImageUrl ?? roomRedesign.resultImageUrl;
        if (!resultUrl) return;

        try {
            const response = await fetch(resultUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `atlas-room-redesign-${Date.now()}.jpg`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Image downloaded');
        } catch {
            toast.error('Download failed');
        }
    }, [data?.resultImageUrl, roomRedesign.resultImageUrl]);

    const handleShare = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard');
        } catch {
            toast.error('Failed to copy link');
        }
    }, []);

    // Guard: incomplete state
    if (!roomRedesign.roomImageUrl || !roomRedesign.roomType || !roomRedesign.transformationMode || !roomRedesign.roomStyle) {
        return (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Please complete the previous steps first.
            </div>
        );
    }

    // Loading state
    if (isPending && !data) {
        return <GeneratingOverlay />;
    }

    const resultImageUrl = data?.resultImageUrl ?? roomRedesign.resultImageUrl;
    const styleDef = getRoomStyleById(roomRedesign.roomStyle);
    const transformDef = getTransformationById(roomRedesign.transformationMode);

    return (
        <div className="flex h-full min-h-0 flex-col gap-4">
            {/* Header */}
            <div className="animate-fade-up shrink-0">
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>
                    <h2 className="text-base font-bold text-foreground">
                        Your <span className="text-primary">{styleDef?.label ?? 'Room'}</span> Redesign
                    </h2>
                    <span className="text-xs text-muted-foreground">
                        {transformDef?.label}
                    </span>
                </div>
            </div>

            {/* Main content */}
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto lg:flex-row">
                {/* Before/After slider */}
                <div className="animate-fade-up delay-75 min-h-0 flex-1">
                    {resultImageUrl ? (
                        <BeforeAfterSlider
                            beforeSrc={roomRedesign.roomImageUrl}
                            afterSrc={resultImageUrl}
                            className="h-full"
                        />
                    ) : isError ? (
                        <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 sm:h-72">
                            <p className="text-sm text-destructive">Generation failed</p>
                            <button
                                type="button"
                                onClick={handleRetry}
                                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                Try again
                            </button>
                        </div>
                    ) : null}
                </div>

                {/* Actions panel */}
                <div className="animate-fade-up delay-150 flex w-full shrink-0 flex-col gap-3 lg:w-64 xl:w-72">
                    {/* Style info card */}
                    <div className={cn(
                        'animate-scale-in delay-200 rounded-xl border border-[--border-crisp] bg-[--surface-enamel] p-4 backdrop-blur-md shadow-[--shadow-enamel]',
                    )}>
                        <div className="flex items-center gap-2">
                            {styleDef && (
                                <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: styleDef.colorAccent }}
                                />
                            )}
                            <span className="text-sm font-semibold text-foreground">
                                {styleDef?.label}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{styleDef?.description}</p>
                        <div className="mt-2 rounded-lg bg-muted/50 px-3 py-1.5">
                            <p className="text-xs text-muted-foreground">
                                {transformDef?.description}
                            </p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="animate-scale-in delay-300 space-y-2">
                        <button
                            type="button"
                            onClick={handleDownload}
                            disabled={!resultImageUrl}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 motion-safe:active:scale-[0.98]"
                        >
                            <DownloadSimple className="h-4 w-4" weight="bold" />
                            Download Result
                        </button>

                        <button
                            type="button"
                            onClick={handleShare}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[--border-crisp] bg-[--surface-enamel] px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:border-primary/40 hover:shadow-[--shadow-enamel-hover] motion-safe:active:scale-[0.98]"
                        >
                            <ShareNetwork className="h-4 w-4" />
                            Share
                        </button>

                        <button
                            type="button"
                            onClick={handleTryAnother}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[--border-crisp] bg-[--surface-enamel] px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:border-primary/40 hover:shadow-[--shadow-enamel-hover] motion-safe:active:scale-[0.98]"
                        >
                            <ArrowCounterClockwise className="h-4 w-4" />
                            Try Another Style
                        </button>

                        <button
                            type="button"
                            onClick={handleStartOver}
                            className="w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Start over
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
