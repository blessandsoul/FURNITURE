'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FilmStrip } from '@phosphor-icons/react';
import { ROUTES } from '@/lib/constants/routes';
import { useConfigurator } from '../../hooks/useConfigurator';
import { useImageGeneration } from '../../hooks/useImageGeneration';
import { useVideoGeneration } from '../../hooks/useVideoGeneration';
import { usePriceCalculator } from '../../hooks/usePriceCalculator';
import { ImageGallery } from '../result/ImageGallery';
import { PriceBreakdownCard } from '../result/PriceBreakdownCard';
import { ResultActions } from '../result/ResultActions';
import { GeneratingOverlay } from '../skeletons/GeneratingOverlay';
import { SaveDesignButton } from '@/features/designs/components/SaveDesignButton';

interface Step3ResultProps {
    basePath?: string;
}

export function Step3Result({ basePath = ROUTES.CONFIGURATOR.ROOT }: Step3ResultProps): React.JSX.Element {
    const router = useRouter();
    const { selectedStyle, selectedOptions, reset } = useConfigurator();
    const { generate, data, isPending, isError, reset: resetGeneration } = useImageGeneration();
    const { reset: resetVideo } = useVideoGeneration();
    const breakdown = usePriceCalculator();

    // Refs to hold latest values so the effect can read them
    // without adding unstable deps (selectedOptions is a new array each render).
    const optionsRef = useRef(selectedOptions);
    const generateRef = useRef(generate);
    optionsRef.current = selectedOptions;
    generateRef.current = generate;

    // Fire once when selectedStyle becomes available (either on mount from
    // wizard navigation, or after sessionStorage hydration on page refresh).
    // Cleanup resets guard so React Strict Mode remount works correctly.
    const hasFired = useRef(false);
    useEffect(() => {
        if (hasFired.current) return;
        if (!selectedStyle) return;

        hasFired.current = true;
        generateRef.current({ style: selectedStyle, selectedOptions: optionsRef.current });

        return () => {
            hasFired.current = false;
        };
    }, [selectedStyle]);

    const handleRetry = useCallback(() => {
        if (selectedStyle) {
            resetGeneration();
            generate({ style: selectedStyle, selectedOptions });
        }
    }, [selectedStyle, selectedOptions, generate, resetGeneration]);

    const handleBack = useCallback(() => {
        resetGeneration();
        resetVideo();
        router.push(`${basePath}?step=2`);
    }, [basePath, resetGeneration, resetVideo, router]);

    const handleRestart = useCallback(() => {
        reset();
        resetGeneration();
        resetVideo();
        router.push(`${basePath}?step=1`);
    }, [basePath, reset, resetGeneration, resetVideo, router]);

    const handleGoToVideo = useCallback(() => {
        router.push(`${basePath}?step=4`);
    }, [basePath, router]);

    if (!selectedStyle) {
        return (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Please complete the previous steps first.
            </div>
        );
    }

    if (isPending && !data) {
        return <GeneratingOverlay />;
    }

    return (
        <div className="flex h-full min-h-0 flex-col gap-3">
            {/* Compact header */}
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
                        Your{' '}
                        <span className="text-primary">{selectedStyle.label}</span>{' '}
                        Design
                    </h2>
                    <span className="text-xs text-muted-foreground">
                        {data?.imageUrls?.length ?? 0} renders
                    </span>
                </div>
            </div>

            {/* Main content: gallery + right panel */}
            <div className="flex min-h-0 flex-1 gap-4">
                {/* Left: image gallery */}
                <div className="animate-fade-up delay-75 min-h-0 flex-1">
                    <ImageGallery
                        imageUrls={data?.imageUrls}
                        isPending={isPending}
                        isError={isError}
                        onRetry={handleRetry}
                    />
                </div>

                {/* Right panel: price + actions + video CTA */}
                <div className="animate-fade-up delay-150 flex w-72 shrink-0 flex-col gap-3 overflow-y-auto xl:w-80">
                    <div className="animate-scale-in delay-200 shrink-0">
                        <PriceBreakdownCard breakdown={breakdown} />
                    </div>

                    <div className="animate-scale-in delay-300 shrink-0">
                        <ResultActions
                            imageUrl={data?.imageUrls?.[0]}
                            onRestart={handleRestart}
                        />
                    </div>

                    {data?.imageUrls?.[0] && (
                        <div className="animate-scale-in delay-350 shrink-0">
                            <SaveDesignButton imageUrl={data.imageUrls[0]} />
                        </div>
                    )}

                    {data?.imageUrls?.[0] && (
                        <div className="animate-fade-up delay-400 shrink-0">
                            <button
                                type="button"
                                onClick={handleGoToVideo}
                                className="group flex w-full items-center justify-between rounded-xl border border-[--border-crisp] bg-[--surface-enamel] px-4 py-3 shadow-[--shadow-enamel] transition-all duration-200 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-[--shadow-enamel-hover]"
                            >
                                <div className="flex items-center gap-2">
                                    <FilmStrip className="h-4 w-4 text-primary" weight="fill" />
                                    <span className="text-sm font-semibold text-foreground">Generate Video</span>
                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                        Beta
                                    </span>
                                </div>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
                                >
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
