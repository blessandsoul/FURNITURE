'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import Image from 'next/image';
import { ArrowLeft, ArrowsClockwise, WarningCircle, DownloadSimple, SpinnerGap, MagnifyingGlassPlus } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';
import { getErrorMessage } from '@/lib/utils/error';
import { useCategoryBySlug } from '@/features/catalog/hooks/useCatalog';
import { useCreateDesign } from '@/features/designs/hooks/useDesigns';
import { useGenerateImage, useGeneration, useGenerationStatus } from '@/features/ai-generation/hooks/useAiGeneration';
import { useConfigurator } from '../../hooks/useConfigurator';
import { usePriceBreakdown } from '../pricing/PricePanel';
import { PriceBreakdownCard } from '../result/PriceBreakdownCard';
import { ResultActions } from '../result/ResultActions';
import { GeneratingOverlay } from '../skeletons/GeneratingOverlay';
import { GenerationStatusBadge } from '../result/GenerationStatusBadge';
import { ImageLightbox } from '../result/ImageLightbox';

interface Step3ResultProps {
    basePath?: string;
}

export function Step3Result({ basePath = ROUTES.CONFIGURATOR.ROOT }: Step3ResultProps): React.JSX.Element {
    const router = useRouter();
    const {
        state,
        addGeneratedImage,
        setSavedDesign,
        setGenerationId,
        reset,
    } = useConfigurator();
    const { selectedCategorySlug, selectedCategoryId, selectedOptionValueIds, savedDesignId, generationId, generatedImageUrls } = state;

    const { data: category } = useCategoryBySlug(selectedCategorySlug);
    const breakdown = usePriceBreakdown(category);

    const createDesign = useCreateDesign();
    const generateImage = useGenerateImage();
    const { data: generationStatus } = useGenerationStatus();

    // Poll the generation until completed or failed
    const { data: generation } = useGeneration(generationId);

    // Track whether we've kicked off the save+generate flow.
    const hasStarted = useRef(false);
    const [error, setError] = useState<string | null>(null);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [lightbox, setLightbox] = useState<{ src: string; alt: string; label: string; variant: 'before' | 'after' } | null>(null);

    const hasImages = generatedImageUrls.length > 0;
    const latestImageUrl = hasImages ? generatedImageUrls[generatedImageUrls.length - 1] : undefined;

    // When generation completes, update the image URL (only on status change)
    const prevGenerationStatus = useRef<string | null>(null);
    useEffect(() => {
        if (!generation) return;
        // Only act when status actually changes to avoid redundant dispatches
        if (generation.status === prevGenerationStatus.current) return;
        prevGenerationStatus.current = generation.status;

        if (generation.status === 'COMPLETED' && generation.imageUrl) {
            addGeneratedImage(generation.imageUrl);
            setIsRegenerating(false);
        }
        if (generation.status === 'FAILED') {
            setError(generation.errorMessage ?? 'Generation failed. Please try again.');
            setIsRegenerating(false);
        }
    }, [generation, addGeneratedImage]);

    // Auto-trigger: save design → generate image (fires once).
    // NOTE: `hasStarted` ref is the sole guard against StrictMode double-mount.
    // A closure-based `cancelled` flag does NOT work here because StrictMode's
    // cleanup sets it to `true`, but the second mount skips re-creation (due to
    // hasStarted), leaving the original `.then()` chain permanently cancelled.
    useEffect(() => {
        if (hasStarted.current) return;

        if (!selectedCategoryId || selectedOptionValueIds.length === 0) return;

        // Already have a generation — nothing to do
        if (generationId) return;

        hasStarted.current = true;

        const isReimagineMode = state.mode === 'reimagine';

        // Build extra fields for reimagine mode
        const roomFields = isReimagineMode && state.roomRedesign.roomImageUrl
            ? {
                roomImageUrl: state.roomRedesign.roomImageUrl,
                placementInstructions: state.roomRedesign.placementInstructions || undefined,
            }
            : {};

        // If we already have a saved design, skip to generation
        if (savedDesignId) {
            generateImage.mutateAsync({ designId: savedDesignId, ...roomFields })
                .then((gen) => { setGenerationId(gen.id); })
                .catch((err: unknown) => {
                    setError(getErrorMessage(err));
                    toast.error(getErrorMessage(err));
                });
            return;
        }

        // Step 1: Save design → Step 2: Generate AI image
        const categoryName = category?.name ?? 'Design';
        createDesign.mutateAsync({
            categoryId: selectedCategoryId,
            name: `My ${categoryName}`,
            optionValueIds: selectedOptionValueIds,
            ...(isReimagineMode && state.roomRedesign.roomImageUrl ? {
                roomImageUrl: state.roomRedesign.roomImageUrl,
                roomThumbnailUrl: state.roomRedesign.roomThumbnailUrl || undefined,
            } : {}),
        })
            .then((design) => {
                setSavedDesign(design.id);
                return generateImage.mutateAsync({ designId: design.id, ...roomFields })
                    .then((gen) => { setGenerationId(gen.id); });
            })
            .catch((err: unknown) => {
                setError(getErrorMessage(err));
                toast.error(getErrorMessage(err));
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRetry = useCallback(() => {
        if (!savedDesignId) return;
        setError(null);
        setIsRegenerating(true);
        prevGenerationStatus.current = null;

        const retryRoomFields = state.mode === 'reimagine' && state.roomRedesign.roomImageUrl
            ? {
                roomImageUrl: state.roomRedesign.roomImageUrl,
                placementInstructions: state.roomRedesign.placementInstructions || undefined,
            }
            : {};

        generateImage.mutateAsync({ designId: savedDesignId, ...retryRoomFields })
            .then((gen) => setGenerationId(gen.id))
            .catch((err: unknown) => {
                setIsRegenerating(false);
                setError(getErrorMessage(err));
                toast.error(getErrorMessage(err));
            });
    }, [savedDesignId, generateImage, setGenerationId, state.mode, state.roomRedesign]);

    const handleBack = useCallback(() => {
        router.push(`${basePath}?step=2&mode=${state.mode}`);
    }, [basePath, router, state.mode]);

    const handleRestart = useCallback(() => {
        reset();
        router.push(`${basePath}?step=1&mode=${state.mode}`);
    }, [basePath, reset, router, state.mode]);

    const handleDownload = useCallback(async (imageUrl: string) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = blobUrl;
            anchor.download = 'atlas-furniture-design.png';
            anchor.click();
            URL.revokeObjectURL(blobUrl);
        } catch {
            window.open(imageUrl, '_blank', 'noopener,noreferrer');
        }
    }, []);

    // Guard: no category selected
    if (!selectedCategoryId) {
        return (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Please complete the previous steps first.
            </div>
        );
    }

    // Check if user has no credits and no free generations
    const cannotGenerate = generationStatus &&
        generationStatus.freeRemaining === 0 &&
        generationStatus.creditBalance === 0;

    if (cannotGenerate && !generationId && !hasImages) {
        return (
            <div className="flex h-full min-h-0 flex-col items-center justify-center gap-4">
                <WarningCircle className="h-10 w-10 text-warning" />
                <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">No credits remaining</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Purchase credits to generate AI images of your design
                    </p>
                </div>
                <Button
                    onClick={() => router.push(ROUTES.CREDITS)}
                    className="mt-2"
                >
                    Buy Credits
                </Button>
                <button
                    type="button"
                    onClick={handleBack}
                    className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline transition-colors duration-150"
                >
                    Go back
                </button>
            </div>
        );
    }

    // Loading: design saving or initial generation in progress (no images yet)
    const isInitialGenerating = (
        createDesign.isPending ||
        generateImage.isPending ||
        (generation?.status === 'PENDING' || generation?.status === 'PROCESSING') ||
        (!hasImages && !error && generationId)
    );

    if (isInitialGenerating && !hasImages) {
        return <GeneratingOverlay />;
    }

    // Error state (only show full-screen error when no images exist)
    if (error && !hasImages) {
        return (
            <div className="flex h-full min-h-0 flex-col items-center justify-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5">
                <WarningCircle className="h-10 w-10 text-destructive" />
                <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">Generation failed</p>
                    <p className="mt-1 text-xs text-muted-foreground">{error}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleRetry}>
                    <ArrowsClockwise className="mr-2 h-4 w-4" />
                    Try again
                </Button>
            </div>
        );
    }

    const isSingleImage = generatedImageUrls.length === 1 && !isRegenerating;

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
                        {state.mode === 'reimagine' ? (
                            <>Your Room <span className="text-primary">Reimagined</span></>
                        ) : (
                            <>Your{' '}<span className="text-primary">{category?.name ?? 'Furniture'}</span>{' '}Design</>
                        )}
                    </h2>
                    <GenerationStatusBadge />
                </div>
            </div>

            {/* Main content: image(s) + right panel */}
            <div className="flex min-h-0 flex-1 gap-4">
                {/* Left: image grid */}
                <div className="animate-fade-up delay-75 min-h-0 flex-1 overflow-y-auto">
                    {isSingleImage && state.mode === 'reimagine' && state.roomRedesign.roomImageUrl ? (
                        /* Reimagine before/after — vertical stack */
                        <div className="flex flex-col gap-4 animate-scale-in">
                            {/* Before: original room */}
                            <button
                                type="button"
                                onClick={() => setLightbox({ src: state.roomRedesign.roomImageUrl!, alt: 'Original room', label: 'Before', variant: 'before' })}
                                className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none cursor-pointer"
                            >
                                <div className="absolute left-3 top-3 z-10 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-semibold text-white">
                                    Before
                                </div>
                                <Image
                                    src={state.roomRedesign.roomImageUrl}
                                    alt="Original room"
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                    sizes="(max-width: 768px) 100vw, 55vw"
                                    unoptimized
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/10">
                                    <MagnifyingGlassPlus className="h-8 w-8 text-white opacity-0 drop-shadow-lg transition-opacity duration-200 group-hover:opacity-100" />
                                </div>
                            </button>

                            {/* After: reimagined room */}
                            <button
                                type="button"
                                onClick={() => setLightbox({ src: generatedImageUrls[0], alt: 'Reimagined room', label: 'After', variant: 'after' })}
                                className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none cursor-pointer"
                            >
                                <div className="absolute left-3 top-3 z-10 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                                    After
                                </div>
                                <Image
                                    src={generatedImageUrls[0]}
                                    alt="Reimagined room"
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                    sizes="(max-width: 768px) 100vw, 55vw"
                                    unoptimized
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/10">
                                    <MagnifyingGlassPlus className="h-8 w-8 text-white opacity-0 drop-shadow-lg transition-opacity duration-200 group-hover:opacity-100" />
                                </div>
                            </button>
                        </div>
                    ) : isSingleImage ? (
                        /* Single image: full-size display */
                        <div className="group relative h-full min-h-0 overflow-hidden rounded-2xl border border-[--border-crisp] shadow-[--shadow-enamel] animate-scale-in">
                            <Image
                                src={generatedImageUrls[0]}
                                alt={`Generated ${category?.name ?? 'furniture'} design`}
                                fill
                                priority
                                className="object-cover transition-opacity duration-300"
                                sizes="(max-width: 768px) 100vw, 55vw"
                                unoptimized={generatedImageUrls[0].startsWith('http')}
                            />
                            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/50 to-transparent px-4 py-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                <span className="text-xs font-semibold text-white/90">
                                    AI Generated
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleDownload(generatedImageUrls[0])}
                                    className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/30"
                                >
                                    <DownloadSimple className="h-3.5 w-3.5" />
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Multi-image: grid layout */
                        <div className="grid grid-cols-2 gap-3">
                            {generatedImageUrls.map((url, index) => (
                                <div
                                    key={url}
                                    className="group relative aspect-square overflow-hidden rounded-2xl border border-[--border-crisp] shadow-[--shadow-enamel] animate-scale-in"
                                >
                                    <Image
                                        src={url}
                                        alt={`Generated ${category?.name ?? 'furniture'} design ${index + 1}`}
                                        fill
                                        priority={index === generatedImageUrls.length - 1}
                                        className="object-cover transition-opacity duration-300"
                                        sizes="(max-width: 768px) 50vw, 30vw"
                                        unoptimized={url.startsWith('http')}
                                    />
                                    {/* "Latest" badge on most recent image */}
                                    {index === generatedImageUrls.length - 1 && (
                                        <div className="absolute left-2 top-2">
                                            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                                                Latest
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/50 to-transparent px-3 py-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                        <span className="text-[10px] font-semibold text-white/90">
                                            #{index + 1}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleDownload(url)}
                                            className="flex items-center gap-1 rounded-lg bg-white/20 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/30"
                                        >
                                            <DownloadSimple className="h-3 w-3" />
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Loading skeleton card for regeneration */}
                            {isRegenerating && (
                                <div className="flex aspect-square items-center justify-center rounded-2xl border border-border/50 bg-muted/30 animate-pulse">
                                    <div className="flex flex-col items-center gap-2">
                                        <SpinnerGap className="h-8 w-8 animate-spin text-primary" />
                                        <span className="text-xs font-medium text-muted-foreground">
                                            Generating...
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right panel: price + actions */}
                <div className="animate-fade-up delay-150 flex w-72 shrink-0 flex-col gap-3 overflow-y-auto xl:w-80">
                    <div className="animate-scale-in delay-200 shrink-0">
                        <PriceBreakdownCard breakdown={breakdown} />
                    </div>

                    {/* Inline error for regeneration failures (when images already exist) */}
                    {error && hasImages && (
                        <div className="shrink-0 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2">
                            <p className="text-xs font-medium text-destructive">{error}</p>
                        </div>
                    )}

                    <div className="animate-scale-in delay-300 shrink-0">
                        <ResultActions
                            imageUrl={latestImageUrl}
                            designId={savedDesignId}
                            isRegenerating={isRegenerating}
                            onRestart={handleRestart}
                            onRetry={handleRetry}
                        />
                    </div>
                </div>
            </div>

            {/* Image lightbox */}
            {lightbox && (
                <ImageLightbox
                    open={!!lightbox}
                    onOpenChange={(open) => { if (!open) setLightbox(null); }}
                    src={lightbox.src}
                    alt={lightbox.alt}
                    label={lightbox.label}
                    labelVariant={lightbox.variant}
                />
            )}
        </div>
    );
}
