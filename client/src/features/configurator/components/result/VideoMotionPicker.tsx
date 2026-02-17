'use client';

import { Video, Play } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { VideoMotion } from '../../types/configurator.types';

interface VideoMotionPickerProps {
    motions: VideoMotion[];
    selectedId: string | null;
    onSelect: (motion: VideoMotion) => void;
    isGenerating: boolean;
}

export function VideoMotionPicker({
    motions,
    selectedId,
    onSelect,
    isGenerating,
}: VideoMotionPickerProps): React.JSX.Element {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Generate Video</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Beta
                </span>
            </div>

            <p className="text-xs text-muted-foreground">
                Pick an animation and bring your furniture to life.
            </p>

            <div className="grid gap-2 sm:grid-cols-3">
                {motions.map((motion) => {
                    const isSelected = selectedId === motion.id;
                    return (
                        <button
                            key={motion.id}
                            type="button"
                            onClick={() => !isGenerating && onSelect(motion)}
                            disabled={isGenerating}
                            aria-pressed={isSelected}
                            className={cn(
                                'group flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left',
                                'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                                'disabled:cursor-not-allowed disabled:opacity-50',
                                isSelected
                                    ? 'border-primary bg-primary/5 shadow-[0_0_0_1px_hsl(var(--primary)_/_0.3)]'
                                    : 'border-[--border-crisp] bg-[--surface-enamel] hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-[--shadow-enamel-hover]',
                            )}
                        >
                            <div className="flex w-full items-center justify-between">
                                <span
                                    className={cn(
                                        'text-xs font-semibold',
                                        isSelected ? 'text-primary' : 'text-foreground',
                                    )}
                                >
                                    {motion.label}
                                </span>
                                <Play
                                    className={cn(
                                        'h-3.5 w-3.5 transition-colors',
                                        isSelected
                                            ? 'text-primary'
                                            : 'text-muted-foreground group-hover:text-primary/70',
                                    )}
                                    weight={isSelected ? 'fill' : 'regular'}
                                />
                            </div>
                            <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                                {motion.description}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
