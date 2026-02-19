'use client';

import { useCallback } from 'react';
import Image from 'next/image';
import { DownloadSimple, X } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface ImageLightboxProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    src: string;
    alt: string;
    label?: string;
    labelVariant?: 'before' | 'after';
}

export function ImageLightbox({
    open,
    onOpenChange,
    src,
    alt,
    label,
    labelVariant = 'before',
}: ImageLightboxProps): React.JSX.Element {
    const handleDownload = useCallback(async () => {
        try {
            const response = await fetch(src);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = blobUrl;
            anchor.download = 'atlas-furniture-design.png';
            anchor.click();
            URL.revokeObjectURL(blobUrl);
        } catch {
            window.open(src, '_blank', 'noopener,noreferrer');
        }
    }, [src]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="max-w-[95vw] max-h-[95vh] w-auto h-auto border-none bg-transparent p-0 shadow-none sm:max-w-[95vw]"
            >
                <DialogTitle className="sr-only">{alt}</DialogTitle>

                {/* Close button */}
                <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="absolute -top-10 right-0 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                    aria-label="Close"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Image container */}
                <div className="relative flex items-center justify-center">
                    {/* Badge */}
                    {label && (
                        <div className="absolute left-3 top-3 z-10">
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    labelVariant === 'after'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-black/60 text-white'
                                }`}
                            >
                                {label}
                            </span>
                        </div>
                    )}

                    {/* Download button */}
                    <button
                        type="button"
                        onClick={handleDownload}
                        className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                    >
                        <DownloadSimple className="h-3.5 w-3.5" />
                        Download
                    </button>

                    <Image
                        src={src}
                        alt={alt}
                        width={1200}
                        height={900}
                        className="max-h-[85vh] w-auto rounded-xl object-contain"
                        sizes="95vw"
                        priority
                        unoptimized
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
