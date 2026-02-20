'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Camera, ArrowRight, Sparkle, Sliders } from '@phosphor-icons/react';
import { ImageCompare } from '@/components/ui/ImageCompare';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';

const PAIRS = [
    { before: '/gallery/before-after-3a.jpg', after: '/gallery/before-after-3b.jpg' },
    { before: '/gallery/before-after-1a.jpg', after: '/gallery/before-after-1b.jpg' },
    { before: '/gallery/before-after-2a.jpg', after: '/gallery/before-after-2b.jpg' },
] as const;

const CYCLE_INTERVAL = 6000;

export function ReimagineCTASection(): React.JSX.Element {
    const t = useTranslations('Home');
    const [activeIndex, setActiveIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const pausedRef = useRef(false);

    const HIGHLIGHTS = [
        { icon: Camera, textKey: 'reimagineCTA.highlight1' as const },
        { icon: Sliders, textKey: 'reimagineCTA.highlight2' as const },
        { icon: Sparkle, textKey: 'reimagineCTA.highlight3' as const },
    ];

    // Auto-cycle — pause when user is dragging the slider
    useEffect(() => {
        if (isDragging) return;

        const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;
        if (prefersReducedMotion) return;

        const timer = setInterval(() => {
            if (!pausedRef.current) {
                setActiveIndex((prev) => (prev + 1) % PAIRS.length);
            }
        }, CYCLE_INTERVAL);

        return (): void => clearInterval(timer);
    }, [isDragging]);

    const handleDotClick = useCallback((index: number): void => {
        setActiveIndex(index);
    }, []);

    const handleSliderDragStart = useCallback((): void => {
        setIsDragging(true);
        pausedRef.current = true;
    }, []);

    const handleSliderDragEnd = useCallback((): void => {
        setIsDragging(false);
        // Resume auto-cycle after a delay so it doesn't instantly switch
        setTimeout(() => {
            pausedRef.current = false;
        }, 2000);
    }, []);

    return (
        <section className="container mx-auto px-4 py-20 md:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl border border-[--border-crisp] bg-[--surface-enamel] shadow-[--shadow-enamel]">
                {/* Decorative gradient orb */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-primary/5 blur-2xl" />

                <div className="relative flex flex-col items-center gap-8 px-6 py-12 md:flex-row md:gap-12 md:px-12 md:py-16">
                    {/* Left: Icon + content */}
                    <div className="flex-1 text-center md:text-left">
                        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            {t('reimagineCTA.badge')}
                        </span>

                        <h2 className="mt-3 text-balance text-2xl font-bold leading-tight text-foreground md:text-3xl">
                            {t('reimagineCTA.heading')}
                        </h2>
                        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground md:mx-0 md:text-base">
                            {t('reimagineCTA.body')}
                        </p>

                        {/* Highlights */}
                        <ul className="mt-6 flex flex-wrap justify-center gap-4 md:justify-start">
                            {HIGHLIGHTS.map(({ icon: Icon, textKey }) => (
                                <li
                                    key={textKey}
                                    className="flex items-center gap-2 text-sm text-muted-foreground"
                                >
                                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                                        <Icon className="h-3.5 w-3.5 text-primary" />
                                    </span>
                                    {t(textKey)}
                                </li>
                            ))}
                        </ul>

                        <div className="mt-8">
                            <Link
                                href={`${ROUTES.CONFIGURATOR.ROOT}?step=1&mode=reimagine`}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm motion-safe:transition-all motion-safe:duration-200 motion-safe:hover:brightness-110 motion-safe:active:scale-[0.98]"
                            >
                                <Camera className="h-4 w-4" weight="bold" />
                                {t('reimagineCTA.cta')}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Right: Interactive Before/After slider with cycling */}
                    <div className="relative w-full max-w-xs shrink-0 md:max-w-sm">
                        <div
                            className="relative overflow-hidden rounded-xl border border-[--border-crisp] shadow-sm"
                            onPointerDown={handleSliderDragStart}
                            onPointerUp={handleSliderDragEnd}
                            onPointerCancel={handleSliderDragEnd}
                        >
                            {PAIRS.map((pair, index) => (
                                <div
                                    key={pair.before}
                                    className={cn(
                                        'motion-safe:transition-opacity motion-safe:duration-500',
                                        index === activeIndex
                                            ? 'relative opacity-100'
                                            : 'pointer-events-none absolute inset-0 opacity-0',
                                    )}
                                >
                                    <ImageCompare
                                        beforeSrc={pair.before}
                                        afterSrc={pair.after}
                                        beforeAlt={t('reimagineCTA.mockBefore')}
                                        afterAlt={t('reimagineCTA.mockAfter')}
                                        className="aspect-4/3"
                                    />
                                </div>
                            ))}

                            {/* Labels */}
                            <span className="pointer-events-none absolute bottom-2 left-2 z-20 rounded-md bg-background/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm">
                                {t('reimagineCTA.mockBefore')}
                            </span>
                            <span className="pointer-events-none absolute bottom-2 right-2 z-20 rounded-md bg-primary/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground backdrop-blur-sm">
                                {t('reimagineCTA.mockAfter')}
                            </span>
                        </div>

                        {/* Dot indicators */}
                        <div className="mt-3 flex items-center justify-center gap-1.5">
                            {PAIRS.map((pair, index) => (
                                <button
                                    key={pair.before}
                                    type="button"
                                    onClick={(): void => handleDotClick(index)}
                                    aria-label={`Show transformation ${index + 1}`}
                                    className={cn(
                                        'h-1.5 rounded-full motion-safe:transition-all motion-safe:duration-300',
                                        index === activeIndex
                                            ? 'w-4 bg-primary'
                                            : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50',
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
