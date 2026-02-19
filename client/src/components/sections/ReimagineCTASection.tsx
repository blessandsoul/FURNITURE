'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Camera, ArrowRight, Sparkle, Sliders } from '@phosphor-icons/react';
import { ROUTES } from '@/lib/constants/routes';

export function ReimagineCTASection(): React.JSX.Element {
    const t = useTranslations('Home');

    const HIGHLIGHTS = [
        { icon: Camera, textKey: 'reimagineCTA.highlight1' as const },
        { icon: Sliders, textKey: 'reimagineCTA.highlight2' as const },
        { icon: Sparkle, textKey: 'reimagineCTA.highlight3' as const },
    ];

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

                    {/* Right: Visual preview mock */}
                    <div className="relative w-full max-w-xs shrink-0 md:max-w-sm">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[--border-crisp] bg-muted/30 shadow-sm">
                            {/* Simulated before/after split */}
                            <div className="absolute inset-0 flex">
                                <div className="flex w-1/2 items-center justify-center border-r border-dashed border-[--border-crisp] bg-muted/50">
                                    <div className="text-center">
                                        <Camera className="mx-auto h-8 w-8 text-muted-foreground/40" />
                                        <p className="mt-2 text-xs text-muted-foreground/60">{t('reimagineCTA.mockBefore')}</p>
                                    </div>
                                </div>
                                <div className="flex w-1/2 items-center justify-center bg-primary/5">
                                    <div className="text-center">
                                        <Sparkle className="mx-auto h-8 w-8 text-primary/40" />
                                        <p className="mt-2 text-xs text-primary/60">{t('reimagineCTA.mockAfter')}</p>
                                    </div>
                                </div>
                            </div>
                            {/* Center divider handle */}
                            <div className="absolute left-1/2 top-1/2 z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[--border-crisp] bg-background shadow-sm">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted-foreground">
                                    <path d="M4.5 3L1.5 7L4.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M9.5 3L12.5 7L9.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
