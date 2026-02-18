'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkle, Armchair, PaintBrush } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants/routes';
import { TRANSFORMATION_MODES, ROOM_STYLES } from '../../data/room-catalog';
import type { TransformationMode, RoomDesignStyle } from '../../types/configurator.types';

const TRANSFORM_ICON_MAP: Record<string, React.ComponentType<{ className?: string; weight?: 'regular' | 'fill' }>> = {
    Sparkle,
    Armchair,
    PaintBrush,
};

interface Step2RoomTransformProps {
    roomImageUrl: string | null;
    selectedMode: TransformationMode | null;
    selectedStyle: RoomDesignStyle | null;
    onSelectMode: (mode: TransformationMode) => void;
    onSelectStyle: (style: RoomDesignStyle) => void;
    basePath?: string;
}

export function Step2RoomTransform({
    roomImageUrl,
    selectedMode,
    selectedStyle,
    onSelectMode,
    onSelectStyle,
    basePath = ROUTES.CONFIGURATOR.ROOT,
}: Step2RoomTransformProps): React.JSX.Element {
    const router = useRouter();

    const handleBack = useCallback(() => {
        router.push(`${basePath}?step=1&mode=reimagine`);
    }, [basePath, router]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="animate-fade-up">
                <button
                    type="button"
                    onClick={handleBack}
                    className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>
                <h2 className="text-xl font-bold text-foreground">How should we transform it?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Choose what to change and pick a design style
                </p>
            </div>

            {/* Room preview thumbnail */}
            {roomImageUrl && (
                <div className="animate-fade-up delay-75 overflow-hidden rounded-lg border border-[--border-crisp]">
                    <img
                        src={roomImageUrl}
                        alt="Your room"
                        className="h-32 w-full object-cover"
                    />
                </div>
            )}

            {/* Transformation mode */}
            <div className="animate-fade-up delay-100">
                <h3 className="mb-2 text-sm font-semibold text-foreground">Transformation Mode</h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {TRANSFORMATION_MODES.map((transform) => {
                        const isSelected = selectedMode === transform.id;
                        const Icon = TRANSFORM_ICON_MAP[transform.iconName] ?? Sparkle;

                        return (
                            <button
                                key={transform.id}
                                type="button"
                                onClick={() => onSelectMode(transform.id)}
                                aria-pressed={isSelected}
                                className={cn(
                                    'flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                                    'motion-safe:active:scale-[0.98]',
                                    isSelected
                                        ? 'border-primary bg-primary/5 shadow-[0_0_0_1.5px_oklch(0.28_0.055_48)]'
                                        : 'border-[--border-crisp] bg-[--surface-enamel] hover:border-primary/40 hover:shadow-[--shadow-enamel-hover]',
                                )}
                            >
                                <div
                                    className={cn(
                                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                                        isSelected ? 'bg-primary/10' : 'bg-muted',
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            'h-5 w-5 transition-colors',
                                            isSelected ? 'text-primary' : 'text-muted-foreground',
                                        )}
                                        weight={isSelected ? 'fill' : 'regular'}
                                    />
                                </div>
                                <div>
                                    <p
                                        className={cn(
                                            'text-sm font-semibold leading-tight',
                                            isSelected ? 'text-primary' : 'text-foreground',
                                        )}
                                    >
                                        {transform.label}
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {transform.description}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Room style */}
            <div className="animate-fade-up delay-200">
                <h3 className="mb-2 text-sm font-semibold text-foreground">Design Style</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {ROOM_STYLES.map((style) => {
                        const isSelected = selectedStyle === style.id;

                        return (
                            <button
                                key={style.id}
                                type="button"
                                onClick={() => onSelectStyle(style.id)}
                                aria-pressed={isSelected}
                                className={cn(
                                    'flex flex-col items-center gap-2 rounded-xl border p-3 transition-all duration-200',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                                    'motion-safe:active:scale-[0.97]',
                                    isSelected
                                        ? 'border-primary bg-primary/5 shadow-[0_0_0_1.5px_oklch(0.28_0.055_48)]'
                                        : 'border-[--border-crisp] bg-[--surface-enamel] hover:border-primary/40 hover:shadow-[--shadow-enamel-hover]',
                                )}
                            >
                                <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: style.colorAccent }}
                                />
                                <div className="text-center">
                                    <p
                                        className={cn(
                                            'text-xs font-semibold leading-tight',
                                            isSelected ? 'text-primary' : 'text-foreground',
                                        )}
                                    >
                                        {style.label}
                                    </p>
                                    <p className="mt-0.5 hidden text-[10px] text-muted-foreground sm:block">
                                        {style.description}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Status hint */}
            {!selectedMode && !selectedStyle && (
                <p className="text-center text-xs text-muted-foreground">
                    Select a transformation mode and design style to continue
                </p>
            )}
            {selectedMode && !selectedStyle && (
                <p className="text-center text-xs text-muted-foreground">
                    Pick a design style to continue
                </p>
            )}
            {!selectedMode && selectedStyle && (
                <p className="text-center text-xs text-muted-foreground">
                    Choose a transformation mode to continue
                </p>
            )}
        </div>
    );
}
