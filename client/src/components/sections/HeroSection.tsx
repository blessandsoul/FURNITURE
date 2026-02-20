'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight } from '@phosphor-icons/react';
import RotatingText from '@/components/ui/RotatingText';
import { ImageCompare } from '@/components/ui/ImageCompare';
import { ROUTES } from '@/lib/constants/routes';

const FURNITURE_WORDS = [
    'სკამი',
    'მაგიდა',
    'კარადა',
    'საწოლი',
    'დივანი',
    'თარო',
] as const;

export function HeroSection(): React.JSX.Element {
    const t = useTranslations('Home');
    return (
        <section className="relative overflow-hidden px-4 py-10 md:py-14 lg:min-h-[calc(100dvh-4rem)] lg:flex lg:items-center">

            {/* Ambient background gradients */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                    backgroundImage: `
                        radial-gradient(ellipse 70% 55% at 15% 50%, oklch(0.28 0.055 48 / 0.05) 0%, transparent 65%),
                        radial-gradient(ellipse 50% 70% at 85% 20%, oklch(0.55 0.12 40 / 0.06) 0%, transparent 60%),
                        radial-gradient(ellipse 40% 40% at 80% 90%, oklch(0.73 0.05 72 / 0.08) 0%, transparent 55%)
                    `,
                }}
            />

            <div className="container mx-auto w-full">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-16">

                    {/* ── Left column: editorial text block ──────────────── */}
                    <div className="flex flex-col lg:w-[44%] lg:shrink-0">

                        {/* Overline — editorial style */}
                        <div className="mb-7 flex items-center gap-3">
                            <div className="h-px w-8 bg-primary/40" />
                            <span
                                className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/70"
                                style={{ fontFamily: 'var(--font-display)' }}
                            >
                                {t('hero.overline')}
                            </span>
                        </div>

                        {/* Headline — dramatic typographic hierarchy */}
                        <h1
                            className="font-bold leading-[1.12] tracking-[-0.03em] text-foreground text-[clamp(1.65rem,7vw,2.6rem)] lg:text-[clamp(1.9rem,2.9vw,3rem)]"
                            style={{ fontFamily: 'var(--font-display)' }}
                        >
                            {t('hero.headlineCreate')}{' '}
                            <span className="inline-flex overflow-hidden whitespace-nowrap py-[0.15em] -my-[0.15em] px-[0.1em] -mx-[0.1em] align-bottom italic">
                                <RotatingText
                                    texts={[...FURNITURE_WORDS]}
                                    rotationInterval={2200}
                                    staggerDuration={0.03}
                                    staggerFrom="first"
                                    mainClassName="inline-flex text-brand-accent"
                                    splitBy="characters"
                                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                    initial={{ y: 40, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -40, opacity: 0 }}
                                />
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="mt-6 max-w-sm text-base leading-[1.7] text-muted-foreground lg:text-[0.95rem]">
                            {t('hero.subtitle')}
                        </p>

                        {/* CTAs */}
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                            {/* Primary — solid espresso, arrow slides on hover */}
                            <Link
                                href={ROUTES.CONFIGURATOR.ROOT}
                                className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 motion-safe:active:scale-[0.97] motion-safe:active:translate-y-0"
                                style={{ fontFamily: 'var(--font-display)' }}
                            >
                                {t('hero.ctaStart')}
                                <ArrowRight
                                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                                    aria-hidden="true"
                                />
                            </Link>

                            {/* Secondary — text link, refined */}
                            <Link
                                href={ROUTES.REGISTER}
                                className="inline-flex items-center justify-center px-2 py-3.5 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors duration-200 hover:text-foreground hover:underline"
                            >
                                {t('hero.ctaAccount')}
                            </Link>
                        </div>

                        {/* Social proof micro-text */}
                        <div className="mt-8 flex items-center gap-4 border-t border-border/50 pt-6">
                            {[
                                { stat: '1,200+', label: t('hero.ordersDelivered') },
                                { stat: '4.9★',   label: t('hero.customerRating') },
                                { stat: t('hero.avgDeliveryValue'),  label: t('hero.avgDelivery') },
                            ].map(({ stat, label }, i) => (
                                <div key={label} className="flex items-center gap-4">
                                    {i > 0 && <div className="h-3 w-px bg-border/70" />}
                                    <div>
                                        <div
                                            className="text-sm font-bold tabular-nums text-foreground"
                                            style={{ fontFamily: 'var(--font-display)' }}
                                        >
                                            {stat}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground">{label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Right column: reimagine showcase ─────────────── */}
                    <div className="flex-1 min-w-0">
                        {/* Label row with live badge */}
                        <div className="mb-3 flex items-center gap-2.5">
                            <span
                                className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground"
                                style={{ fontFamily: 'var(--font-display)' }}
                            >
                                {t('hero.roomTransformation')}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">
                                <span className="h-1.5 w-1.5 rounded-full bg-success motion-safe:animate-pulse" />
                                {t('hero.roomLiveBadge')}
                            </span>
                        </div>

                        {/* Before/After showcase card */}
                        <div className="group relative overflow-hidden rounded-2xl border border-border/50 shadow-2xl shadow-foreground/10">
                            {/* Interactive image comparison slider */}
                            <div className="relative aspect-16/10">
                                <ImageCompare
                                    beforeSrc="/gallery/before-after-3a.jpg"
                                    afterSrc="/gallery/before-after-3b.jpg"
                                    beforeAlt={t('hero.mockBefore')}
                                    afterAlt={t('hero.mockAfter')}
                                    initialPosition={50}
                                    className="h-full w-full"
                                />

                                {/* Before label */}
                                <span className="pointer-events-none absolute bottom-2.5 left-2.5 z-20 rounded-md bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm sm:bottom-3 sm:left-3 sm:text-xs">
                                    {t('hero.mockBefore')}
                                </span>

                                {/* After label */}
                                <span className="pointer-events-none absolute bottom-2.5 right-2.5 z-20 rounded-md bg-primary/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground backdrop-blur-sm sm:bottom-3 sm:right-3 sm:text-xs">
                                    {t('hero.mockAfter')}
                                </span>
                            </div>

                            {/* Bottom bar with description + CTA */}
                            <div className="flex items-center justify-between gap-3 border-t border-border/40 bg-background/80 px-4 py-3 backdrop-blur-sm sm:px-5">
                                <p className="text-xs leading-snug text-muted-foreground sm:text-sm">
                                    {t('hero.roomDescription')}
                                </p>
                                <Link
                                    href={`${ROUTES.CONFIGURATOR.ROOT}?step=1&mode=reimagine`}
                                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:brightness-110 motion-safe:active:scale-[0.97]"
                                >
                                    {t('hero.roomCta')}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
