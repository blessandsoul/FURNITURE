'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    ChatText,
    Trash,
    PencilSimple,
    SpinnerGap,
    MagnifyingGlassPlus,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants/routes';
import { useDesign, useDeleteDesign } from '../hooks/useDesigns';
import { GenerationTimeline } from './GenerationTimeline';
import { QuoteModal } from '@/features/quotes/components/QuoteModal';
import { ImageLightbox } from '@/features/configurator/components/result/ImageLightbox';

const STATUS_STYLES: Record<string, string> = {
    DRAFT: 'bg-muted text-muted-foreground',
    GENERATED: 'bg-success/10 text-success',
    QUOTED: 'bg-primary/10 text-primary',
};

interface DesignDetailViewProps {
    designId: string;
}

export function DesignDetailView({ designId }: DesignDetailViewProps): React.JSX.Element {
    const router = useRouter();
    const { data: design, isLoading, error } = useDesign(designId);
    const deleteDesign = useDeleteDesign();
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [isQuoteOpen, setIsQuoteOpen] = useState(false);
    const [lightbox, setLightbox] = useState<{ src: string; alt: string; label: string; variant: 'before' | 'after' } | null>(null);

    const handleDelete = useCallback(() => {
        if (!isConfirmingDelete) {
            setIsConfirmingDelete(true);
            return;
        }
        deleteDesign.mutateAsync(designId)
            .then(() => {
                router.push(ROUTES.MY_DESIGNS);
            })
            .catch(() => {
                toast.error('Failed to delete design');
                setIsConfirmingDelete(false);
            });
    }, [designId, deleteDesign, isConfirmingDelete, router]);

    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="h-5 w-28 animate-pulse rounded bg-muted" />
                <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
                    <div className="w-full lg:w-1/2">
                        <div className="aspect-[4/3] animate-pulse rounded-xl bg-muted/30" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="h-8 w-3/4 animate-pulse rounded-lg bg-muted" />
                        <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
                        <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !design) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <h2 className="text-lg font-semibold text-foreground">Design not found</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    This design may have been deleted or you don&apos;t have access to it.
                </p>
                <Button asChild variant="outline" className="mt-4">
                    <Link href={ROUTES.MY_DESIGNS}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to My Designs
                    </Link>
                </Button>
            </div>
        );
    }

    const formattedDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(design.createdAt));

    const options = design.configSnapshot?.options ?? [];

    return (
        <div className="space-y-10">
            {/* Back link */}
            <Link
                href={ROUTES.MY_DESIGNS}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" />
                My Designs
            </Link>

            {/* Design Header */}
            <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
                {/* Hero Image(s) */}
                <div className="w-full lg:w-1/2">
                    {design.roomImageUrl ? (
                        /* Before / After side-by-side for reimagine designs */
                        <div className="grid grid-cols-2 gap-3">
                            {/* Before: original room */}
                            <button
                                type="button"
                                onClick={() => setLightbox({ src: design.roomImageUrl!, alt: 'Original room', label: 'Before', variant: 'before' })}
                                className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border/50 bg-muted/30 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none cursor-pointer"
                            >
                                <div className="absolute left-2 top-2 z-10 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
                                    Before
                                </div>
                                <Image
                                    src={design.roomImageUrl}
                                    alt="Original room"
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                    sizes="(max-width: 1024px) 50vw, 25vw"
                                    unoptimized
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/10">
                                    <MagnifyingGlassPlus className="h-6 w-6 text-white opacity-0 drop-shadow-lg transition-opacity duration-200 group-hover:opacity-100" />
                                </div>
                            </button>

                            {/* After: AI generated */}
                            <button
                                type="button"
                                onClick={() => design.imageUrl && setLightbox({ src: design.imageUrl, alt: design.name, label: 'After', variant: 'after' })}
                                className={cn(
                                    'group relative aspect-[4/3] w-full overflow-hidden rounded-xl border bg-muted/30 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none',
                                    design.imageUrl
                                        ? 'border-primary/30 hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                                        : 'border-border/50 cursor-default',
                                )}
                            >
                                <div className="absolute left-2 top-2 z-10 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                                    After
                                </div>
                                {design.imageUrl ? (
                                    <>
                                        <Image
                                            src={design.imageUrl}
                                            alt={design.name}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                            sizes="(max-width: 1024px) 50vw, 25vw"
                                            priority
                                            unoptimized={design.imageUrl.startsWith('http')}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/10">
                                            <MagnifyingGlassPlus className="h-6 w-6 text-white opacity-0 drop-shadow-lg transition-opacity duration-200 group-hover:opacity-100" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                        Not generated yet
                                    </div>
                                )}
                            </button>
                        </div>
                    ) : (
                        /* Single hero image for scratch designs */
                        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border/50 bg-muted/30">
                            {design.imageUrl ? (
                                <Image
                                    src={design.imageUrl}
                                    alt={design.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    priority
                                    unoptimized={design.imageUrl.startsWith('http')}
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                    No preview available
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col">
                    {/* Title + badges */}
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={cn(
                                'rounded-full px-2.5 py-0.5 text-xs font-medium',
                                STATUS_STYLES[design.status] ?? STATUS_STYLES.DRAFT,
                            )}>
                                {design.status}
                            </span>
                            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                                {design.categoryName}
                            </span>
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl" style={{ textWrap: 'balance' }}>
                            {design.name}
                        </h1>

                        <p className="text-sm text-muted-foreground">{formattedDate}</p>
                    </div>

                    {/* Price */}
                    <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-4">
                        <div className="flex items-baseline justify-between">
                            <span className="text-sm text-muted-foreground">Total Price</span>
                            <span className="text-2xl font-bold tabular-nums text-foreground">
                                ${design.totalPrice.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Config options */}
                    {options.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Configuration</span>
                            <div className="flex flex-wrap gap-1.5">
                                {options.map((opt) => (
                                    <span
                                        key={`${opt.groupSlug}-${opt.valueSlug}`}
                                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                                    >
                                        <span className="text-primary/60">{opt.groupName}:</span>
                                        {opt.valueLabel}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex flex-wrap gap-2">
                        {design.status === 'GENERATED' && (
                            <Button onClick={() => setIsQuoteOpen(true)} className="gap-2">
                                <ChatText className="h-4 w-4" />
                                Request Quote
                            </Button>
                        )}

                        <Button variant="outline" asChild className="gap-2">
                            <Link href={ROUTES.CONFIGURATOR.ROOT}>
                                <PencilSimple className="h-4 w-4" />
                                Open in Configurator
                            </Link>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={handleDelete}
                            disabled={deleteDesign.isPending}
                            className={cn(
                                'gap-2',
                                isConfirmingDelete
                                    ? 'border-destructive bg-destructive/10 text-destructive'
                                    : 'text-destructive hover:bg-destructive/10 hover:text-destructive',
                            )}
                        >
                            {deleteDesign.isPending ? (
                                <SpinnerGap className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash className="h-4 w-4" />
                            )}
                            {isConfirmingDelete ? 'Confirm Delete' : 'Delete'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Generation Timeline */}
            <GenerationTimeline design={design} />

            {/* Quote Modal */}
            <QuoteModal
                open={isQuoteOpen}
                onOpenChange={setIsQuoteOpen}
                designId={designId}
            />

            {/* Image Lightbox */}
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
