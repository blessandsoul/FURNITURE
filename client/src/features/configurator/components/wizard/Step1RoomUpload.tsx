'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { CloudArrowUp, SpinnerGap, Trash, WarningCircle } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils/error';
import { useCategories } from '@/features/catalog/hooks/useCatalog';
import { useUploadRoomImage } from '@/features/ai-generation/hooks/useAiGeneration';
import { useConfigurator } from '../../hooks/useConfigurator';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
        return 'Please upload a JPEG, PNG, or WebP image.';
    }
    if (file.size > MAX_SIZE) {
        return 'Image must be under 5MB.';
    }
    return null;
}

export function Step1RoomUpload(): React.JSX.Element {
    const { state, setRoomImage, removeRoomImage, setCategory } = useConfigurator();
    const { roomImageUrl, roomThumbnailUrl } = state.roomRedesign;
    const hasImage = !!roomImageUrl && roomImageUrl !== '';

    const uploadMutation = useUploadRoomImage();
    const { data: categories } = useCategories();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    // Auto-select sofa category after upload
    const autoSelectSofa = useCallback(() => {
        if (state.selectedCategoryId) return; // already selected
        const sofa = categories?.find((c) => c.slug === 'sofa');
        if (sofa) {
            setCategory(sofa.id, sofa.slug);
        }
    }, [categories, state.selectedCategoryId, setCategory]);

    const handleUpload = useCallback(async (file: File) => {
        const error = validateFile(file);
        if (error) {
            toast.error(error);
            return;
        }

        try {
            const result = await uploadMutation.mutateAsync(file);
            setRoomImage(result.roomImageUrl, result.thumbnailUrl);
            autoSelectSofa();
        } catch (err: unknown) {
            toast.error(getErrorMessage(err));
        }
    }, [uploadMutation, setRoomImage, autoSelectSofa]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
        // Reset input so the same file can be re-selected
        e.target.value = '';
    }, [handleUpload]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleUpload(file);
    }, [handleUpload]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleRemove = useCallback(() => {
        removeRoomImage();
    }, [removeRoomImage]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-foreground">Upload Your Room</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Upload a photo of your room and we&apos;ll place your configured furniture in it
                </p>
            </div>

            {hasImage ? (
                /* Preview state */
                <div className="relative mx-auto max-w-lg overflow-hidden rounded-2xl border border-border/50 shadow-sm">
                    <div className="relative aspect-[4/3]">
                        <Image
                            src={roomThumbnailUrl ?? roomImageUrl}
                            alt="Uploaded room"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 512px"
                            unoptimized
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-all hover:bg-destructive"
                        aria-label="Remove room image"
                    >
                        <Trash className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/40 to-transparent px-4 py-3">
                        <p className="text-xs font-medium text-white/90">Room photo uploaded</p>
                    </div>
                </div>
            ) : (
                /* Upload zone */
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    disabled={uploadMutation.isPending}
                    className={`relative mx-auto flex w-full max-w-lg flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-16 transition-all duration-200 ${
                        isDragOver
                            ? 'border-primary bg-primary/5 scale-[1.01]'
                            : 'border-border/70 bg-muted/20 hover:border-primary/50 hover:bg-muted/40'
                    } ${uploadMutation.isPending ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
                    aria-label="Upload room photo"
                >
                    {uploadMutation.isPending ? (
                        <>
                            <SpinnerGap className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-sm font-medium text-muted-foreground">Uploading...</p>
                        </>
                    ) : (
                        <>
                            <CloudArrowUp className="h-10 w-10 text-muted-foreground" />
                            <div className="text-center">
                                <p className="text-sm font-semibold text-foreground">
                                    Drag & drop your room photo
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    or click to browse
                                </p>
                            </div>
                            <p className="text-[11px] text-muted-foreground/60">
                                JPEG, PNG, or WebP &middot; Max 5MB
                            </p>
                        </>
                    )}
                </button>
            )}

            {uploadMutation.error && !hasImage && (
                <div className="mx-auto flex max-w-lg items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
                    <WarningCircle className="h-4 w-4 shrink-0 text-destructive" />
                    <p className="text-xs text-destructive">
                        {getErrorMessage(uploadMutation.error)}
                    </p>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                aria-hidden="true"
            />

            {!hasImage && (
                <p className="text-center text-xs text-muted-foreground">
                    Upload a room photo to continue to customization
                </p>
            )}
        </div>
    );
}
