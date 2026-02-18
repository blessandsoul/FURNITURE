'use client';

import { useCallback, useRef, useState } from 'react';
import {
    CloudArrowUp,
    Image as ImageIcon,
    X,
    CookingPot,
    Couch,
    Bed,
    Bathtub,
    DesktopTower,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { RoomType } from '../../types/configurator.types';
import { ROOM_TYPES } from '../../data/room-catalog';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const ROOM_ICON_MAP: Record<string, React.ComponentType<{ className?: string; weight?: 'regular' | 'fill' }>> = {
    CookingPot,
    Couch,
    Bed,
    Bathtub,
    DesktopTower,
};

interface Step1RoomUploadProps {
    roomImageUrl: string | null;
    selectedRoomType: RoomType | null;
    onUploadImage: (dataUrl: string) => void;
    onRemoveImage: () => void;
    onSelectRoomType: (roomType: RoomType) => void;
}

export function Step1RoomUpload({
    roomImageUrl,
    selectedRoomType,
    onUploadImage,
    onRemoveImage,
    onSelectRoomType,
}: Step1RoomUploadProps): React.JSX.Element {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const processFile = useCallback(
        (file: File) => {
            if (!ALLOWED_TYPES.includes(file.type)) {
                toast.error('Please upload a JPEG, PNG, or WebP image.');
                return;
            }
            if (file.size > MAX_FILE_SIZE) {
                toast.error('Image must be under 10MB.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (typeof result === 'string') {
                    onUploadImage(result);
                }
            };
            reader.readAsDataURL(file);
        },
        [onUploadImage],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) processFile(file);
        },
        [processFile],
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
            // Reset input so the same file can be re-selected
            e.target.value = '';
        },
        [processFile],
    );

    return (
        <div className="animate-fade-up space-y-6">
            {/* Upload zone */}
            <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">Upload your room photo</h3>

                {roomImageUrl ? (
                    /* Preview */
                    <div className="group relative overflow-hidden rounded-xl border border-[--border-crisp]">
                        <img
                            src={roomImageUrl}
                            alt="Uploaded room"
                            className="h-56 w-full object-cover sm:h-64"
                        />
                        <button
                            type="button"
                            onClick={onRemoveImage}
                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-foreground/80 text-background transition-transform duration-200 hover:scale-110"
                            aria-label="Remove image"
                        >
                            <X className="h-4 w-4" weight="bold" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/60 to-transparent px-4 py-3">
                            <p className="text-xs font-medium text-background/90">
                                Photo uploaded — select a room type below
                            </p>
                        </div>
                    </div>
                ) : (
                    /* Drop zone */
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={cn(
                            'flex h-56 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all duration-200 sm:h-64',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                            isDragging
                                ? 'border-primary bg-primary/5'
                                : 'border-[--border-crisp] bg-[--surface-enamel] hover:border-primary/40 hover:bg-[--surface-enamel-hover]',
                        )}
                    >
                        <div
                            className={cn(
                                'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
                                isDragging ? 'bg-primary/10' : 'bg-muted',
                            )}
                        >
                            {isDragging ? (
                                <ImageIcon className="h-6 w-6 text-primary" />
                            ) : (
                                <CloudArrowUp className="h-6 w-6 text-muted-foreground" />
                            )}
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-foreground">
                                {isDragging ? 'Drop your image here' : 'Click to upload or drag & drop'}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                JPEG, PNG, or WebP — max 10MB
                            </p>
                        </div>
                    </button>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    aria-label="Upload room photo"
                />
            </div>

            {/* Room type picker */}
            <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">What room is this?</h3>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {ROOM_TYPES.map((room) => {
                        const isSelected = selectedRoomType === room.id;
                        const Icon = ROOM_ICON_MAP[room.iconName] ?? Couch;

                        return (
                            <button
                                key={room.id}
                                type="button"
                                onClick={() => onSelectRoomType(room.id)}
                                aria-pressed={isSelected}
                                className={cn(
                                    'flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all duration-200',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                                    'motion-safe:active:scale-[0.97]',
                                    isSelected
                                        ? 'border-primary bg-primary/5 shadow-[0_0_0_1.5px_oklch(0.28_0.055_48)]'
                                        : 'border-[--border-crisp] bg-[--surface-enamel] hover:border-primary/40 hover:shadow-[--shadow-enamel-hover]',
                                )}
                            >
                                <Icon
                                    className={cn(
                                        'h-5 w-5 transition-colors',
                                        isSelected ? 'text-primary' : 'text-muted-foreground',
                                    )}
                                    weight={isSelected ? 'fill' : 'regular'}
                                />
                                <span
                                    className={cn(
                                        'text-xs font-medium leading-tight',
                                        isSelected ? 'text-primary' : 'text-foreground',
                                    )}
                                >
                                    {room.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Status hint */}
            {!roomImageUrl && !selectedRoomType && (
                <p className="text-center text-xs text-muted-foreground">
                    Upload a photo and select room type to continue
                </p>
            )}
            {roomImageUrl && !selectedRoomType && (
                <p className="text-center text-xs text-muted-foreground">
                    Select a room type to continue
                </p>
            )}
            {!roomImageUrl && selectedRoomType && (
                <p className="text-center text-xs text-muted-foreground">
                    Upload a photo to continue
                </p>
            )}
        </div>
    );
}
