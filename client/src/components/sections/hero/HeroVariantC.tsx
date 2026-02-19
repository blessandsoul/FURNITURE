'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkle, Lightning, Armchair } from '@phosphor-icons/react';
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
        <div className="relative w-full max-w-sm rounded-2xl border border-[--border-crisp] bg-[--surface-enamel] p-5 shadow-xl shadow-foreground/10 backdrop-blur-md">
            {/* Glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-px -z-10 rounded-2xl opacity-50"
                style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, oklch(0.546 0.245 262.881 / 0.15), transparent)' }}
            />

            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Armchair className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Custom Sofa</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-wide text-primary">Live</span>
                </div>
            </div>

            {/* Product visual */}
            <div
                className="flex aspect-[4/3] items-center justify-center rounded-xl border border-border/30 transition-colors duration-500"
                style={{ backgroundColor: activeColor.hex + '33' }}
            >
                <div className="flex flex-col items-center gap-3">
                    <Armchair
                        className="h-20 w-20 transition-colors duration-500"
                        style={{ color: activeColor.hex }}
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                        {activeColor.label} — 3-Seater Linen
                    </span>
                </div>
            </div>

            {/* Color picker */}
            <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Color</span>
                    <span className="text-xs font-semibold text-foreground">{activeColor.label}</span>
                </div>
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

            {/* Price */}
            <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-4">
                <div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold tabular-nums text-foreground transition-all duration-300">
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
                        Try live
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}

export function HeroVariantC(): React.JSX.Element {
    return (
        <section className="relative overflow-hidden px-4 py-20">
            {/* Background */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                    backgroundImage: `
                        radial-gradient(ellipse 80% 60% at 50% -20%, oklch(0.546 0.245 262.881 / 0.08) 0%, transparent 70%),
                        radial-gradient(ellipse 60% 40% at 80% 80%, oklch(0.705 0.213 47.604 / 0.06) 0%, transparent 60%)
                    `,
                }}
            />

            <div className="container mx-auto">
                {/* ── Top: text left + card right ───────────────────────── */}
                <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">

                    {/* Left — text */}
                    <div className="flex flex-col items-center text-center lg:flex-1 lg:items-start lg:text-left">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[--border-crisp] bg-[--surface-enamel] px-3.5 py-1.5 shadow-[--shadow-enamel] backdrop-blur-md">
                            <Sparkle className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-semibold text-foreground">AI-Powered Furniture Design</span>
                        </div>

                        <h1 className="max-w-xl text-balance text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
                            Design Your Perfect{' '}
                            <span className="text-primary">Furniture</span>{' '}
                            in Minutes
                        </h1>

                        <p className="mt-6 max-w-md text-balance text-lg leading-relaxed text-muted-foreground">
                            Pick a style, choose your materials and colors, and watch AI bring
                            your custom furniture to life — with real-time pricing.
                        </p>

                        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
                            <Button asChild size="lg" className="gap-2 px-8 motion-safe:transition-transform motion-safe:active:scale-[0.98]">
                                <Link href={ROUTES.CONFIGURATOR.ROOT}>
                                    Start Designing
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="gap-2">
                                <Link href={ROUTES.REGISTER}>Create Free Account</Link>
                            </Button>
                        </div>

                        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                            {['No design skills needed', 'Real-time pricing', '8 furniture types', 'Instant preview'].map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-[--border-crisp] bg-[--surface-enamel] px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-md"
                                >
                                    <Lightning className="h-3 w-3 text-primary" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Right — interactive mini-configurator card */}
                    <div className="flex w-full justify-center lg:flex-1">
                        <HeroConfiguratorCard />
                    </div>
                </div>

                {/* ── Bottom: before/after placeholder ─────────────────── */}
                {/* TODO: Restore BeforeAfterSlider once room-redesign feature is rebuilt */}
                <div className="mt-16">
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">Room Reimagine — AI in action</p>
                    </div>
                    <div className="flex aspect-[16/10] items-center justify-center rounded-2xl border border-border/50 bg-muted/30 shadow-2xl">
                        <div className="text-center">
                            <p className="text-sm font-semibold text-foreground">AI Room Preview</p>
                            <p className="mt-1 text-xs text-muted-foreground">Coming soon</p>
                        </div>
                    </div>
                    <p className="mt-3 text-center text-xs text-muted-foreground">
                        Before &amp; after comparison coming soon
                    </p>
                </div>
            </div>
        </section>
    );
}
