'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Armchair } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants/routes';

const COLOR_OPTIONS = [
    { id: 'cream',    label: 'Cream',    hex: '#F5F0E8', modifier: 0 },
    { id: 'charcoal', label: 'Charcoal', hex: '#3D3D3D', modifier: 10 },
    { id: 'sand',     label: 'Sand',     hex: '#C4A882', modifier: 0 },
    { id: 'forest',   label: 'Forest',   hex: '#4A5E4A', modifier: 25 },
    { id: 'rust',     label: 'Rust',     hex: '#B05A3A', modifier: 15 },
] as const;

const BASE_PRICE = 850;

function HeroConfiguratorCard(): React.JSX.Element {
    const [selectedColor, setSelectedColor] = useState<string>('cream');

    const activeColor = COLOR_OPTIONS.find((c) => c.id === selectedColor) ?? COLOR_OPTIONS[0];
    const total = BASE_PRICE + activeColor.modifier;

    return (
        <div className="relative w-full overflow-hidden rounded-2xl border border-[--border-crisp] bg-[--surface-enamel] p-5 shadow-xl shadow-foreground/10">
            {/* Glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-px -z-10 rounded-2xl opacity-40"
                style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, oklch(0.546 0.245 262.881 / 0.15), transparent)' }}
            />

            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Armchair className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Custom Furniture — Try Live</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-wide text-primary">Interactive</span>
                </div>
            </div>

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                {/* Product visual */}
                <div
                    className="flex aspect-square w-full max-w-45 shrink-0 items-center justify-center self-center rounded-xl border border-border/30 transition-colors duration-500 sm:self-auto"
                    style={{ backgroundColor: activeColor.hex + '33' }}
                >
                    <Armchair
                        className="h-20 w-20 transition-colors duration-500"
                        style={{ color: activeColor.hex }}
                    />
                </div>

                {/* Controls */}
                <div className="flex flex-1 flex-col gap-4">
                    <div>
                        <p className="mb-1 text-xs text-muted-foreground">3-Seater Linen Sofa — {activeColor.label}</p>
                        <div className="flex gap-2">
                            {COLOR_OPTIONS.map((color) => (
                                <button
                                    key={color.id}
                                    onClick={() => setSelectedColor(color.id)}
                                    title={color.label}
                                    aria-label={`Select ${color.label}`}
                                    aria-pressed={selectedColor === color.id}
                                    className={cn(
                                        'h-7 w-7 rounded-full border-2 transition-all duration-200',
                                        selectedColor === color.id
                                            ? 'border-primary ring-2 ring-primary/30 scale-110'
                                            : 'border-border/50 hover:border-border hover:scale-105',
                                    )}
                                    style={{ backgroundColor: color.hex }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex items-end justify-between border-t border-border/40 pt-4">
                        <div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-bold tabular-nums text-foreground">
                                    ${total.toLocaleString()}
                                </span>
                                {activeColor.modifier > 0 && (
                                    <span className="text-xs text-muted-foreground">+${activeColor.modifier} color</span>
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground">incl. delivery &amp; assembly</span>
                        </div>
                        <Button asChild size="sm" className="gap-1.5 motion-safe:transition-transform motion-safe:active:scale-[0.98]">
                            <Link href={ROUTES.CONFIGURATOR.ROOT}>
                                Customize yours
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function HeroSection(): React.JSX.Element {
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
                                AI-Powered Furniture Design
                            </span>
                        </div>

                        {/* Headline — dramatic typographic hierarchy */}
                        <h1
                            className="text-[2.6rem] font-bold leading-[1.08] tracking-[-0.03em] text-foreground md:text-5xl lg:text-[3.2rem] xl:text-[3.8rem]"
                            style={{ fontFamily: 'var(--font-display)' }}
                        >
                            Design Your{' '}
                            <br className="hidden sm:block" />
                            Perfect{' '}
                            <em
                                className="not-italic text-primary"
                                style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    fontWeight: 300,
                                    letterSpacing: '-0.01em',
                                }}
                            >
                                Furniture
                            </em>
                            <br className="hidden sm:block" />
                            {' '}in Minutes
                        </h1>

                        {/* Subtitle */}
                        <p className="mt-6 max-w-sm text-base leading-[1.7] text-muted-foreground lg:text-[0.95rem]">
                            Upload your room, choose a style — watch AI transform it.
                            Then customize with real-time pricing.
                        </p>

                        {/* CTAs */}
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                            {/* Primary — solid espresso, arrow slides on hover */}
                            <Link
                                href={ROUTES.CONFIGURATOR.ROOT}
                                className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 motion-safe:active:scale-[0.97] motion-safe:active:translate-y-0"
                                style={{ fontFamily: 'var(--font-display)' }}
                            >
                                Start Designing
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
                                Create free account
                            </Link>
                        </div>

                        {/* Social proof micro-text */}
                        <div className="mt-8 flex items-center gap-4 border-t border-border/50 pt-6">
                            {[
                                { stat: '1,200+', label: 'orders delivered' },
                                { stat: '4.9★',   label: 'customer rating' },
                                { stat: '3 wks',  label: 'avg. delivery' },
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

                    {/* ── Right column: showcase placeholder ────────────── */}
                    <div className="flex-1 min-w-0">
                        {/* Slider label row */}
                        <div className="mb-3 flex items-center justify-between">
                            <span
                                className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground"
                                style={{ fontFamily: 'var(--font-display)' }}
                            >
                                AI Room Transformation
                            </span>
                        </div>

                        {/* TODO: Restore BeforeAfterSlider once room-redesign feature is rebuilt */}
                        <div className="flex aspect-[16/10] items-center justify-center rounded-2xl border border-border/50 bg-muted/30 shadow-2xl shadow-foreground/10">
                            <div className="text-center">
                                <p className="text-sm font-semibold text-foreground">AI Room Preview</p>
                                <p className="mt-1 text-xs text-muted-foreground">Coming soon</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Mini configurator card (below the fold) ───────────── */}
                <div className="mx-auto mt-10 max-w-4xl">
                    <HeroConfiguratorCard />
                </div>
            </div>
        </section>
    );
}
