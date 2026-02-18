'use client';

import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface BeforeAfterSliderProps {
    beforeSrc: string;
    afterSrc: string;
    beforeLabel?: string;
    afterLabel?: string;
    className?: string;
}

export function BeforeAfterSlider({
    beforeSrc,
    afterSrc,
    beforeLabel = 'Before',
    afterLabel = 'After',
    className,
}: BeforeAfterSliderProps): React.JSX.Element {
    const [position, setPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const updatePosition = useCallback((clientX: number) => {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const x = clientX - rect.left;
        const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setPosition(pct);
    }, []);

    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            isDragging.current = true;
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            updatePosition(e.clientX);
        },
        [updatePosition],
    );

    const handlePointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (!isDragging.current) return;
            updatePosition(e.clientX);
        },
        [updatePosition],
    );

    const handlePointerUp = useCallback(() => {
        isDragging.current = false;
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            setPosition((p) => Math.max(0, p - 2));
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            setPosition((p) => Math.min(100, p + 2));
        }
    }, []);

    return (
        <div
            ref={containerRef}
            className={cn(
                'relative select-none overflow-hidden rounded-xl border border-[--border-crisp]',
                className,
            )}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            role="slider"
            aria-label="Before and after comparison"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(position)}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            style={{ touchAction: 'none' }}
        >
            {/* After image (full width, behind) */}
            <img
                src={afterSrc}
                alt={afterLabel}
                className="block h-56 w-full object-cover sm:h-72 md:h-80"
                draggable={false}
            />

            {/* Before image (clipped) */}
            <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
            >
                <img
                    src={beforeSrc}
                    alt={beforeLabel}
                    className="block h-56 w-full object-cover sm:h-72 md:h-80"
                    draggable={false}
                />
            </div>

            {/* Slider line */}
            <div
                className="absolute top-0 bottom-0 z-10 w-0.5 bg-background"
                style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
            >
                {/* Drag handle */}
                <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-full border-2 border-background bg-primary shadow-lg active:cursor-grabbing">
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="text-primary-foreground"
                    >
                        <path d="M5 3L2 8L5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M11 3L14 8L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {/* Labels */}
            <div className="pointer-events-none absolute top-3 left-3 z-20 rounded-full bg-foreground/70 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-background backdrop-blur-sm">
                {beforeLabel}
            </div>
            <div className="pointer-events-none absolute top-3 right-3 z-20 rounded-full bg-primary/90 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-primary-foreground backdrop-blur-sm">
                {afterLabel}
            </div>
        </div>
    );
}
